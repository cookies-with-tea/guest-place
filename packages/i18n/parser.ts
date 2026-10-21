export interface I18nNode {
	type: 'text' | 'tag' | 'slot'
	name: string
	content?: string
	children?: I18nNode[]
}

export interface ValidationResult {
	isValid: boolean
	errors: string[]
}

const SELF_CLOSING_TAGS = new Set(['br', 'hr', 'img', 'wbr'])

/**
 * Parses a translation string into a tree of nodes.
 * Supports:
 * - Nested tags: {span}Text {b}Bold{/b}{/span}
 * - Deeply nested tags: {div}{span}{b}{i}Deep{/i}{/b}{/span}{/div}
 * - Slots: {userName}, {count}
 * - Self-closing tags: {br}, {hr}
 * - Resilience to mismatched or unclosed tags
 */
export function parseTranslation(text: string): I18nNode[] {
	if (!text) return []

	const nodes: I18nNode[] = []
	const stack: { name: string; children: I18nNode[] }[] = [{ name: 'root', children: nodes }]

	// Regex to match {tag}, {/tag}, or {slot}
	const regex = /\{(\/?)([a-zA-Z0-9_.-]+)\}/g
	let lastIndex = 0
	let match: RegExpExecArray | null

	while ((match = regex.exec(text)) !== null) {
		const [fullMatch, isClosing, name] = match
		const startIndex = match.index

		// Add text before the match
		if (startIndex > lastIndex) {
			const textContent = text.substring(lastIndex, startIndex)

			stack[stack.length - 1].children.push({
				type: 'text',
				name: 'text',
				content: textContent,
			})
		}

		if (isClosing) {
			// Find if there is a matching open tag in the stack
			const openIndex = stack.map((s) => s.name).lastIndexOf(name)

			if (openIndex > 0) {
				// Pop everything up to the matching tag (handles proper nesting closure)
				while (stack.length > openIndex) {
					stack.pop()
				}
			} else {
				// Mismatched closing tag, treat as text
				stack[stack.length - 1].children.push({
					type: 'text',
					name: 'text',
					content: fullMatch,
				})
			}
		} else {
			// If it's a known self-closing tag or has no matching closing tag later, it's a slot or self-closing
			if (SELF_CLOSING_TAGS.has(name.toLowerCase())) {
				stack[stack.length - 1].children.push({
					type: 'slot',
					name,
				})
			} else {
				// Check if there is a closing counterpart later in text
				const closingTag = `{/${name}}`
				const hasClosing = text.indexOf(closingTag, regex.lastIndex) !== -1

				if (hasClosing) {
					const newNode: I18nNode = {
						type: 'tag',
						name,
						children: [],
					}

					stack[stack.length - 1].children.push(newNode)

					stack.push({ name, children: newNode.children! })
				} else {
					// It's a slot: e.g. {userName}
					stack[stack.length - 1].children.push({
						type: 'slot',
						name,
					})
				}
			}
		}

		lastIndex = regex.lastIndex
	}

	// Add remaining text
	if (lastIndex < text.length) {
		stack[stack.length - 1].children.push({
			type: 'text',
			name: 'text',
			content: text.substring(lastIndex),
		})
	}

	return nodes
}

/**
 * Serializes a tree of I18nNodes back into a translation template string.
 */
export function serializeTranslation(nodes: I18nNode[]): string {
	if (!nodes || !Array.isArray(nodes)) return ''

	return nodes
		.map((node) => {
			if (node.type === 'text') {
				return node.content || ''
			}

			if (node.type === 'slot') {
				return `{${node.name}}`
			}

			if (node.type === 'tag') {
				const childrenStr = node.children ? serializeTranslation(node.children) : ''

				return `{${node.name}}${childrenStr}{/${node.name}}`
			}

			return ''
		})
		.join('')
}

const KNOWN_FORMAT_TAGS = new Set([
	'span',
	'b',
	'i',
	'u',
	'strong',
	'em',
	'code',
	'mark',
	'p',
	'div',
	'small',
	'a',
	'pre',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
])

/**
 * Validates syntax, pairing, and nesting of tags in a translation string.
 */
