#!/usr/bin/env node

import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
}

function log(tag, color, text) {
  const prefix = `${color}${colors.bright}[${tag}]${colors.reset} `
  process.stdout.write(prefix + text + '\n')
}

console.log(
  `${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`,
)
console.log(
  `${colors.bright}${colors.cyan}   🚀 Production Client, Server & Admin Panel                  ${colors.reset}`,
)
console.log(
  `${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`,
)

// 1. Docker Compose для PostgreSQL и Redis
log('DOCKER', colors.yellow, 'Starting PostgreSQL & Redis...')

try {
  execSync('docker compose up -d db redis', {
    cwd: rootDir,
    stdio: 'inherit',
  })

  log('DOCKER', colors.green, '✓ Database & Redis are ready.')
} catch (err) {
  log('DOCKER', colors.yellow, '⚠️ Docker notice: ' + err.message)
}

// 2. Проверка production-сборки admin-panel
const shellDist = path.join(
  rootDir,
  'admin-panel',
  'apps',
  'admin-shell',
  'dist',
)

if (!fs.existsSync(shellDist)) {
  log(
    'ADMIN',
    colors.yellow,
    'Building admin-panel production bundles (first run)...',
  )

  try {
    execSync('pnpm build', {
      cwd: path.join(rootDir, 'admin-panel'),
      stdio: 'inherit',
    })

    log('ADMIN', colors.green, '✓ Admin panel build finished.')
  } catch (err) {
    log('ADMIN', colors.red, 'Failed to build admin-panel: ' + err.message)
  }
}

const processes = []

function runProcess(name, color, command, args, cwd) {
  log(
    name,
    color,
    `Starting in background: ${command} ${args.join(' ')}`,
  )

  const proc = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  })

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean)

    for (const line of lines) {
      process.stdout.write(`${color}[${name}]${colors.reset} ${line}\n`)
    }
  })

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean)

    for (const line of lines) {
      process.stderr.write(`${color}[${name}]${colors.reset} ${line}\n`)
    }
  })

  proc.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log(name, colors.red, `Process exited with code ${code}`)
    }
  })

  processes.push({ name, proc })

  return proc
}

// 3. Запуск Rust API Server в production mode
log('SERVER', colors.cyan, 'Launching Rust API Server in production mode...')

const releaseBinary = path.join(
  rootDir,
  'server',
  'target',
  'release',
  'guest-place',
)

if (fs.existsSync(releaseBinary)) {
  runProcess(
    'SERVER',
    colors.cyan,
    releaseBinary,
    [],
    path.join(rootDir, 'server'),
  )
} else {
  runProcess(
    'SERVER',
    colors.cyan,
    'cargo',
    ['run', '--release'],
    path.join(rootDir, 'server'),
  )
}

// 4. Запуск admin-panel через pnpm preview
log(
  'ADMIN',
  colors.magenta,
  'Launching Admin Panel with pnpm preview...',
)

runProcess(
  'ADMIN',
  colors.magenta,
  'pnpm',
  ['preview'],
  path.join(rootDir, 'admin-panel'),
)

// 5. Запуск client в production mode
log('CLIENT', colors.green, 'Launching Client in production mode...')

runProcess(
  'CLIENT',
  colors.green,
  'pnpm',
  ['start'],
  path.join(rootDir, 'client'),
)

// 6. Завершение всех процессов
function cleanup() {
  console.log(
    `\n${colors.yellow}Shutting down background services...${colors.reset}`,
  )

  for (const { proc } of processes) {
    try {
      proc.kill('SIGTERM')
    } catch {
      // ignore
    }
  }

  setTimeout(() => {
    for (const { proc } of processes) {
      try {
        proc.kill('SIGKILL')
      } catch {
        // ignore
      }
    }

    process.exit(0)
  }, 1000)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

log('URLS', colors.bright + colors.blue, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
log('URLS', colors.green, '🌐 Client:                    http://localhost:3000')
log('URLS', colors.magenta, '⚡ Admin Panel:               http://localhost:4173')
log('URLS', colors.cyan, '🦀 Backend API:               http://localhost:8000')
log('URLS', colors.bright + colors.blue, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')