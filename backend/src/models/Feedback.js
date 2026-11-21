import { Base, D, bool, fk, text } from './_base.js';

// One rating per stay (the reservation is unique).
export class Feedback extends Base {}
Feedback.setup(
  {
    reservation: { ...fk('reservations', { required: true, onDelete: 'CASCADE' }), unique: true },
    bookingNumber: text({ len: 20, required: true }),
    guestName: text({ len: 120 }),
    rating: { type: D.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: text({ big: true }),
    published: bool(false),
  },
  { table: 'feedback' },
);

export default Feedback;
