import { createClient } from 'npm:@supabase/supabase-js@2';

const STATUS_MAP: Record<string, string> = {
  approved: 'approved',
  rejected: 'rejected',
  cancelled: 'rejected',
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  let type = url.searchParams.get('type') ?? url.searchParams.get('topic');
  let paymentId = url.searchParams.get('data.id') ?? url.searchParams.get('id');

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      type = body?.type ?? type;
      paymentId = body?.data?.id ?? paymentId;
    } catch {
      // Mercado Pago a veces envía la notificación solo en la URL
    }
  }

  if (type !== 'payment' || !paymentId) return new Response('ignored', { status: 200 });

  // Se consulta el pago directamente a Mercado Pago, así nadie puede falsificar el estado
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}` },
  });

  if (!response.ok) return new Response('payment not found', { status: 200 });

  const payment = await response.json();
  const paymentStatus = STATUS_MAP[payment.status] ?? 'pending';

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const update: Record<string, string> = {
    payment_method: 'mercadopago',
    payment_id: String(payment.id),
    payment_status: paymentStatus,
  };
  if (paymentStatus === 'approved') update.status = 'paid';

  await admin.from('trips').update(update).eq('id', payment.external_reference);

  return new Response('ok', { status: 200 });
});
