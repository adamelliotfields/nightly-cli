import { builtinModules } from 'node:module'
import { defineConfig } from 'rolldown'

export default defineConfig({
  input: 'src/index.ts',
  platform: 'node',
  output: {
    file: 'dist/nightly.cjs',
    format: 'cjs'
  },
  // don't bundle node built-ins
  external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
  resolve: {
    extensions: ['.ts', '.js', '.json', '.node']
  }
})