export function validateTranslation(text: string): ValidationResult {
	const errors: string[] = []

	if (!text) {
		return { isValid: true, errors }
	}

	const stack: { name: string; index: number }[] = []
	const regex = /\{(\/?)([a-zA-Z0-9_.-]+)\}/g
	let match: RegExpExecArray | null

	while ((match = regex.exec(text)) !== null) {
		const [, isClosing, name] = match
		const tagLower = name.toLowerCase()

		if (SELF_CLOSING_TAGS.has(tagLower)) {
			continue
		}

		if (isClosing) {
			if (stack.length === 0) {
				errors.push(`Found closing tag {/${name}} without matching opening tag`)
			} else {
				const top = stack[stack.length - 1]

				if (top.name !== name) {
					errors.push(`Mismatched closing tag: expected {/${top.name}} but found {/${name}} (improper nesting)`)

					// Look if the tag exists deeper in stack
					const foundIdx = stack.map((s) => s.name).lastIndexOf(name)

					if (foundIdx !== -1) {
						stack.splice(foundIdx, 1)
					}
				} else {
					stack.pop()
				}
			}
		} else {
			// Check if this tag has a closing tag in text
			const closingTag = `{/${name}}`
			const hasClosing = text.indexOf(closingTag, regex.lastIndex) !== -1

			if (hasClosing) {
				stack.push({ name, index: match.index })
			} else if (KNOWN_FORMAT_TAGS.has(tagLower)) {
				errors.push(`Unclosed opening tag {${name}}`)
			}
			// If not a known format tag and no closing tag, it is a slot ({slotName}), which is valid
		}
	}

	while (stack.length > 0) {
		const unclosed = stack.pop()!

		errors.push(`Unclosed opening tag {${unclosed.name}}`)
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}

/**
 * Wraps or unwraps selected text with an i18n tag: {tag}selected text{/tag}.
 * If the exact selected text is already wrapped with this tag, it removes the wrapping (unwraps).
 * Handles nested tags gracefully.
 */
export function wrapWithTag(
	text: string,
	start: number,
	end: number,
	tag: string
): { newText: string; newStart: number; newEnd: number } {
	const openTag = `{${tag}}`
	const closeTag = `{/${tag}}`

	// If no selection, insert empty tag pair with cursor inside
	if (start === end) {
		const defaultContent = 'text'
		const insertion = `${openTag}${defaultContent}${closeTag}`
		const newText = text.substring(0, start) + insertion + text.substring(end)

		return {
			newText,
			newStart: start + openTag.length,
			newEnd: start + openTag.length + defaultContent.length,
		}
	}

	const selected = text.substring(start, end)

	// Check if the selection itself is already wrapped with openTag and closeTag
	if (selected.startsWith(openTag) && selected.endsWith(closeTag)) {
		// Unwrap selection
		const unwrapped = selected.substring(openTag.length, selected.length - closeTag.length)
		const newText = text.substring(0, start) + unwrapped + text.substring(end)

		return {
			newText,
			newStart: start,
			newEnd: start + unwrapped.length,
		}
	}

	// Check if text immediately surrounding the selection is openTag and closeTag
	const hasSurroundingOpen = start >= openTag.length && text.substring(start - openTag.length, start) === openTag
	const hasSurroundingClose =
		end + closeTag.length <= text.length && text.substring(end, end + closeTag.length) === closeTag

	if (hasSurroundingOpen && hasSurroundingClose) {
		// Unwrap surrounding tags
		const newText = text.substring(0, start - openTag.length) + selected + text.substring(end + closeTag.length)

		return {
			newText,
			newStart: start - openTag.length,
			newEnd: start - openTag.length + selected.length,
		}
	}

	// Otherwise, wrap selection with tags (even if it has nested tags inside)
	const wrapped = `${openTag}${selected}${closeTag}`
	const newText = text.substring(0, start) + wrapped + text.substring(end)

	return {
		newText,
		newStart: start,
		newEnd: start + wrapped.length,
	}
}

/**
 * Removes a specific tag (or all instances of a tag) from text or selection.
 */
export function unwrapTag(
	text: string,
	start: number,
	end: number,
	tag?: string
): { newText: string; newStart: number; newEnd: number } {
	if (tag) {
		const openTag = `{${tag}}`
		const closeTag = `{/${tag}}`
		const selected = text.substring(start, end)
		const cleaned = selected.replaceAll(openTag, '').replaceAll(closeTag, '')
		const newText = text.substring(0, start) + cleaned + text.substring(end)

		return {
			newText,
			newStart: start,
			newEnd: start + cleaned.length,
		}
	}

	// If no tag specified, strip all tags from selection
	const selected = text.substring(start, end)
	const cleaned = selected.replace(/\{(\/?[a-zA-Z0-9_.-]+)\}/g, '')
	const newText = text.substring(0, start) + cleaned + text.substring(end)

	return {
		newText,
		newStart: start,
		newEnd: start + cleaned.length,
	}
}

/**
 * Converts translation template string with {tags} and {slots} to HTML representation for WYSIWYG editing.
 */
export function translationToHtml(text: string): string {
	if (!text) return ''

	const nodes = parseTranslation(text)

	const nodeToHtml = (node: I18nNode): string => {
		if (node.type === 'text') {
			return escapeHtml(node.content || '')
		}

		if (node.type === 'slot') {
			if (node.name === 'br') return '<br/>'
			if (node.name === 'hr') return '<hr/>'

			return `<span class="gp-slot-chip" data-slot="${node.name}" contenteditable="false">{${node.name}}</span>`
		}

		if (node.type === 'tag') {
			const inner = (node.children || []).map(nodeToHtml).join('')
			const tag = node.name.toLowerCase()

			if (tag === 'b' || tag === 'strong') return `<b>${inner}</b>`
			if (tag === 'i' || tag === 'em') return `<i>${inner}</i>`
			if (tag === 'u') return `<u>${inner}</u>`
			if (tag === 'code') return `<code>${inner}</code>`
			if (tag === 'span') return `<span class="gp-highlight-span">${inner}</span>`

			return `<span data-gp-tag="${node.name}">${inner}</span>`
		}

		return ''
	}

	return nodes.map(nodeToHtml).join('')
}

/**
 * Converts HTML representation from visual editor back to translation template string.
 */
export function htmlToTranslation(html: string): string {
	if (!html) return ''

	let res = html

	// Replace slot chips first
	res = res.replace(/<span[^>]*class="[^"]*gp-slot-chip[^"]*"[^>]*data-slot="([^"]+)"[^>]*>.*?<\/span>/gi, '{$1}')

	res = res.replace(/<span[^>]*data-slot="([^"]+)"[^>]*>.*?<\/span>/gi, '{$1}')

	// Replace custom tag spans
	res = res.replace(/<span[^>]*data-gp-tag="([^"]+)"[^>]*>(.*?)<\/span>/gi, '{$1}$2{/$1}')

	// Replace highlight spans
	res = res.replace(/<span[^>]*class="[^"]*gp-highlight-span[^"]*"[^>]*>(.*?)<\/span>/gi, '{span}$1{/span}')

	// Replace basic standard HTML tags
	res = res.replace(/<b>(.*?)<\/b>/gi, '{b}$1{/b}')

	res = res.replace(/<strong>(.*?)<\/strong>/gi, '{b}$1{/b}')

	res = res.replace(/<i>(.*?)<\/i>/gi, '{i}$1{/i}')

	res = res.replace(/<em>(.*?)<\/em>/gi, '{i}$1{/i}')

	res = res.replace(/<u>(.*?)<\/u>/gi, '{u}$1{/u}')

	res = res.replace(/<code>(.*?)<\/code>/gi, '{code}$1{/code}')

	res = res.replace(/<br\s*\/?>/gi, '{br}')

	res = res.replace(/<hr\s*\/?>/gi, '{hr}')

	// Strip remaining unknown HTML tags while preserving text
	res = res.replace(/<[^>]+>/g, '')

	// Unescape HTML entities
	res = unescapeHtml(res)

	return res
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

function unescapeHtml(str: string): string {
	return str
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&nbsp;/g, ' ')
}
