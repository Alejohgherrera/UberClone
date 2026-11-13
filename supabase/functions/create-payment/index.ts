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
    const body = await req.text();
    const tripId = body ? JSON.parse(body).tripId : null;
    if (!tripId) return json({ error: 'La app no envió el viaje a cobrar.' }, 400);
 
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) return json({ error: 'Falta configurar MP_ACCESS_TOKEN en Supabase.' }, 500);
 
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
        Authorization: `Bearer ${accessToken}`,
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
 
    const responseText = await response.text();
    if (!response.ok) {
      console.error('Mercado Pago:', response.status, responseText);
      const reason = response.status === 401 ? 'el Access Token no es válido' : `código ${response.status}`;
      return json({ error: `Mercado Pago rechazó la solicitud: ${reason}.` }, 502);
    }
    const preference = JSON.parse(responseText);
 
    await supabase
      .from('trips')
      .update({ payment_method: 'mercadopago', payment_status: 'pending' })
      .eq('id', trip.id);
 
    return json({ checkoutUrl: preference.init_point });
  } catch (error) {
    console.error('create-payment:', error);
    return json({ error: `Error interno al crear el cobro: ${error.message}` }, 500);
  }
});