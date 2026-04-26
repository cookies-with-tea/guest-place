export interface I18nNode {
	type: 'text' | 'tag' | 'slot'
	name: string
	content?: string
	children?: I18nNode[]
}

/**
 * Parses a translation string into a tree of nodes.
 * Supports:
 * - Nested tags: {span}Text {b}Bold{/b}{/span}
 * - Slots: {userName}
 * - Self-closing tags: {br}
 */
export function parseTranslation(text: string): I18nNode[] {
	const nodes: I18nNode[] = []
	const stack: { name: string; children: I18nNode[] }[] = [{ name: 'root', children: nodes }]

	// Regex to match {tag}, {/tag}, or {slot}
	const regex = /\{(\/?)([a-zA-Z0-9_.-]+)\}/g
	let lastIndex = 0
	let match

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
			// Find the matching open tag in stack
			if (stack.length > 1 && stack[stack.length - 1].name === name) {
				stack.pop()
			} else {
				// Mismatched closing tag, treat as text
				stack[stack.length - 1].children.push({
					type: 'text',
					name: 'text',
					content: fullMatch,
				})
			}
		} else {
			// Check if it's a tag (has a closing counterpart) or a slot
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
				// It's a slot or a self-closing tag (like br)
				stack[stack.length - 1].children.push({
					type: 'slot',
					name,
				})
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
