import { Router } from 'express';
import { Op } from 'sequelize';
import { env } from '../config/env.js';
import { formLimit, insightLimit } from '../middleware/limits.js';
import Enquiry from '../models/Enquiry.js';
import Feedback from '../models/Feedback.js';
import Insight, { INSIGHT_TYPES } from '../models/Insight.js';
import MenuItem from '../models/MenuItem.js';
import Reservation from '../models/Reservation.js';
import RoomType from '../models/RoomType.js';
import Settings from '../models/Settings.js';
import { availability, createReservation, readStay } from '../services/booking.js';
import { bookingCreated, enquiryCreated, feedbackReceived } from '../services/notifications.js';
import { todayIn } from '../utils/dates.js';
import { badRequest, int, isEmail, notFound, phoneKey, text } from '../utils/http.js';
import { equalsNoCase } from '../utils/sql.js';

const router = Router();

router.get('/hotel', async (req, res) => {
  const settings = await Settings.current();
  res.json({
    name: settings.name,
    phone: settings.phone,
    phones: settings.phones,
    email: settings.email,
    whatsapp: settings.whatsapp,
    address: settings.address,
    checkInTime: settings.checkInTime,
    checkOutTime: settings.checkOutTime,
    policies: settings.policies,
    childPolicy: settings.childPolicy,
    currency: settings.currency,
    maxRoomsPerBooking: settings.maxRoomsPerBooking,
    businessDate: todayIn(env.timezone),
  });
});

router.get('/site', async (req, res) => {
  const settings = (await Settings.current()).toJSON();
  res.json({
    heroTitle: settings.heroTitle,
    heroLede: settings.heroLede,
    activities: settings.activities,
    facilities: settings.facilities.filter((facility) => facility.active),
    experiences: settings.experiences.filter((experience) => experience.active),
    // Only what a guest needs to send money. Disabled methods are left out.
    payments: {
      instructions: settings.payments.instructions,
      easypaisa: settings.payments.easypaisa.enabled ? settings.payments.easypaisa : null,
      bank: settings.payments.bank.enabled ? settings.payments.bank : null,
    },
  });
});

router.get('/room-types', async (req, res) => {
  res.json(await RoomType.findAll({ where: { active: true }, order: [['sortOrder', 'ASC'], ['baseRate', 'ASC']] }));
});

router.get('/room-types/:slug', async (req, res) => {
  const roomType = await RoomType.findOne({ where: { slug: req.params.slug, active: true } });
  if (!roomType) throw notFound('That room type is not listed.');
  res.json(roomType);
});

router.get('/menu', async (req, res) => {
  res.json(await MenuItem.findAll({ where: { available: true }, order: [['sortOrder', 'ASC'], ['category', 'ASC'], ['name', 'ASC']] }));
});

router.get('/reviews', async (req, res) => {
  const rows = await Feedback.findAll({ where: { published: true }, order: [['createdAt', 'DESC']], limit: 30 });
  res.json(rows.map((r) => ({ id: r._id, guestName: r.guestName, stayTitle: r.stayTitle || undefined, rating: r.rating, comment: r.comment, createdAt: r.createdAt })));
});

router.get('/availability', async (req, res) => {
  const settings = await Settings.current();
  const stay = readStay(req.query, settings, todayIn(env.timezone));
  res.json({ ...stay, results: await availability(stay) });
});

function readGuest(body) {
  const guest = {
    firstName: text(body.firstName, 60),
    lastName: text(body.lastName, 60),
    phone: text(body.phone, 30),
    email: text(body.email, 120).toLowerCase(),
  };
  guest.phoneKey = phoneKey(guest.phone);
  const errors = {};
  if (!guest.firstName) errors.firstName = 'First name is required.';
  if (!guest.lastName) errors.lastName = 'Last name is required.';
  if (guest.phoneKey.length < 10) errors.phone = 'Enter a phone number the desk can call.';
  if (!isEmail(guest.email)) errors.email = 'Enter a valid email address.';
  if (Object.keys(errors).length) throw badRequest(Object.values(errors)[0], errors);
  return guest;
}

router.post('/reservations', formLimit, async (req, res) => {
  const body = req.body || {};
  const settings = await Settings.current();
  const stay = readStay(body, settings, todayIn(env.timezone));
  const guest = readGuest(body);
  if (!body.roomTypeId) throw badRequest('Choose a room.');

  const specialRequests = text(body.specialRequests, 1000);
  const offer = (specialRequests.match(/^Offer:\s*(.+)$/m)?.[1] || '').trim().slice(0, 120);
  const reservation = await createReservation({
    stay,
    roomTypeId: body.roomTypeId,
    guest,
    specialRequests,
    offer,
    // Card payment is not offered: guests pay by Easypaisa or bank transfer and send a proof,
    // and staff add the payment once they have seen the money.
    paymentChoice: 'hotel',
  });
  bookingCreated(reservation);
  res.status(201).json(reservation.toPublic());
});

