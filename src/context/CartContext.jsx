// src/context/CartContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { makeId } from '../lib/format'

const CartContext = createContext(null)

const STORAGE_KEY = 'bm.cart'

/**
 * Firma de una línea del carrito: dos ítems con el mismo producto, tamaño,
 * ingredientes y nota se agrupan y suman cantidad en lugar de duplicarse.
 */
const signatureOf = (item) =>
  [
    item.productId,
    item.size,
    [...(item.ingredients ?? [])].sort().join('|'),
    (item.note ?? '').trim().toLowerCase(),
  ].join('::')

const readCart = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readCart)

  // El carrito sobrevive a un refresh o a que se cierre el navegador
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [items])

  const addItem = useCallback((item, qty = 1) => {
    setItems((current) => {
      const signature = signatureOf(item)
      const existing = current.find((line) => line.signature === signature)

      if (existing) {
        return current.map((line) =>
          line.signature === signature ? { ...line, qty: line.qty + qty } : line,
        )
      }
      return [...current, { ...item, signature, qty, lineId: makeId() }]
    })
  }, [])

  const setQty = useCallback((lineId, qty) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((line) => line.lineId !== lineId)
        : current.map((line) => (line.lineId === lineId ? { ...line, qty } : line)),
    )
  }, [])

  const increment = useCallback(
    (lineId) =>
      setItems((current) =>
        current.map((line) => (line.lineId === lineId ? { ...line, qty: line.qty + 1 } : line)),
      ),
    [],
  )

  const decrement = useCallback(
    (lineId) =>
      setItems((current) =>
        current
          .map((line) => (line.lineId === lineId ? { ...line, qty: line.qty - 1 } : line))
          .filter((line) => line.qty > 0),
      ),
    [],
  )

  const removeItem = useCallback(
    (lineId) => setItems((current) => current.filter((line) => line.lineId !== lineId)),
    [],
  )

  const clear = useCallback(() => setItems([]), [])

  const subtotal = useMemo(
    () => items.reduce((total, line) => total + line.unitPrice * line.qty, 0),
    [items],
  )

  const count = useMemo(() => items.reduce((total, line) => total + line.qty, 0), [items])

  const value = useMemo(
    () => ({
      items,
      subtotal,
      count,
      isEmpty: items.length === 0,
      addItem,
      setQty,
      increment,
      decrement,
      removeItem,
      clear,
    }),
    [items, subtotal, count, addItem, setQty, increment, decrement, removeItem, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return context
}
