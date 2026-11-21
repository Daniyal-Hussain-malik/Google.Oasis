import { media } from '@/src/lib/api';

export const WHATSAPP_URL = 'https://wa.me/923445537788';

export const photos = {
  wide: '/photos/cottages-wide.jpg',
  row: '/photos/cottages-row.jpg',
  cloud: '/photos/cottages-cloud.jpg',
  snow: '/photos/cottages-snow.jpg',
  panorama: '/photos/cottages-panorama.jpg',
  jeep: '/photos/evening-jeep.jpg',
  bonfire: '/photos/bonfire.jpg',
  night: '/photos/night-grounds.jpg',
  breakfast: '/photos/breakfast.jpg',
  executive: '/photos/executive-room.jpg',
  deluxeDay: '/photos/deluxe-day.jpg',
  deluxeNight: '/photos/deluxe-night.jpg',
  nook: '/photos/deluxe-nook.jpg',
  shangrila: '/photos/shangrila-lake.jpg',
  viewFromBed: '/photos/view-from-bed.jpg',
  roomChair: '/photos/room-chair.jpg',
  fire: '/photos/bonfire-fire.jpg',
  carved: '/photos/carved-bed.jpg',
  cafe: '/photos/cafe.jpg',
  roomNight: '/photos/room-night.jpg',
  windowChairs: '/photos/room-window-chairs.jpg',
  winter: '/photos/winter-huts.jpg',
  tv: '/photos/room-tv.jpg',
  redTv: '/photos/room-red-tv.jpg',
  lounge: '/photos/room-lounge.jpg',
  redRoom: '/photos/room-red.jpg',
  stars: '/photos/stargazing.jpg',
};

export const official = {
  desertK2: '/photos/official/desert-k2.jpg',
  landscape: '/photos/official/resort-landscape.jpg',
  view: '/photos/official/view-from-resort.jpg',
  aerial: '/photos/official/aerial.jpg',
  rooms: '/photos/official/rooms-row.jpg',
  balcony: '/photos/official/stargazer-balcony.jpg',
  executive: '/photos/official/executive.jpg',
  window: '/photos/official/room-window.jpg',
  interior: '/photos/official/room-interior.jpg',
  cottage: '/photos/official/cottage.jpg',
  cottageNight: '/photos/official/cottage-night.jpg',
  jeep: '/photos/official/jeep-safari.jpg',
  stars: '/photos/official/stars-desert.jpg',
  camel: '/photos/official/camel-sunset.jpg',
  stargazing: '/photos/official/stargazing.jpg',
};

export const gallery: Array<[string, string]> = [
  [official.desertK2, 'Sunset on the Katpana dunes, with the peaks behind the resort'],
  [official.landscape, 'The resort and the cold desert'],
  [official.aerial, 'The grounds from above'],
  [official.view, 'The view from the resort'],
  [official.balcony, 'A balcony over the desert'],
  [official.rooms, 'The room row'],
  [official.executive, 'An executive room'],
  [official.cottage, 'A cottage at the resort'],
  [official.jeep, 'A jeep for the dune safari'],
  [official.stars, 'The desert after dark'],
  [official.camel, 'A sunset walk on the sand'],
  [photos.winter, 'Six huts under the snow ridge'],
  [photos.wide, 'Glass-fronted huts on the snow, with the Karakoram behind Katpana'],
  [photos.panorama, 'The full row of huts in winter'],
  [photos.row, 'The hut row facing the dune'],
  [photos.snow, 'Winter light along the red roofs'],
  [photos.cloud, 'The same huts when the desert is bare'],
  [photos.deluxeDay, 'Deluxe room in the morning'],
  [photos.viewFromBed, 'The dune from the bed'],
  [photos.windowChairs, 'Armchairs at the valley window'],
  [photos.lounge, 'The sitting corner and the kilim'],
  [photos.nook, 'The window seat'],
  [photos.roomChair, 'Carved bed, chair, and the television'],
  [photos.deluxeNight, 'The room after dark'],
  [photos.roomNight, 'Terrace doors after dark'],
  [photos.redRoom, 'The red-wall room'],
  [photos.carved, 'Detail of the carved bed'],
  [photos.breakfast, 'Breakfast sent to the room'],
  [photos.cafe, 'Picnic tables at the outdoor cafe'],
  [photos.fire, 'The bonfire on the sand'],
  [photos.bonfire, 'Lights between the huts'],
  [photos.night, 'The huts lit after dark'],
  [photos.stars, 'The sky above the desert'],
  [photos.shangrila, 'Shangrila Lake at Lower Kachura, a day out from the resort'],
];

