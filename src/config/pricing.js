export const COMMISSION_RATE = 0.2;

export const PRICING = {
  baseFare: 3500,
  perKm: 1200,
  perMinute: 250,
  minimumFare: 6000,
};

export const CATEGORY_MULTIPLIERS = {
  economy: 1.0,
  xl: 1.4,
  premium: 1.8,
};

export const VEHICLE_TO_TRIP_CATEGORY = {
  Económico: 'economy',
  XL: 'xl',
  Premium: 'premium',
};

function roundTo100(value) {
  return Math.round(value / 100) * 100;
}

export function calculateFare({ distanceKm, durationMin, category, tip = 0 }) {
  const multiplier = CATEGORY_MULTIPLIERS[category] ?? 1;
  const subtotal =
    PRICING.baseFare + distanceKm * PRICING.perKm + durationMin * PRICING.perMinute;

  const fare = roundTo100(Math.max(subtotal * multiplier, PRICING.minimumFare));
  const commission = Math.round(fare * COMMISSION_RATE);

  return {
    fare,
    commission,
    tip,
    driverEarnings: fare - commission + tip,
    commissionRate: COMMISSION_RATE,
  };
}
