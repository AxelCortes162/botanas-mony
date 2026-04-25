// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';

// Configuración de Firebase (reemplaza con tus datos)
const firebaseConfig = {
  apiKey: "AIzaSyAsvhj1JKzPR-DcC0U8Z5MyvZFrihHJtuA",
  authDomain: "botanas-mony-ca4d0.firebaseapp.com",
  databaseURL: "https://botanas-mony-ca4d0-default-rtdb.firebaseio.com",
  projectId: "botanas-mony-ca4d0",
  storageBucket: "botanas-mony-ca4d0.firebasestorage.app",
  messagingSenderId: "972334705995",
  appId: "1:972334705995:web:a956c8a11ad2dd2d960cce"
};

// Inicializar Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.warn('Firebase no se pudo inicializar:', error);
}

// Función auxiliar para escribir en la base de datos
const safeSet = (path, data) => {
  if (!database) {
    console.log('Firebase no disponible, guardando en localStorage');
    return;
  }
  set(ref(database, path), data);
};

// Guardar estado de la tienda
export const saveStoreStatus = (isOpen) => {
  safeSet('store/status', {
    isOpen: isOpen,
    lastUpdated: new Date().toISOString()
  });
};

// Guardar productos
export const saveProducts = (products) => {
  const productsObj = {};
  products.forEach(product => {
    productsObj[product.id] = product;
  });
  safeSet('store/products', productsObj);
};

// Guardar configuración de entrega
export const saveDeliveryConfig = (config) => {
  safeSet('store/delivery', config);
};

// Escuchar estado de la tienda
export const listenToStoreStatus = (callback) => {
  if (!database) {
    callback(null);
    return;
  }
  const statusRef = ref(database, 'store/status');
  onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// Escuchar productos
export const listenToProducts = (callback) => {
  if (!database) {
    callback(null);
    return;
  }
  const productsRef = ref(database, 'store/products');
  onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(Object.values(data));
    }
  });
};

// Escuchar configuración de entrega
export const listenToDeliveryConfig = (callback) => {
  if (!database) {
    callback(null);
    return;
  }
  const deliveryRef = ref(database, 'store/delivery');
  onValue(deliveryRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};