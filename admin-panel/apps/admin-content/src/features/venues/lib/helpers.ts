const CYRILLIC_TO_LATIN: Record<string, string> = {
	а: 'a',
	б: 'b',
	в: 'v',
	г: 'g',
	д: 'd',
	е: 'e',
	ё: 'e',
	ж: 'zh',
	з: 'z',
	и: 'i',
	й: 'y',
	к: 'k',
	л: 'l',
	м: 'm',
	н: 'n',
	о: 'o',
	п: 'p',
	р: 'r',
	с: 's',
	т: 't',
	у: 'u',
	ф: 'f',
	х: 'h',
	ц: 'ts',
	ч: 'ch',
	ш: 'sh',
	щ: 'sch',
	ъ: '',
	ы: 'y',
	ь: '',
	э: 'e',
	ю: 'yu',
	я: 'ya',
}

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.split('')
		.map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
		.join('')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
}

export function getClientBaseUrl(): string {
	return (import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function getLandingUrl(slug?: string): string {
	return `${getClientBaseUrl()}/venues/${slug || 'loft-forest-hall'}`
}

export function openLanding(slug?: string): void {
	window.open(getLandingUrl(slug), '_blank')
}

export function formatPrice(p?: number): string {
	if (!p) return '0'
	return new Intl.NumberFormat('ru-RU').format(p)
}

export function splitCommaList(value: string): string[] {
	return value
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)
}

export function splitLineList(value: string): string[] {
	return value
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean)
}
