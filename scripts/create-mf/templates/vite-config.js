export function getViteConfig(name, displayName) {
  const mfName = name.replace(/^admin-/, '')
  return `import { createConfig } from '@admin-panel/lib/vite'

export default createConfig({
	name: '${mfName}',
	displayName: '${displayName}',
})
`
}
