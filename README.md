# UberClone — Versión Conductor

Aplicación móvil para conductores inspirada en Uber, hecha con React Native y Expo para iOS y Android. El conductor se registra, se pone disponible, recibe solicitudes de viaje en tiempo real, navega hasta el pasajero y su destino, cobra con Mercado Pago o en efectivo y consulta sus ganancias e historial.

## Tecnologías

| Necesidad | Herramienta | Nota |
|---|---|---|
| App móvil | React Native + Expo SDK 58 | Se prueba con Expo Go |
| Navegación | React Navigation (Stack, Tabs, Drawer) | |
| Base de datos y autenticación | Supabase (PostgreSQL + Auth) | |
| Tiempo real | Supabase Realtime | Reemplaza a Firestore `onSnapshot` |
| Fotos y documentos | Supabase Storage (bucket privado) | Reemplaza a Cloudinary, incluido en el plan gratuito |
| Backend de pagos | Supabase Edge Functions | Cumple el papel de Node/Express o Cloud Functions |
| Pasarela de pago | Mercado Pago Checkout Pro (modo prueba) | |
| Rutas, distancia y duración | OpenRouteService | Alternativa gratuita a Google Directions, sin tarjeta de crédito |
| Mapa | react-native-maps | Apple Maps en iOS, Google Maps en Android |
| Ubicación | expo-location | |

## Requisitos

- Node.js 18 o superior
- Cuenta en [Supabase](https://supabase.com)
- Llave gratuita de [OpenRouteService](https://openrouteservice.org)
- Cuenta de desarrollador en [Mercado Pago](https://www.mercadopago.com.co/developers) con credenciales de prueba
- Expo Go en el celular

## Instalación

```bash
git clone https://github.com/Alejohgherrera/UberClone.git
cd UberClone
npm install
cp .env.example .env
```

Completa el archivo `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_ORS_API_KEY=
```

## Configuración de Supabase

1. En el **SQL Editor** ejecuta, en orden:
   - `supabase/schema.sql`: conductores, vehículos, documentos, ubicaciones, políticas de seguridad (RLS) y bucket de fotos.
   - `supabase/02_trips.sql`: tabla de viajes y tiempo real.
2. En **Authentication → Sign In / Providers → Email**, desactiva **Confirm email** para desarrollo.
3. Publica las funciones de pago:

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase secrets set MP_ACCESS_TOKEN=TU_ACCESS_TOKEN_DE_PRUEBA --yes
npx supabase functions deploy create-payment --no-verify-jwt
npx supabase functions deploy mp-webhook --no-verify-jwt
```

`mp-webhook` se publica sin verificación JWT porque Mercado Pago no envía token de Supabase. Para no aceptar notificaciones falsas, la función vuelve a consultar el pago directamente en la API de Mercado Pago. `create-payment` usa el token del conductor, así que las políticas RLS solo le permiten cobrar sus propios viajes.

## Ejecutar

```bash
npx expo start -c
```

Escanea el código QR con Expo Go.

## Probar el flujo completo

1. Regístrate en la app (3 pestañas). La cuenta queda en estado **pendiente**.
2. En Supabase, cambia `approval_status` a `approved` en la tabla `drivers`.
3. En la app toca **INICIAR** para quedar disponible.
4. En el SQL Editor ejecuta `supabase/simular_solicitud.sql` y acepta la solicitud antes de 15 segundos.
5. Toca **Pasajero a bordo** y luego **Finalizar viaje**.
6. Cobra con Mercado Pago, iniciando sesión con una **cuenta compradora de prueba**, o en efectivo.
7. Revisa **Ganancias** e **Historial** en el menú lateral.

Tarjeta de prueba para Colombia: `5254 1336 7440 3564`, CVV `123`, vencimiento `11/30`, titular `APRO` (aprobado) u `OTHE` (rechazado), documento `123456789`.

## Estructura

```
src/
├── components/     Componentes reutilizables (campos, mapa, modales)
├── config/         pricing.js: tarifas, comisión y calculateFare()
├── context/        SessionContext, TripContext, RegistrationContext
├── data/           Opciones de los selectores
├── hooks/          useDriverLocation, useTripRequests, useEarnings
├── lib/            Cliente de Supabase
├── navigation/     Stack principal, Tabs del registro, Drawer
├── screens/        Pantallas de la app
├── services/       Acceso a Supabase, rutas y preferencias
├── theme/          Colores
└── utils/          Validaciones, fechas y formatos
supabase/
├── functions/      Edge Functions de Mercado Pago
├── schema.sql
├── 02_trips.sql
└── simular_solicitud.sql
```

## Cálculo de tarifa

Los valores están en `src/config/pricing.js`, en pesos enteros:

| Parámetro | Valor |
|---|---|
| Tarifa base | 3.500 COP |
| Valor por km | 1.200 COP |
| Valor por minuto | 250 COP |
| Tarifa mínima | 6.000 COP |
| Multiplicador Económico / XL / Premium | 1,0 / 1,4 / 1,8 |
| Comisión de la plataforma | 20 % |

La tarifa se redondea a múltiplos de 100 COP antes de calcular la comisión. Cada viaje guarda el `commission_rate` aplicado, para que un cambio futuro de porcentaje no altere el historial.

## Seguridad

- El `access_token` de Mercado Pago solo existe en los *secrets* de Supabase, nunca en la app.
- `.env` está excluido de Git; el repositorio solo incluye `.env.example` sin valores.
- La app no guarda números de cuenta bancaria ni de tarjeta. AsyncStorage solo guarda el idioma, el último estado de disponibilidad y la sesión.
- Todas las tablas tienen RLS: cada conductor solo ve y modifica sus propios datos y no puede aprobarse a sí mismo.

## Limitaciones conocidas

- **Notificaciones push:** Expo Go no permite notificaciones remotas desde el SDK 53. Para recibir solicitudes con la app en segundo plano se necesita un *development build* con EAS.
- **Calificación del pasajero:** la registra la app del pasajero; en esta versión aparece como "Sin calificación".

## Integrantes

- Luisa Fernanda Aguirre Rivas
- Luis Alejandro Herrera
