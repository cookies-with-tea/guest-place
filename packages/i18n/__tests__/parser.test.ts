import { describe, expect, it } from 'vitest'

import { parseTranslation } from '../parser'

describe('parseTranslation', () => {
	it('should parse simple text', () => {
		const nodes = parseTranslation('Hello World')

		expect(nodes).toHaveLength(1)

		expect(nodes[0]).toEqual({ type: 'text', name: 'text', content: 'Hello World' })
	})

	it('should parse text with slots', () => {
		const nodes = parseTranslation('Hello {userName}')

		expect(nodes).toHaveLength(2)

		expect(nodes[0].type).toBe('text')

		expect(nodes[1]).toEqual({ type: 'slot', name: 'userName' })
	})

	it('should parse nested tags', () => {
		const nodes = parseTranslation('{span}Text {b}Bold{/b}{/span}')

		expect(nodes).toHaveLength(1)

		expect(nodes[0].type).toBe('tag')

		expect(nodes[0].name).toBe('span')

		expect(nodes[0].children).toHaveLength(2)

		expect(nodes[0].children?.[1].type).toBe('tag')

		expect(nodes[0].children?.[1].name).toBe('b')
	})

	it('should handle self-closing tags or slots', () => {
		const nodes = parseTranslation('Line one{br}Line two')

		expect(nodes).toHaveLength(3)

		expect(nodes[1]).toEqual({ type: 'slot', name: 'br' })
	})

	it('should handle mixed content', () => {
		const nodes = parseTranslation('Click {a}here{/a} to {action}')

		expect(nodes).toHaveLength(4)

		expect(nodes[1].type).toBe('tag')

		expect(nodes[3].type).toBe('slot')
	})
})
