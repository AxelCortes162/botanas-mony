import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Sella el service worker con la huella de cada compilado.
 *
 * Sin esto, `public/sw.js` sale byte a byte idéntico en cada despliegue y el
 * navegador nunca se entera de que hay versión nueva: el aviso de actualizar
 * no aparecería jamás. De paso le pasa la lista real de archivos del bundle,
 * para que la app pueda abrir sin internet desde la primera visita.
 */
const serviceWorkerBuildId = () => ({
  name: 'sw-build-id',
  apply: 'build',
  async closeBundle() {
    const outDir = path.resolve(process.cwd(), 'dist')
    const swPath = path.join(outDir, 'sw.js')

    let sw
    try {
      sw = await readFile(swPath, 'utf8')
    } catch {
      this.warn('No se encontró dist/sw.js: la PWA quedará sin service worker')
      return
    }

    const html = await readFile(path.join(outDir, 'index.html'), 'utf8')

    // Los nombres de /assets/ ya llevan hash, así que basta con lo que el
    // HTML referencia para saber si el compilado cambió.
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1])
    const buildId = createHash('sha256').update(html).digest('hex').slice(0, 10)

    await writeFile(
      swPath,
      sw
        .replace('__BUILD_ID__', buildId)
        .replace("'__BUILD_ASSETS__'", JSON.stringify(JSON.stringify(assets))),
      'utf8',
    )

    this.info?.(`Service worker sellado: ${buildId} (${assets.length} archivos)`)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorkerBuildId()],
})
