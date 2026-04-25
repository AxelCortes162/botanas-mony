// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update } from 'firebase/database';

// Configuración de Firebase (obtén estos datos de tu consola de Firebase)
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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Funciones para manejar datos
export const saveStoreStatus = (isOpen) => {
  set(ref(database, 'store/status'), {
    isOpen: isOpen,
    lastUpdated: new Date().toISOString()
  });
};

export const saveProducts = (products) => {
  const productsObj = {};
  products.forEach(product => {
    productsObj[product.id] = product;
  });
  set(ref(database, 'store/products'), productsObj);
};

export const listenToStoreStatus = (callback) => {
  const statusRef = ref(database, 'store/status');
  onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const listenToProducts = (callback) => {
  const productsRef = ref(database, 'store/products');
  onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const productsArray = Object.values(data);
      callback(productsArray);
    }
  });
};