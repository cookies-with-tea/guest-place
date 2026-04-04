import pkg from 'enquirer'
const { Input, Select } = pkg

export async function getMfParams(nextDevPort, nextPreviewPort) {
  const namePrompt = new Input({
    message: 'Введите имя нового микрофронтенда (например, admin-new-feature):',
    validate: (value) => {
      if (!value.trim()) return 'Имя не может быть пустым'
      if (!/^admin-/.test(value)) return 'Имя должно начинаться с "admin-"'
      if (!/^[a-z0-9-]+$/.test(value)) return 'Имя может содержать только строчные буквы, цифры и дефисы'
      return true
    },
  })

  const name = await namePrompt.run()

  const displayNamePrompt = new Input({
    message: 'Введите отображаемое имя (например, "Новая Функция"):',
    initial: name.replace(/^admin-/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
  })

  const displayName = await displayNamePrompt.run()

  const devPortPrompt = new Input({
    message: 'Введите порт для режима разработки:',
    initial: nextDevPort.toString(),
    validate: (value) => {
      const port = parseInt(value)
      if (isNaN(port)) return 'Порт должен быть числом'
      if (port < 1024 || port > 65535) return 'Порт должен быть в диапазоне 1024-65535'
      return true
    },
  })

  const previewPortPrompt = new Input({
    message: 'Введите порт для режима preview:',
    initial: nextPreviewPort.toString(),
    validate: (value) => {
      const port = parseInt(value)
      if (isNaN(port)) return 'Порт должен быть числом'
      if (port < 1024 || port > 65535) return 'Порт должен быть в диапазоне 1024-65535'
      return true
    },
  })

  const devPort = await devPortPrompt.run()
  const previewPort = await previewPortPrompt.run()

  const confirmPrompt = new Select({
    message: `Создать микрофронтенд "${name}" с портами ${devPort} (dev) и ${previewPort} (preview)?`,
    choices: ['Да', 'Нет'],
  })

  const confirm = await confirmPrompt.run()
  
  return { name, displayName, devPort, previewPort, confirm: confirm === 'Да' }
}
