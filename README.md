# Promociones de obra nueva en un CRM inmobiliario con Next.js

El CRM inmobiliario de Atalaya Inmobiliaria, una agencia inventada de Valencia, con un módulo nuevo para comercializar promociones de obra nueva. Cada promoción tiene una ficha pública con sus fotos, sus datos y el edificio dibujado planta a planta, donde cada vivienda aparece libre, reservada o vendida y se puede pedir información de cualquiera que no esté vendida. Desde el CRM, la agencia ve quién ha preguntado por cada vivienda y la reserva, la vende o la vuelve a poner a la venta.

Está hecho con Next.js 16, Prisma 7 sobre SQLite y Zod, sobre el CRM del tutorial anterior. La web pública y el CRM son dos grupos de rutas con su propio layout.

El tutorial completo está en Neoguias: [Cómo gestionar promociones de obra nueva en un CRM inmobiliario con Next.js](https://www.neoguias.com/promociones-obra-nueva-nextjs/). Hay una versión con Laravel y Livewire en [este otro repositorio](https://github.com/neoguias/tutorial-obra-nueva-laravel).

Los tutoriales anteriores de la serie:

- [Cómo crear un CRM inmobiliario con Next.js](https://www.neoguias.com/crear-crm-inmobiliario-nextjs/), con [su repositorio](https://github.com/neoguias/tutorial-crm-inmobiliario-nextjs).
- [Cómo crear un portal inmobiliario como Idealista con Next.js](https://www.neoguias.com/crear-portal-inmobiliario-nextjs/), con [su repositorio](https://github.com/neoguias/tutorial-portal-inmobiliario-nextjs).
- [Cómo valorar un piso por comparables en un CRM inmobiliario con Next.js](https://www.neoguias.com/valorar-inmuebles-comparables-nextjs/), con [su repositorio](https://github.com/neoguias/tutorial-valoracion-inmobiliaria-nextjs).
- [Cómo gestionar alquileres en un CRM inmobiliario con Next.js](https://www.neoguias.com/gestionar-alquileres-nextjs/), con [su repositorio](https://github.com/neoguias/tutorial-gestion-alquileres-nextjs).

## Cómo arrancarlo

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abre `http://localhost:3000`. El seed carga diez inmuebles con una foto cada uno, cinco clientes con lo que buscan, dos visitas y una promoción de veinticinco viviendas en Benimaclet, con parte vendida o reservada y algunas peticiones de información. La gestión de las promociones está en `http://localhost:3000/promociones`, y la ficha pública de la de ejemplo en `http://localhost:3000/obra-nueva/jardines-de-benimaclet`. Las fotos de ejemplo y las imágenes de la promoción están generadas con IA y son de uso libre.

Los tests usan su propia base de datos SQLite, `test.db`, que se crea de cero en cada ejecución:

```bash
npm test
```

Requiere Node 22 o superior.

## Dónde está cada cosa

- [`prisma/schema.prisma`](prisma/schema.prisma): las tablas de inmuebles, clientes, demandas, visitas, promociones, viviendas y peticiones de información.
- [`lib/new-build.ts`](lib/new-build.ts): las funciones puras de la obra nueva, con el nombre de cada planta y vivienda, el edificio ordenado de arriba abajo y el precio desde.
- [`lib/inquiries.ts`](lib/inquiries.ts): las peticiones de información, que reutilizan el cliente si el email ya existe, y los cambios de estado de las viviendas.
- [`components/building.tsx`](components/building.tsx): el edificio planta a planta, que usan la ficha pública y el CRM.
- [`lib/matching.ts`](lib/matching.ts): el cruce, en un sentido y en el otro, como condiciones de Prisma.
- [`lib/crm.ts`](lib/crm.ts): la agencia, sus zonas, los textos en español de cada valor y el formato de precios y fechas.
- [`lib/validation.ts`](lib/validation.ts): los esquemas de Zod de los formularios.
- [`app/actions.ts`](app/actions.ts): las Server Actions que guardan inmuebles, clientes, visitas, estados, peticiones de información y reservas.
- [`lib/photos.ts`](lib/photos.ts) y [`app/fotos`](app/fotos): las fotos se guardan en `storage/photos` y las sirve un Route Handler, porque Next.js no sirve lo que se añade a `public` después de compilar.
- [`app/(crm)`](app/(crm)): las pantallas del CRM con su menú, que son los inmuebles, los clientes, las visitas y las promociones.
- [`app/(web)`](app/(web)): la web pública, con la ficha de cada promoción en `obra-nueva/[slug]`.
- [`tests/new-build.test.ts`](tests/new-build.test.ts): el edificio por plantas, el precio desde, las peticiones de información y las reservas.
- [`tests/crm.test.ts`](tests/crm.test.ts): el cruce, los formularios, las fotos y el formato de los precios.

## Autor

Creado por [Edu Lázaro](https://edulazaro.com) para [Neoguias](https://www.neoguias.com).

## Licencia

Este ejemplo es software libre con [licencia MIT](LICENSE).
