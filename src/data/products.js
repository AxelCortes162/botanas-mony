// src/data/products.js
// Datos semilla. En producción, Firebase manda: esto es el respaldo
// que se usa la primera vez o cuando no hay conexión.

/**
 * Ingredientes agrupados por categoría.
 * `allIngredients` se deriva de aquí para que nunca se desincronicen
 * ni haya duplicados.
 */
export const ingredientGroups = {
  '🥬 Vegetales': ['Jícama', 'Zanahoria', 'Pepino', 'Betabel', 'Col', 'Jitomate', 'Aguacate'],
  '🍖 Proteínas': ['Cueritos'],
  '🥛 Lácteos': ['Crema'],
  '🌶️ Salsas líquidas': ['Salsa Valentina', 'Salsa San Luis', 'Salsa Botanera'],
  '🥜 Cacahuates': ['Cacahuate Japonés', 'Cacahuate Queso', 'Cacahuate Enchilado'],
  '🍬 Gomitas': ['Gomitas Gusano', 'Gomitas Pandita'],
  '🔥 Botanas y condimentos': ['Takis', 'Chamoy', 'Miguelito', 'Tajín', 'Limón', 'Sal'],
}

export const allIngredients = [...new Set(Object.values(ingredientGroups).flat())]

/** Costo por cada ingrediente extra (neto, después de intercambios). */
export const EXTRA_INGREDIENT_COST = 2

export const productsData = [
  {
    id: 1,
    name: 'Chicharrón Preparado',
    price: 40,
    halfPrice: 25,
    image: '/images/products/chicharron.jpeg',
    hasHalfOption: true,
    available: true,
    description: 'Chicharrón de harina preparado con ingredientes frescos',
    baseIngredients: [
      'Crema',
      'Col',
      'Cueritos',
      'Jitomate',
      'Aguacate',
      'Limón',
      'Sal',
      'Salsa Valentina',
      'Tajín',
    ],
    category: 'Preparados',
    customizable: true,
  },
  {
    id: 2,
    name: 'Dorilocos',
    price: 50,
    halfPrice: 0,
    hasHalfOption: false,
    available: true,
    image: '/images/products/dorilocos.jpeg',
    description: 'Doritos preparados estilo loco',
    baseIngredients: [
      'Jícama',
      'Zanahoria',
      'Pepino',
      'Cueritos',
      'Cacahuate Japonés',
      'Cacahuate Queso',
      'Cacahuate Enchilado',
      'Gomitas Gusano',
      'Gomitas Pandita',
      'Chamoy',
      'Miguelito',
      'Tajín',
      'Limón',
      'Sal',
      'Salsa Valentina',
    ],
    category: 'Preparados',
    customizable: true,
  },
  {
    id: 3,
    name: 'Vaso de Fruta',
    price: 10,
    halfPrice: 0,
    hasHalfOption: false,
    available: true,
    image: '/images/products/frutaVaso.jpeg',
    description: 'Jícama, zanahoria, pepino y betabel frescos',
    baseIngredients: ['Jícama', 'Zanahoria', 'Pepino', 'Betabel', 'Limón', 'Sal', 'Salsa Valentina'],
    category: 'Frutas',
    customizable: true,
  },
  {
    id: 4,
    name: 'Charola de Fruta',
    price: 20,
    halfPrice: 0,
    hasHalfOption: false,
    available: true,
    image: '/images/products/frutaCharola.jpeg',
    description: 'Charola grande de fruta fresca preparada',
    baseIngredients: ['Jícama', 'Zanahoria', 'Pepino', 'Betabel', 'Limón', 'Sal', 'Salsa Valentina'],
    category: 'Frutas',
    customizable: true,
  },
  {
    id: 5,
    name: 'Vaso de Cueritos',
    price: 15,
    halfPrice: 0,
    hasHalfOption: false,
    available: true,
    image: '/images/products/cueritos.jpeg',
    description: 'Cueritos frescos preparados',
    baseIngredients: ['Cueritos', 'Limón', 'Sal', 'Salsa Valentina'],
    category: 'Preparados',
    customizable: true,
  },
  {
    id: 6,
    name: 'Uvas Cubiertas',
    price: 25,
    halfPrice: 0,
    hasHalfOption: false,
    available: true,
    image: '/images/products/uvas.jpeg',
    description: 'Uvas frescas con cubierta dulce o picante',
    baseIngredients: [],
    category: 'Dulces',
    customizable: false,
  },
  {
    id: 7,
    name: 'Pepino Loco',
    price: 35,
    halfPrice: 0,
    hasHalfOption: false,
    available: true,
    image: '/images/products/pepinosLocos.jpeg',
    description: 'Pepino preparado estilo loco',
    baseIngredients: [
      'Chamoy',
      'Miguelito',
      'Cacahuate Japonés',
      'Cacahuate Queso',
      'Cacahuate Enchilado',
      'Takis',
      'Gomitas Gusano',
      'Gomitas Pandita',
      'Limón',
      'Sal',
      'Salsa Valentina',
      'Tajín',
    ],
    category: 'Preparados',
    customizable: true,
  },
  {
    id: 8,
    name: 'Manzana Cubierta',
    price: 30,
    halfPrice: 0,
    hasHalfOption: false,
    available: true,
    image: '/images/products/manzana.jpeg',
    description: 'Manzana cubierta con chamoy o dulce',
    baseIngredients: [],
    category: 'Dulces',
    customizable: false,
  },
  {
    id: 9,
    name: 'Manzana Loca',
    price: 50,
    halfPrice: 0,
    hasHalfOption: false,
    available: true,
    image: '/images/products/manzanaLoca.jpeg',
    description: 'Manzana preparada estilo loco',
    baseIngredients: [
      'Jícama',
      'Zanahoria',
      'Pepino',
      'Cacahuate Japonés',
      'Cacahuate Queso',
      'Cacahuate Enchilado',
      'Gomitas Gusano',
      'Gomitas Pandita',
      'Limón',
      'Sal',
      'Salsa Valentina',
      'Tajín',
      'Chamoy',
      'Miguelito',
    ],
    category: 'Preparados',
    customizable: true,
  },
]

export const paymentData = {
  titular: 'Mónica Fonseca Romero',
  banco: 'Mercado Pago',
  clabe: '722969010167390444',
  whatsapp: '5531662608',
}

export const deliveryConfig = {
  // Horario automático: la tienda se abre y se cierra sola.
  // Los días van como texto separado por comas (0 = domingo … 6 = sábado)
  // porque Realtime Database borra los arreglos vacíos.
  autoSchedule: true,
  openDays: '0,1,2,3,4,5,6', // abre todos los días
  pickupDays: '6', // recoger en el puesto: solo sábados
  deliveryDays: '0,1,2,3,4,5,6', // envío a domicilio: todos los días
  openingTime: '12:00',
  closingTime: '20:00',

  deliveryCost: 30,
  address: 'U.H. Lindavista Vallejo, Mzn 2. Las Curvas', // Dirección del puesto
  scheduleInterval: 20, // minutos entre horarios
  preparationTime: 30, // minutos de preparación
}
