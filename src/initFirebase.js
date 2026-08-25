// src/initFirebase.js
//
// Semilla de la base de datos. ANTES este archivo ejecutaba las escrituras
// con solo importarlo, así que un import por accidente sobrescribía los
// precios reales con los del código. Ahora hay que llamar a la función
// a propósito y, además, requiere estar autenticado (ver database.rules.json).
//
// Uso puntual desde la consola del navegador con la sesión de admin abierta:
//
//   import('/src/initFirebase.js').then((m) => m.seedFirebase())
//
import { saveProducts, saveIngredients, saveDeliveryConfig } from './lib/firebase'
import { productsData, allIngredients, deliveryConfig } from './data/products'

export const seedFirebase = async ({ force = false } = {}) => {
  if (!force) {
    const ok = window.confirm(
      'Esto SOBRESCRIBE los productos, los ingredientes y la configuración de horarios en Firebase con los datos del código. ¿Continuar?',
    )
    if (!ok) return { ok: false, cancelled: true }
  }

  const results = await Promise.all([
    saveProducts(productsData),
    saveIngredients(allIngredients),
    saveDeliveryConfig(deliveryConfig),
  ])

  const failed = results.find((result) => result?.ok === false)
  if (failed) {
    console.error('❌ No se pudo inicializar:', failed.error)
    return failed
  }

  console.log('✅ Datos inicializados en Firebase')
  return { ok: true }
}
