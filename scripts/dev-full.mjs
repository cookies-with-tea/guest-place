#!/usr/bin/env node

import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`)
console.log(`${colors.bright}${colors.cyan}   🌟 Guest Place Full-Stack Local Orchestrator    ${colors.reset}`)
console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`)

// 1. Docker Compose for PostgreSQL and Redis
log('DOCKER', colors.yellow, 'Starting PostgreSQL & Redis via Docker Compose...')
try {
	execSync('docker compose -f server/compose.yaml up -d db redis', {
		cwd: rootDir,
		stdio: 'inherit',
	})
	log('DOCKER', colors.green, '✓ Docker containers are up and running.')
} catch (err) {
	log('DOCKER', colors.yellow, '⚠️ Docker Compose notice (containers might already be running or docker not installed): ' + err.message)
}

// 2. Wait for database ready
log('DATABASE', colors.yellow, 'Verifying PostgreSQL database readiness...')
let dbReady = false
for (let attempt = 1; attempt <= 10; attempt++) {
	try {
		execSync('docker compose -f server/compose.yaml exec -T db pg_isready -U guest-place -d guest-place', {
			cwd: rootDir,
			stdio: 'ignore',
		})
		dbReady = true
		break
	} catch {
		Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
	}
}

if (dbReady) {
	log('DATABASE', colors.green, '✓ PostgreSQL is accepting connections.')
} else {
	log('DATABASE', colors.yellow, 'PostgreSQL check skipped or host connection will be used directly.')
}

// 3. Child processes
const children = []

function spawnProcess(name, color, cmd, args, cwd) {
	log('ORCHESTRATOR', colors.cyan, `Launching ${name} in ${cwd}...`)
	const proc = spawn(cmd, args, {
		cwd,
		stdio: ['ignore', 'pipe', 'pipe'],
		shell: true,
		env: { ...process.env, FORCE_COLOR: '1' },
	})

	proc.stdout.on('data', (data) => {
		const lines = data.toString().split('\n')
		for (const line of lines) {
			if (line.trim()) {
				console.log(`${color}[${name}]${colors.reset} ${line}`)
			}
		}
	})

	proc.stderr.on('data', (data) => {
		const lines = data.toString().split('\n')
		for (const line of lines) {
			if (line.trim()) {
				console.error(`${color}[${name}]${colors.reset} ${line}`)
			}
		}
	})

	proc.on('close', (code) => {
		log(name, colors.red, `Process exited with code ${code}`)
	})

	children.push(proc)
	return proc
}

// Launch 1: Rust Server
spawnProcess('SERVER', colors.blue, 'cargo', ['watch', '-x', 'run'], path.join(rootDir, 'server'))

// Launch 2: Admin Panel
spawnProcess('ADMIN', colors.magenta, 'pnpm', ['dev:all'], path.join(rootDir, 'admin-panel'))

// Launch 3: Client Guest Site
spawnProcess('CLIENT', colors.green, 'pnpm', ['dev'], path.join(rootDir, 'client'))

// Cleanup on interrupt
function cleanup() {
	console.log(`\n${colors.bright}${colors.yellow}Shutting down all processes...${colors.reset}`)
	for (const child of children) {
		try {
			child.kill('SIGTERM')
		} catch {
			// Ignore
		}
	}
	setTimeout(() => {
		for (const child of children) {
			try {
				child.kill('SIGKILL')
			} catch {
				// Ignore
			}
		}
		process.exit(0)
	}, 1500)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
