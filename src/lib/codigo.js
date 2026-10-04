// El codigo de 4 digitos para canjear. Cambia cada 5 minutos.
// Es la misma cuenta que puntos_codigo() en sql/puntos.sql: si cambias una,
// cambia la otra y corre `node probar-codigo.mjs`.

export const VENTANA_MS = 5 * 60 * 1000

export async function codigo(token, ventana) {
  const enc = new TextEncoder()
  const llave = await crypto.subtle.importKey('raw', enc.encode(token), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const firma = await crypto.subtle.sign('HMAC', llave, enc.encode(String(ventana)))
  return String(new DataView(firma).getUint32(0) % 10000).padStart(4, '0')
}
