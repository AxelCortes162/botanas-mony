// src/hooks/useDraft.js
import { useCallback, useEffect, useRef, useState } from 'react'

const clone = (value) => JSON.parse(JSON.stringify(value))
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Borrador editable de un dato que también puede cambiar en el servidor.
 *
 * Mientras el borrador sea igual al dato del servidor, lo sigue (otro
 * dispositivo, otra pestaña). En cuanto difiere, se queda quieto para no
 * borrar lo que se está escribiendo, y vuelve a engancharse al guardar o si
 * el usuario deshace sus cambios a mano. Sin esto, el panel podía guardar
 * datos viejos encima de cambios más recientes.
 */
export const useDraft = (source) => {
  const [draft, setDraft] = useState(() => clone(source))
  const touched = useRef(false)
  // Referencia del servidor en el momento en que se empezó a editar; sirve
  // para avisar si alguien más cambió lo mismo mientras tanto.
  const baseline = useRef(source)

  useEffect(() => {
    if (!touched.current) {
      baseline.current = source
      setDraft(clone(source))
    }
  }, [source])

  const update = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(draft) : updater
      // Si el usuario deshace sus cambios, el borrador vuelve a seguir al
      // servidor en lugar de quedarse desenganchado para siempre.
      touched.current = !same(next, source)
      setDraft(next)
    },
    [draft, source],
  )

  const markSaved = useCallback(() => {
    touched.current = false
  }, [])

  const discard = useCallback(() => {
    touched.current = false
    setDraft(clone(source))
  }, [source])

  return {
    draft,
    update,
    markSaved,
    discard,
    dirty: touched.current && !same(draft, source),
    // Alguien cambió este mismo dato desde otro lado mientras se editaba:
    // guardar ahora pisaría su cambio.
    stale: touched.current && baseline.current !== source,
  }
}
