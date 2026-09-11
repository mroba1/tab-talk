'use strict';

// Server-side copy of the merchant catalog — mirrors src/data/merchants.ts in
// the Expo app. Merchants themselves stay bundled with the app (they're
// static reference data, not something that needs cross-device sync), but
// the server needs its own copy to compute order totals, look up product
// prices, and generate the auto-reply bot's responses.

const CENTER = { latitude: 30.2672, longitude: -97.7431 };

const MERCHANTS = [
  {
    id: 'sweet-crumb',
    name: 'Sweet Crumb Bakery',
    products: [
      { id: 'p1', name: 'Custom Cake', price: 35 },
      { id: 'p2', name: 'Dozen Cookies', price: 18 },
      { id: 'p3', name: 'Loaf Bread', price: 7 },
    ],
  },
  {
    id: 'fix-it',
    name: 'Fix-It Repairs',
    products: [
      { id: 'p1', name: 'Service Call', price: 25 },
      { id: 'p2', name: 'Leak Repair', price: 65 },
      { id: 'p3', name: 'Appliance Check', price: 40 },
    ],
  },
  {
    id: 'luz-tailoring',
    name: 'Luz Tailoring',
    products: [
      { id: 'p1', name: 'Hemming', price: 12 },
      { id: 'p2', name: 'Suit Alteration', price: 45 },
      { id: 'p3', name: 'Custom Fit', price: 80 },
    ],
  },
  {
    id: 'casa-verde',
    name: 'Casa Verde Grocery',
    products: [
      { id: 'p1', name: 'Produce Box', price: 22 },
      { id: 'p2', name: 'Pantry Bundle', price: 30 },
      { id: 'p3', name: 'Delivery Order', price: 15 },
    ],
  },
  {
    id: 'glow-beauty',
    name: 'Glow Beauty Bar',
    products: [
      { id: 'p1', name: 'Signature Facial', price: 65 },
      { id: 'p2', name: 'Brow Shaping', price: 25 },
      { id: 'p3', name: 'Skincare Consult', price: 20 },
    ],
  },
  {
    id: 'stitch-co',
    name: 'Stitch & Co Fashion',
    products: [
      { id: 'p1', name: 'Custom Order', price: 50 },
      { id: 'p2', name: 'Tote Bag', price: 28 },
      { id: 'p3', name: 'Basics Bundle', price: 45 },
    ],
  },
  {
    id: 'bright-home',
    name: 'Bright Home Cleaning',
    products: [
      { id: 'p1', name: 'Studio Clean', price: 60 },
      { id: 'p2', name: '1-2 Bed Clean', price: 90 },
      { id: 'p3', name: 'Deep Clean', price: 140 },
    ],
  },
  {
    id: 'annas-grooming',
    name: "Anna's Pet Grooming",
    products: [
      { id: 'p1', name: 'Basic Groom', price: 35 },
      { id: 'p2', name: 'Full Groom', price: 55 },
      { id: 'p3', name: 'Nail Trim', price: 12 },
    ],
  },
  {
    id: 'corner-coffee',
    name: 'Corner Coffee Roasters',
    products: [
      { id: 'p1', name: 'Coffee Bag', price: 16 },
      { id: 'p2', name: 'Event Brew Box', price: 55 },
      { id: 'p3', name: 'Espresso Drink', price: 5 },
    ],
  },
  {
    id: 'rosas-kitchen',
    name: "Rosa's Kitchen",
    products: [
      { id: 'p1', name: 'Family Combo', price: 32 },
      { id: 'p2', name: 'Catering Tray', price: 85 },
      { id: 'p3', name: 'Weekly Plate', price: 12 },
    ],
  },
  {
    id: 'fade-king',
    name: 'Fade King Barbershop',
    products: [
      { id: 'p1', name: 'Haircut', price: 30 },
      { id: 'p2', name: 'Haircut + Beard', price: 45 },
      { id: 'p3', name: 'Kids Cut', price: 20 },
    ],
  },
  {
    id: 'pixelfix-mobile',
    name: 'PixelFix Phone Repair',
    products: [
      { id: 'p1', name: 'Screen Repair', price: 79 },
      { id: 'p2', name: 'Battery Replacement', price: 49 },
      { id: 'p3', name: 'Diagnostic', price: 0 },
    ],
  },
  {
    id: 'volt-electric',
    name: 'Volt Electric Co',
    products: [
      { id: 'p1', name: 'Service Call', price: 40 },
      { id: 'p2', name: 'Outlet Install', price: 65 },
      { id: 'p3', name: 'Light Fixture Install', price: 55 },
    ],
  },
];

function getMerchant(id) {
  return MERCHANTS.find((m) => m.id === id);
}

module.exports = { MERCHANTS, getMerchant, CENTER };
