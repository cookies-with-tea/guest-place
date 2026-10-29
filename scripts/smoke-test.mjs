#!/usr/bin/env node
// Root-level smoke test: brings up db + redis (Docker) and all three dev services
// (server, admin-panel's admin-shell, client) together, like `make dev-full` does, then
// polls each one's HTTP port until it answers (any status counts — this proves the
// process is up and serving, it is not a deep health check) or a timeout is hit.
// Exits 0 only if all three respond; always tears every process/container back down.
import { spawn, execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const readEnvVar = (envPath, key, fallback) => {
	try {
		const content = readFileSync(envPath, 'utf8')
		const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'))
		return match ? match[1].trim() : fallback
	} catch {
		return fallback
	}
}

const SERVER_PORT = readEnvVar(path.join(rootDir, 'server/.env'), 'APP_PORT', '8000')
const ADMIN_PORT = '4173'
const CLIENT_PORT = '3000'

const children = []
let exitCode = 1

const log = (tag, text) => process.stdout.write(`[${tag}] ${text}\n`)

const spawnService = (name, cmd, args, cwd) => {
	log(name, `starting: ${cmd} ${args.join(' ')} (cwd=${cwd})`)
	const proc = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], shell: true })
	proc.stdout.on('data', (d) => process.stdout.write(`[${name}] ${d}`))
	proc.stderr.on('data', (d) => process.stderr.write(`[${name}] ${d}`))
	children.push({ name, proc })
	return proc
}

const waitForHttp = async (name, url, timeoutMs) => {
	const start = Date.now()
	while (Date.now() - start < timeoutMs) {
		try {
			await fetch(url, { signal: AbortSignal.timeout(2000) })
			log(name, `✅ responded at ${url} after ${Math.round((Date.now() - start) / 1000)}s`)
			return true
		} catch {
			await new Promise((r) => setTimeout(r, 2000))
		}
	}
	log(name, `❌ did not respond at ${url} within ${timeoutMs / 1000}s`)
	return false
}

const cleanup = () => {
	log('SMOKE', 'tearing down...')
	for (const { proc } of children) {
		try {
			proc.kill('SIGTERM')
		} catch {
			// already dead
		}
	}
	setTimeout(() => {
		for (const { proc } of children) {
			try {
				proc.kill('SIGKILL')
			} catch {
				// already dead
			}
		}
		try {
			execSync('docker compose down', { cwd: rootDir, stdio: 'inherit' })
		} catch {
			// best-effort
		}
		process.exit(exitCode)
	}, 2000)
}

async function main() {
	log('SMOKE', 'Starting db + redis via Docker Compose...')
	execSync('docker compose up -d db redis', { cwd: rootDir, stdio: 'inherit' })

	log('SMOKE', 'Waiting for Postgres to be ready...')
	let dbReady = false
	for (let i = 0; i < 20; i++) {
		try {
			execSync('docker compose exec -T db pg_isready -U guest-place -d guest-place', {
				cwd: rootDir,
				stdio: 'ignore',
			})
			dbReady = true
			break
		} catch {
			await new Promise((r) => setTimeout(r, 1500))
		}
	}
	if (!dbReady) {
		log('SMOKE', '❌ Postgres never became ready, aborting.')
		cleanup()
		return
	}
	log('SMOKE', '✅ Postgres ready.')

	spawnService('SERVER', 'cargo', ['run', '--bin', 'guest-place'], path.join(rootDir, 'server'))
	spawnService('ADMIN', 'pnpm', ['dev:shell'], path.join(rootDir, 'admin-panel'))
	spawnService('CLIENT', 'pnpm', ['dev'], path.join(rootDir, 'client'))

	const [serverOk, adminOk, clientOk] = await Promise.all([
		waitForHttp('SERVER', `http://localhost:${SERVER_PORT}/`, 120_000),
		waitForHttp('ADMIN', `http://localhost:${ADMIN_PORT}/`, 180_000),
		waitForHttp('CLIENT', `http://localhost:${CLIENT_PORT}/`, 180_000),
	])

	const allOk = serverOk && adminOk && clientOk
	log('SMOKE', allOk ? '✅ All three services are up.' : '❌ One or more services failed to start.')
	exitCode = allOk ? 0 : 1
	cleanup()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

main()
