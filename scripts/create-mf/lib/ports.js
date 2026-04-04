import fs from 'fs'
import path from 'path'

export function getNextPorts() {
  const portsFilePath = path.join(process.cwd(), 'packages/lib/src/constants/ports.ts')
  const portsContent = fs.readFileSync(portsFilePath, 'utf8')

  const appsPortsMatch = portsContent.match(/export const APPS_PORTS = \{([\s\S]*?)\} as const/)
  if (!appsPortsMatch) throw new Error('Could not find APPS_PORTS in ports.ts')

  const appsPortsContent = appsPortsMatch[1]
  const entries = [...appsPortsContent.matchAll(/(\w+):\s*\{[\s\S]*?preview:\s*(\d+),[\s\S]*?dev:\s*(\d+),/g)]
  const lastEntry = entries[entries.length - 1]

  if (!lastEntry) throw new Error('Could not find any entries in APPS_PORTS')

  return {
    lastAppName: lastEntry[1],
    nextPreviewPort: parseInt(lastEntry[2]) + 1,
    nextDevPort: parseInt(lastEntry[3]) + 1,
    portsFilePath,
    portsContent
  }
}

export function updatePortsFile(filePath, content, name, devPort, previewPort) {
  const newAppKey = name.replace(/^admin-/, '')
  const key = newAppKey.includes('-') ? `'${newAppKey}'` : newAppKey
  const newPortEntry = `\n  ${key}: {\n    preview: ${previewPort},\n    dev: ${devPort},\n  },`
  
  const updatedContent = content.replace(
    /(export const APPS_PORTS = \{[\s\S]*?)(\n\}\s*as const)/,
    `$1${newPortEntry}$2`
  )
  fs.writeFileSync(filePath, updatedContent)
}
