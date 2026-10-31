export function getStatusLabel(status: string): string {
	if (status === 'published') return 'Опубликовано'
	if (status === 'review') return 'На проверке'
	return 'Черновик'
}

export function formatDate(dateStr?: string): string {
	if (!dateStr) return ''
	try {
		const d = new Date(dateStr)
		return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
	} catch {
		return dateStr
	}
}
