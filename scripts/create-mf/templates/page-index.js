export function getPageIndex(name) {
  const mfName = name.replace(/^admin-/, '')
  const componentName = mfName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Page'
  return `import ${componentName} from './ui/${componentName}.vue'

export default ${componentName}
`
}