export async function findGuestBooking(body) {
  const bookingNumber = text(body.bookingNumber, 20).toUpperCase().replace(/\s/g, '');
  const key = phoneKey(body.phone);
  if (!bookingNumber || key.length < 10) throw badRequest('Enter the booking number and the phone number on the reservation.');
  const reservation = await Reservation.findOne({ where: { bookingNumber, guest_phoneKey: key } });
  // One message for both cases, so the form cannot be used to test booking numbers.
  if (!reservation) throw notFound('We could not find a booking with that number and phone.');
  return reservation;
}

router.post('/reservations/lookup', formLimit, async (req, res) => {
  const reservation = await findGuestBooking(req.body || {});
  res.json(reservation.toPublic());
});

router.post('/feedback', formLimit, async (req, res) => {
  const body = req.body || {};
  const rating = int(body.rating, 0);
  if (rating < 1 || rating > 5) throw badRequest('Choose a rating from 1 to 5.', { rating: 'Required' });

  // Verified post-checkout booking review flow (used from /booking lookup page).
  if (body.bookingNumber && body.phone) {
    const reservation = await findGuestBooking(body);
    if (reservation.status !== 'checked_out') throw badRequest('Feedback opens after checkout.');

    // One rating per stay: a second submission replaces the first.
    const data = { bookingNumber: reservation.bookingNumber, guestName: reservation.guestName, rating, comment: text(body.comment, 2000) };
    let feedback = await Feedback.findOne({ where: { reservation: reservation.id } });
    if (feedback) {
      feedback.set(data);
      await feedback.save();
    } else {
      feedback = await Feedback.create({ reservation: reservation.id, ...data });
    }
    feedbackReceived(feedback);
    return res.status(201).json({ ok: true, id: feedback._id, rating: feedback.rating });
  }

  // Open HomePage Guest Feedback flow (appears immediately in AdminFeedbackPage for management review).
  const guestName = text(body.guestName, 120);
  const email = text(body.email, 120).toLowerCase();
  const stayTitle = text(body.stayTitle, 120);
  const comment = text(body.comment, 2000);

  if (guestName.length < 2) throw badRequest('Please enter your name.', { guestName: 'Required' });
  if (email && !isEmail(email)) throw badRequest('Please enter a valid email address.', { email: 'Invalid' });
  if (comment.length < 5) throw badRequest('Please share a few words about your experience.', { comment: 'Required' });

  const recent = await Feedback.findOne({
    where: {
      reservation: null,
      guestName,
      rating,
      comment,
      createdAt: { [Op.gte]: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });
  if (recent) return res.status(200).json({ ok: true, id: recent._id, rating: recent.rating });

  const feedback = await Feedback.create({
    reservation: null,
    bookingNumber: 'HOMEPAGE',
    guestName,
    email,
    stayTitle,
    rating,
    comment,
    published: false,
  });
  feedbackReceived(feedback);
  res.status(201).json({ ok: true, id: feedback._id, rating: feedback.rating });
});

router.post('/enquiries', formLimit, async (req, res) => {
  const body = req.body || {};
  const enquiry = {
    topic: text(body.topic, 60) || 'General',
    name: text(body.name, 80),
    email: text(body.email, 120).toLowerCase(),
    phone: text(body.phone, 30),
    message: text(body.message, 3000),
  };
  if (enquiry.name.length < 2) throw badRequest('Add your name so the desk knows who wrote.', { name: 'Required' });
  if (!isEmail(enquiry.email)) throw badRequest('Enter a valid email address so the desk can reply.', { email: 'Invalid' });
  if (!enquiry.message) enquiry.message = `Please note this ${enquiry.topic.toLowerCase()} enquiry.`;

  // The same person pressing send twice should not create two enquiries.
  const recent = await Enquiry.findOne({
    where: {
      email: enquiry.email,
      message: enquiry.message,
      createdAt: { [Op.gte]: new Date(Date.now() - 10 * 60 * 1000) },
      [Op.and]: [equalsNoCase('topic', enquiry.topic)],
    },
  });
  if (recent) return res.status(200).json({ ok: true, id: recent._id });

  const created = await Enquiry.create(enquiry);
  enquiryCreated(created);
  res.status(201).json({ ok: true, id: created._id });
});

router.post('/insights', insightLimit, async (req, res) => {
  const body = req.body || {};
  const sessionId = text(body.sessionId, 64);
  if (!sessionId || !INSIGHT_TYPES.includes(body.type)) return res.status(204).end();
  await Insight.create({
    sessionId,
    type: body.type,
    path: text(body.path, 200),
    roomName: text(body.roomName, 120),
    dwellMs: Math.max(0, Math.min(int(body.dwellMs, 0), 1000 * 60 * 60 * 6)),
    reason: text(body.reason, 40),
    note: text(body.note, 300),
  });
  res.status(204).end();
});

export default router;