const stayOverrides = [
  {
    match: /executive/i,
    image: '/photos/official/executive.jpg',
    description: 'Two armchairs at the valley window, a kilim, and the television on the side wall. Breakfast is included.',
    amenities: ['Valley view', 'King bed', 'Carved wood', 'Heater', 'Breakfast included'],
  },
  {
    match: /premium/i,
    image: '/photos/official/cottage.jpg',
    description: 'The red-wall room: a carved bed, a kilim, and air conditioning. An extra mattress is PKR 2,500 if you ask the desk ahead.',
    amenities: ['Terrace doors', 'King bed', 'Oasis linen', 'Heater', 'Extra mattress on request'],
  },
  {
    match: /family/i,
    image: photos.redRoom,
    description: 'Room for four adults and three children: a carved king bed, a second bed, a kilim, and the heater already on in winter.',
    amenities: ['Terrace doors', 'King and twin beds', 'Oasis linen', 'Heater', 'Extra mattress on request'],
  },
  {
    match: /twin|superior/i,
    image: photos.roomChair,
    description: 'A carved bed, a chair, and a television. The quieter hut on the row, with the same breakfast as the rest of the house.',
    amenities: ['Valley window', 'Twin beds', 'Heater', 'Tea tray', 'Breakfast included'],
  },
  {
    match: /deluxe/i,
    image: '/photos/official/room-window.jpg',
    description: 'The dune and the ridge are the view from the bed. Yellow curtains, two chairs, and breakfast included.',
    amenities: ['Valley view', 'King bed', 'Carved wood', 'Heater', 'Breakfast included'],
  },
];

export function presentStay(room: any) {
  if (!room) return room;
  const hit = stayOverrides.find((item) => item.match.test(room.name || ''));
  const next = { ...room };
  if ((!room.image || room.image.includes('unsplash.com')) && hit) next.image = hit.image;
  if (!room.description && hit) next.description = hit.description;
  if ((!room.amenities || !room.amenities.length) && hit) next.amenities = hit.amenities;
  next.image = media(next.image);
  return next;
}

export interface EditorialItem {
  slug: string;
  title: string;
  kicker: string;
  image: string;
  summary: string;
  body: string;
  book?: boolean;
  authorName?: string;
  publishedAt?: string;
}

export const places: EditorialItem[] = [
  {
    slug: 'katpana',
    title: 'Katpana, at the door',
    kicker: 'The desert',
    image: photos.wide,
    summary: 'The dune starts where the hut path ends. In winter it is snow. Later in the year it is sand.',
    body: 'Oasis sits on the edge of the Katpana cold desert, about fifteen minutes from Skardu airport. The huts face the dune, and the Karakoram sits behind them. You do not need a car to be in the landscape. Walk out from the terrace. If the wind is up, the desk will say so at breakfast and point you to the sheltered side.',
  },
  {
    slug: 'shangrila',
    title: 'Shangrila Lake',
    kicker: 'A day out',
    image: photos.shangrila,
    summary: 'Lower Kachura. Red roofs on the water, pine behind them, and a boat if the lake is calm.',
    body: 'This is not the resort. Shangrila is a drive from Katpana, and it is the outing guests ask for most. The desk books the jeep in the morning and tells you how long to keep for the lake and the road back. Lunch there is on you. You are home before the bonfire is laid.',
  },
  {
    slug: 'airport-road',
    title: 'The airport road',
    kicker: 'Arriving',
    image: photos.row,
    summary: 'Fifteen minutes from Skardu International Airport, on the road toward the desert.',
    body: 'On a stay of three nights or more the desk sends a car to the airport. Shorter stays can still request one, and that car is charged. The road is straightforward in daylight. In winter, tell us your flight number so the driver waits if you are late. The huts are the ones with the red roofs on the desert edge.',
  },
  {
    slug: 'after-dark',
    title: 'The desert after dark',
    kicker: 'If you stay in',
    image: photos.night,
    summary: 'Lights between the huts, and a sky that does not need a drive.',
    body: 'Most evenings the best place is the sand in front of the row. The desk sets chairs and a low table. A fire is laid if you asked by six. There is no second venue and no ticket. If the wind is too strong, the evening moves inside and the kitchen still sends dinner to the room.',
  },
];

