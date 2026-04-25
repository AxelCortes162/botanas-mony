// products.js - VERSIÓN CORREGIDA

// Lista maestra de TODOS los ingredientes disponibles (incluye todo)
export const allIngredients = [
  // Vegetales y frutas
  "Jícama", "Zanahoria", "Pepino", "Betabel", "Col", "Jitomate", "Aguacate",
  // Proteínas
  "Cueritos",
  // Lácteos
  "Crema",
  // Botanas
  "Takis",
  // Salsas y condimentos (AQUÍ ESTABA EL DUPLICADO)
  "Chamoy", "Miguelito", "Tajín", "Limón", "Sal",
  // Salsas líquidas
  "Salsa Valentina", "Salsa San Luis", "Salsa Botanera",
  // Cacahuates
  "Cacahuate Japonés", "Cacahuate Queso", "Cacahuate Enchilado",
  // Gomitas
  "Gomitas Gusano", "Gomitas Pandita"
];

export const productsData = [
  {
    id: 1,
    name: "Chicharrón Preparado",
    price: 40,
    halfPrice: 25,
    image: "/images/chicharrones.jpg",
    hasHalfOption: true,
    description: "Chicharrón de harina preparado con ingredientes frescos",
    baseIngredients: [
      "Crema", "Col", "Cueritos", "Jitomate", "Aguacate", "Limón", "Sal", 
      "Salsa Valentina", "Tajín"
    ],
    category: "Preparados",
    customizable: true
  },
  {
    id: 2,
    name: "Dorilocos",
    price: 50,
    hasHalfOption: false,
    image: "/images/dorilocos.webp",
    description: "Doritos preparados estilo loco",
    baseIngredients: [
      "Jícama", "Zanahoria", "Pepino", "Cueritos", "Cacahuate Japonés", 
      "Cacahuate Queso", "Cacahuate Enchilado", "Gomitas Gusano", 
      "Gomitas Pandita", "Chamoy", "Miguelito", "Tajín",
      "Limón", "Sal", "Salsa Valentina"
    ],
    category: "Preparados",
    customizable: true
  },
  {
    id: 3,
    name: "Vaso de Fruta",
    price: 10,
    hasHalfOption: false,
    description: "Jícama, zanahoria, pepino y betabel frescos",
    baseIngredients: [
      "Jícama", "Zanahoria", "Pepino", "Betabel", "Limón", "Sal", "Salsa Valentina"
    ],
    category: "Frutas",
    customizable: true
  },
  {
    id: 4,
    name: "Charola de Fruta",
    price: 20,
    hasHalfOption: false,
    description: "Charola grande de fruta fresca preparada",
    baseIngredients: [
      "Jícama", "Zanahoria", "Pepino", "Betabel", "Limón", "Sal", "Salsa Valentina"
    ],
    category: "Frutas",
    customizable: true
  },
  {
    id: 5,
    name: "Vaso de Cueritos",
    price: 15,
    hasHalfOption: false,
    description: "Cueritos frescos preparados",
    baseIngredients: ["Cueritos", "Limón", "Sal", "Salsa Valentina"],
    category: "Preparados",
    customizable: true
  },
  {
    id: 6,
    name: "Uvas Cubiertas",
    price: 25,
    hasHalfOption: false,
    description: "Uvas frescas con cubierta dulce o picante",
    baseIngredients: [],
    category: "Dulces",
    customizable: false
  },
  {
    id: 7,
    name: "Pepino Loco",
    price: 35,
    hasHalfOption: false,
    description: "Pepino preparado estilo loco",
    baseIngredients: [
      "Chamoy", "Miguelito", "Cacahuate Japonés", "Cacahuate Queso", 
      "Cacahuate Enchilado", "Takis", "Gomitas Gusano", "Gomitas Pandita",
      "Limón", "Sal", "Salsa Valentina", "Tajín"
    ],
    category: "Preparados",
    customizable: true
  },
  {
    id: 8,
    name: "Manzana Cubierta",
    price: 30,
    hasHalfOption: false,
    description: "Manzana cubierta con chamoy o dulce",
    baseIngredients: [],
    category: "Dulces",
    customizable: false
  }
];

export const paymentData = {
  titular: "Mónica Fonseca Romero",
  banco: "Mercado Pago",
  clabe: "722969010167390444",
  whatsapp: "5531662608"
};