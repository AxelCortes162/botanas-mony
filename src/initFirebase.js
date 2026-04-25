// src/initFirebase.js
import { saveProducts, saveStoreStatus } from './firebase';
import { productsData } from './data/products';

// Inicializar datos (ejecutar solo una vez)
saveStoreStatus(true); // Tienda abierta
saveProducts(productsData); // Productos iniciales

console.log('✅ Datos inicializados en Firebase');