export const experiences: EditorialItem[] = [
  {
    slug: 'breakfast',
    title: 'Breakfast at the hut',
    kicker: 'Every morning',
    image: photos.breakfast,
    summary: 'Eggs, toast, tea, and jam. Included with the stay, brought to the room if you ask.',
    body: 'Breakfast is in the rate. The tray is the one the kitchen actually sends: fried eggs, an omelette if you prefer, toast, tea, and jam. Say the night before if you want it at a time, or if someone in the room does not eat eggs. Lunch and dinner are charged and can post to the room bill.',
  },
  {
    slug: 'jeep-safari',
    title: 'Jeep at the door',
    kicker: 'Afternoons',
    image: photos.jeep,
    summary: 'A loop through the dunes. The desk books the jeep for the hour you name.',
    body: 'The jeep waits by the hut, not in a car park in town. Tell reception which afternoon, and how many of you are going. The charge posts to the folio the way room service does. In snow the route is shorter and the driver decides what is safe. Sandboarding boards are at the desk if you would rather walk the dune than ride.',
  },
  {
    slug: 'bonfire',
    title: 'Fire on the sand',
    kicker: 'After six',
    image: photos.bonfire,
    summary: 'Chairs, a low table, and a fire if the wind allows. Ask by six.',
    body: 'The bonfire is laid on the dune side of the huts. It is not every night and it is not a ticket. Tell the desk by six so there is wood and enough chairs. Dinner can be served out there, or in the room if the weather turns. Children stay with the people named on the booking.',
  },
  {
    slug: 'shangrila-day',
    title: 'A day at Shangrila',
    kicker: 'Lower Kachura',
    image: photos.shangrila,
    summary: 'The lake with the red roofs. The house arranges the jeep. Lunch is yours.',
    body: 'Leave after breakfast. The drive is the point as much as the lake. The desk writes the return time on your note so the evening fire is still an option. This outing is charged. It does not include a boat or a meal at the lake.',
  },
];

export const offers: EditorialItem[] = [
  {
    slug: 'winter-stay',
    title: 'Winter on the dune',
    kicker: 'Cold months',
    image: photos.panorama,
    summary: 'The direct winter rate, breakfast included, on the huts that face the snow.',
    body: 'Book on this site and mention the winter offer in the notes. The desk applies the public winter rate before you arrive. It does not combine with a corporate code. Heating is already in the room. The road from the airport is fine in daylight. Send the flight number if you want the car to wait.',
    book: true,
  },
  {
    slug: 'three-nights',
    title: 'Three nights, airport car included',
    kicker: 'Stay longer',
    image: photos.row,
    summary: 'From the third night, pick-up from Skardu airport is included.',
    body: 'The car is for the people named on the booking, from the airport to the resort and back on the day you leave. A stay of one or two nights can still request a car, and that ride is charged. Mention this offer when you book so the desk holds the driver.',
    book: true,
  },
  {
    slug: 'executive-hut',
    title: 'The executive room',
    kicker: 'The valley window',
    image: photos.executive,
    summary: 'The carved room, breakfast, and a late checkout until two if the hut is free the next day.',
    body: 'Late checkout is a request, not a promise. The desk confirms it the evening before you leave. The rate on the booking page is the public rate. Mention this offer in the notes and choose the executive room.',
    book: true,
  },
  {
    slug: 'long-weekend',
    title: 'Friday to Monday',
    kicker: 'Weekend',
    image: photos.deluxeNight,
    summary: 'A long weekend in the hut, with dinner on Sunday posted to the room bill.',
    body: 'Weekend rates already price Saturday and Sunday. This offer adds Sunday dinner for the people on the booking. It is the kitchen’s menu, not a banquet. Mention it in the notes so the cook knows the headcount.',
    book: true,
  },
];

