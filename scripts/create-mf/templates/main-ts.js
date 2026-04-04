export function getMainTs(name) {
  const mfName = name.replace(/^admin-/, '')
  const mountId = `#__MF_${mfName.toUpperCase().replace(/-/g, '_')}__`
  return `import { app } from '#app/index'

app.mount('${mountId}')
`
}
