import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { tripId } = await req.json();
    if (!tripId) return json({ error: 'Falta el viaje.' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });

    const { data: trip } = await supabase
      .from('trips')
      .select('id, fare, tip, status')
      .eq('id', tripId)
      .maybeSingle();

    if (!trip) return json({ error: 'Viaje no encontrado.' }, 404);
    if (trip.status !== 'completed') return json({ error: 'El viaje no está listo para cobrar.' }, 400);

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title: 'Viaje UberClone',
            quantity: 1,
            unit_price: trip.fare + (trip.tip ?? 0),
            currency_id: 'COP',
          },
        ],
        external_reference: trip.id,
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
      }),
    });

    const preference = await response.json();
    if (!response.ok) {
      console.error('Mercado Pago:', preference);
      return json({ error: 'Mercado Pago rechazó la solicitud.' }, 502);
    }

    await supabase
      .from('trips')
      .update({ payment_method: 'mercadopago', payment_status: 'pending' })
      .eq('id', trip.id);

    return json({ checkoutUrl: preference.init_point });
  } catch (error) {
    console.error(error);
    return json({ error: 'Error interno al crear el cobro.' }, 500);
  }
});