export const restaurants: EditorialItem[] = [
  {
    slug: 'breakfast',
    title: 'Breakfast',
    kicker: 'Included',
    image: photos.breakfast,
    summary: 'Eggs, toast, tea, and jam. In the restaurant, or on a tray at the hut.',
    body: 'Breakfast is included. Tell the desk the night before if you want it at a fixed time, or if you need it brought to the room. The plate is simple on purpose: eggs, toast, tea, jam, and fruit when the market has it. Children eat from the same kitchen.',
  },
  {
    slug: 'evening-table',
    title: 'Dinner on the sand',
    kicker: 'When the wind allows',
    image: photos.bonfire,
    summary: 'The outdoor table between the huts. The same kitchen, under the lights.',
    body: 'On a calm evening the table is set outside. Karahi, daal, and whatever the cook has that day. Tell us about allergies at breakfast, not at the table. The bill posts to the room. If the wind is up, dinner is served indoors and the desk will say so.',
  },
  {
    slug: 'room-service',
    title: 'A tray to the hut',
    kicker: 'Until eleven',
    image: photos.nook,
    summary: 'The same kitchen, brought to the room. It posts to the folio before you sleep.',
    body: 'Call the desk or order online using your booking number. Breakfast can come this way at no extra charge. Lunch and dinner are charged. If you are not in house, the tray is not available.',
  },
];

export const journals: EditorialItem[] = [
  {
    slug: 'the-huts',
    title: 'Red roofs on the snow',
    kicker: 'The grounds',
    image: photos.wide,
    summary: 'Nineteen rooms on about 165 kanals, fifteen minutes from the airport, facing the dune.',
    body: 'The huts are glass at the front and stone at the base. In winter the desert is white and the ridge behind it is the first thing you see from the bed. Later in the year the same ground is sand. The resort does not pretend to be a city hotel. There is one kitchen, one desk, and a book that holds the room you chose on this site.',
  },
  {
    slug: 'what-we-cook',
    title: 'What arrives on the tray',
    kicker: 'Kitchen',
    image: photos.breakfast,
    summary: 'Breakfast is eggs, toast, tea, and jam. Dinner is whatever the cook can stand behind that night.',
    body: 'We do not print a long menu the kitchen cannot keep at this distance from town. Breakfast is included and it is the plate in the photograph. Dinner is karahi, daal, and rice, inside or on the sand. If you need something plain for a child, say so at breakfast. That is easier than a second menu. Lunch and dinner post to the room bill.',
  },
  {
    slug: 'booking-direct',
    title: 'Why the rate on this site is the rate',
    kicker: 'The desk',
    image: photos.cloud,
    summary: 'The public price is the best price we publish. A member does not see a secret lower one.',
    body: 'Agencies sell the same huts and keep a commission. If you find a lower public rate for the same room and the same dates, tell the desk before you arrive and we will match it. That is the whole of the guarantee.',
  },
];

export const wellness = [
  {
    title: 'Heat, then quiet',
    body: 'In winter the heater is on before you arrive. The curtains on the valley window are heavy enough to sleep through a bright snow morning. If you want the hut at the end of the row, say so in the booking notes.',
  },
  {
    title: 'Morning on the dune',
    body: 'The path in front of the huts is the walk. Nobody instructs you. In snow, boots matter more than a yoga mat. The desk will say if the wind makes the open side unpleasant.',
  },
  {
    title: 'Sleep',
    body: 'The rooms face the desert, not a road. A request for a quieter hut is a note on the booking, honoured when that hut is free. Check-in is from 2:00 PM, so the room is made before you land.',
  },
];

