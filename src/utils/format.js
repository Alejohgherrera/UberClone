export function formatCOP(value) {
  if (value === null || value === undefined) return '—';
  return `$${Math.round(value).toLocaleString('es-CO')} COP`;
}

export const CATEGORY_LABELS = {
  economy: 'Económico',
  xl: 'XL',
  premium: 'Premium',
};

export const PAYMENT_STATUS_LABELS = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  cash: 'Efectivo',
};

export const PAYMENT_LABELS = {
  mercadopago: 'Mercado Pago',
  stripe: 'Tarjeta (Stripe)',
  cash: 'Efectivo',
};
