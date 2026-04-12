import pkg from 'enquirer'
const { Input, Select } = pkg

export async function getMfParams(nextDevPort, nextPreviewPort) {
	const namePrompt = new Input({
		message: 'Enter the name of the new micro-frontend (e.g., admin-new-feature):',
		validate: (value) => {
			if (!value.trim()) return 'Name cannot be empty'
			if (!/^admin-/.test(value)) return 'Name must start with "admin-"'
			if (!/^[a-z0-9-]+$/.test(value)) return 'Name can only contain lowercase letters, numbers, and hyphens'
			return true
		},
	})

	const name = await namePrompt.run()

	const displayNamePrompt = new Input({
		message: 'Enter the display name (e.g., "New Feature"):',
		initial: name.replace(/^admin-/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
	})

	const displayName = await displayNamePrompt.run()

	const devPortPrompt = new Input({
		message: 'Enter the port for development mode:',
		initial: nextDevPort.toString(),
		validate: (value) => {
			const port = parseInt(value)
			if (isNaN(port)) return 'Port must be a number'
			if (port < 1024 || port > 65535) return 'Port must be in the range 1024-65535'
			return true
		},
	})

	const previewPortPrompt = new Input({
		message: 'Enter the port for preview mode:',
		initial: nextPreviewPort.toString(),
		validate: (value) => {
			const port = parseInt(value)
			if (isNaN(port)) return 'Port must be a number'
			if (port < 1024 || port > 65535) return 'Port must be in the range 1024-65535'
			return true
		},
	})

	const devPort = await devPortPrompt.run()
	const previewPort = await previewPortPrompt.run()

	const confirmPrompt = new Select({
		message: `Create micro-frontend "${name}" with ports ${devPort} (dev) and ${previewPort} (preview)?`,
		choices: ['Yes', 'No'],
	})

	const confirm = await confirmPrompt.run()

	return { name, displayName, devPort, previewPort, confirm: confirm === 'Yes' }
}