export const faqs: Array<[string, string]> = [
  ['How far are you from Skardu airport?', 'About fifteen minutes by road, along the Katpana cold desert edge. For stays of three nights or more, airport pick-up is complimentary.'],
  ['Is breakfast included in the room rate?', 'Yes, breakfast is included in every room rate—served in the dining hall or sent on a tray to your hut.'],
  ['Are the huts heated in winter?', 'Yes. Every hut is heated and staff turn the room heaters on before your arrival during colder months.'],
  ['Can we order food to our room?', 'Yes. Once checked in, use the Order Food portal with your booking number and phone, or call the desk. Charges can post straight to your room folio.'],
  ['What is the cancellation policy?', 'Cancellation is free until 48 hours before arrival. Inside 48 hours, the first night is charged.'],
  ['How do Easypaisa and bank transfer payments work?', 'Book your stay first to lock your room, then send your payment and submit the Transaction ID (TID) on the confirmation or lookup page. Our desk verifies and posts it to your folio.'],
  ['Do you have a step-free accessible room?', 'Room 101 (Deluxe Hut) is step-free. Mention it in your booking notes so the desk prioritizes it.'],
];

export const defaultReviews: Array<[string, string]> = [
  ['Saad A. · Islamabad', 'Waking up with the Katpana snow dunes right outside the glass windows was surreal. Heater was already warm on arrival.'],
  ['Mariam K. · Lahore', 'Booked directly on the site and got our three-night airport transfer. Chicken karahi by the evening bonfire made the trip.'],
  ['Zohaib R. · Karachi', 'Quiet, clean, and genuinely close to the desert without feeling touristy. Room service to the hut was fast.'],
];

export const policies: Record<string, { title: string; body: string[] }> = {
  terms: {
    title: 'Terms of stay',
    body: [
      'A booking on this site holds a specific room in our own book. Check-in is from 2:00 PM. Check-out is by 12:00 PM unless the desk has agreed a later time.',
      'Cancellation is free until 48 hours before arrival. After that, the first night is charged. A reservation that is not checked in by the night audit is a no-show and the same charge applies.',
      'The name on the booking should be a guest who will stay. Every adult shows an identity document at the desk. Guests who are not Pakistani also show a visa.',
      'Charges from the dining room, laundry, and the minibar post to the room bill. You settle once, at checkout.',
    ],
  },
  privacy: {
    title: 'Privacy',
    body: [
      'We keep the name, phone, email, and identity details you give us so we can hold the room and meet guest-registration rules.',
      'Card numbers are never collected or stored by Oasis Resort.',
      'You can ask the desk for a copy of what we hold, or for deletion where tax rules allow it.',
    ],
  },
  cookies: {
    title: 'Cookies',
    body: [
      'The site stores your language preference and saved booking shortcuts in your browser storage only.',
      'We do not run third-party advertising cookies or sell guest lists.',
    ],
  },
  cancellation: {
    title: 'Cancellation policy',
    body: [
      'You can cancel free of charge until 48 hours before the day of arrival.',
      'Inside 48 hours, the first night is charged. Write to oasisresortskardu@gmail.com or WhatsApp the desk with your booking number.',
    ],
  },
  refund: {
    title: 'Refund policy',
    body: [
      'A deposit paid by bank transfer or Easypaisa is held against the stay. If you cancel inside the free window, the desk refunds it via the same channel.',
      'Refunds are approved by a manager and recorded in the audit log.',
    ],
  },
  'best-rate': {
    title: 'Best rate guarantee',
    body: [
      'The rate on this website for a room type and dates is the lowest public rate we offer.',
      'If you find a lower public rate for the exact same dates and room, email oasisresortskardu@gmail.com before arrival and we will match it.',
    ],
  },
};
