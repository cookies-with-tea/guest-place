import { describe, expect, it } from 'vitest'

import {
	htmlToTranslation,
	parseTranslation,
	serializeTranslation,
	translationToHtml,
	unwrapTag,
	validateTranslation,
	wrapWithTag,
} from '../parser'

describe('All Translation Cases & Parser Suite', () => {
	describe('1. Parsing Cases', () => {
		it('Case 1: parses plain text without any tags or slots', () => {
			const text = 'Simple plain translation text.'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(1)

			expect(nodes[0]).toEqual({
				type: 'text',
				name: 'text',
				content: text,
			})

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 2: parses a single formatting tag', () => {
			const text = 'Hello, {span}world{/span}!'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(3)

			expect(nodes[0]).toEqual({ type: 'text', name: 'text', content: 'Hello, ' })

			expect(nodes[1]).toEqual({
				type: 'tag',
				name: 'span',
				children: [{ type: 'text', name: 'text', content: 'world' }],
			})

			expect(nodes[2]).toEqual({ type: 'text', name: 'text', content: '!' })

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 3: parses multiple sibling tags', () => {
			const text = '{b}Bold{/b} and {i}Italic{/i} and {u}Underline{/u}'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(5)

			expect(nodes[0].type).toBe('tag')

			expect(nodes[0].name).toBe('b')

			expect(nodes[2].type).toBe('tag')

			expect(nodes[2].name).toBe('i')

			expect(nodes[4].type).toBe('tag')

			expect(nodes[4].name).toBe('u')

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 4: parses 2-level nested tags', () => {
			const text = 'Привет, {span}красивый {b}мир{/b} вокруг{/span}!'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(3)

			const spanNode = nodes[1]

			expect(spanNode.type).toBe('tag')

			expect(spanNode.name).toBe('span')

			expect(spanNode.children).toHaveLength(3)

			expect(spanNode.children?.[0]).toEqual({ type: 'text', name: 'text', content: 'красивый ' })

			expect(spanNode.children?.[1]).toEqual({
				type: 'tag',
				name: 'b',
				children: [{ type: 'text', name: 'text', content: 'мир' }],
			})

			expect(spanNode.children?.[2]).toEqual({ type: 'text', name: 'text', content: ' вокруг' })

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 5: parses deep nested tags (3+ levels)', () => {
			const text = '{div}{p}{span}Начало {b}{i}{code}Глубокий код{/code}{/i}{/b} Конец{/span}{/p}{/div}'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(1)

			expect(nodes[0].name).toBe('div')

			const p = nodes[0].children![0]

			expect(p.name).toBe('p')

			const span = p.children![0]

			expect(span.name).toBe('span')

			const b = span.children![1]

			expect(b.name).toBe('b')

			const i = b.children![0]

			expect(i.name).toBe('i')

			const code = i.children![0]

			expect(code.name).toBe('code')

			expect(code.children![0].content).toBe('Глубокий код')

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 6: parses dynamic slot parameters', () => {
			const text = 'Здравствуйте, {userName}! У вас {count} новых сообщений.'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(5)

			expect(nodes[1]).toEqual({ type: 'slot', name: 'userName' })

			expect(nodes[3]).toEqual({ type: 'slot', name: 'count' })

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 7: parses slots inside nested tags', () => {
			const text = '{span}Добро пожаловать, {b}{userName}{/b}!{/span}'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(1)

			const span = nodes[0]

			expect(span.name).toBe('span')

			const b = span.children![1]

			expect(b.name).toBe('b')

			expect(b.children![0]).toEqual({ type: 'slot', name: 'userName' })

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 8: parses self-closing tags like {br} and {hr}', () => {
			const text = 'Строка 1{br}Строка 2{hr}Строка 3'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(5)

			expect(nodes[1]).toEqual({ type: 'slot', name: 'br' })

			expect(nodes[3]).toEqual({ type: 'slot', name: 'hr' })

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 9: parses repeating identical tags cleanly', () => {
			const text = '{b}Первый{/b} разделитель {b}Второй{/b} разделитель {b}Третий{/b}'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(5)

			expect(nodes[0].name).toBe('b')

			expect(nodes[2].name).toBe('b')

			expect(nodes[4].name).toBe('b')

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 10: handles Unicode, Cyrillic, emojis, and special symbols', () => {
			const text = '🎉 Спецпредложение: {b}100% скидка & $50 бонус{/b} для {name}!'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(5)

			expect(nodes[1].name).toBe('b')

			expect(nodes[1].children![0].content).toBe('100% скидка & $50 бонус')

			expect(nodes[3]).toEqual({ type: 'slot', name: 'name' })

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 11: handles empty tag pairs', () => {
			const text = 'Prefix {b}{/b} Postfix'
			const nodes = parseTranslation(text)

			expect(nodes).toHaveLength(3)

			expect(nodes[1]).toEqual({ type: 'tag', name: 'b', children: [] })

			expect(serializeTranslation(nodes)).toBe(text)
		})

		it('Case 12: handles unclosed tags gracefully without crashing', () => {
			const text = 'Prefix {span}This tag was not closed in time'
			const nodes = parseTranslation(text)

			// Unclosed tag without counterpart is treated as slot or text
			expect(nodes.length).toBeGreaterThanOrEqual(1)
		})

		it('Case 13: handles mismatched tags gracefully', () => {
			const text = 'Prefix {b}Text{/span} Postfix'
			const nodes = parseTranslation(text)

			expect(nodes.length).toBeGreaterThan(0)
		})
	})

	describe('2. Validation Cases', () => {
		it('validates well-formed translation as valid', () => {
			const valid1 = 'Простой текст'
			const valid2 = '{span}Привет, {b}мир{/b}!{/span}'
			const valid3 = 'Привет {name}, ваш баланс: {balance} руб.'

			expect(validateTranslation(valid1).isValid).toBe(true)

			expect(validateTranslation(valid2).isValid).toBe(true)

			expect(validateTranslation(valid3).isValid).toBe(true)
		})

		it('detects unclosed tags and reports error', () => {
			const invalid = 'Привет {span}мир без закрытия'
			const result = validateTranslation(invalid)

			expect(result.isValid).toBe(false)

			expect(result.errors.length).toBeGreaterThan(0)

			expect(result.errors[0]).toContain('Unclosed')
		})

		it('detects mismatched nesting order and reports error', () => {
			const invalid = '{span}{b}текст{/span}{/b}'
			const result = validateTranslation(invalid)

			expect(result.isValid).toBe(false)

			expect(result.errors.length).toBeGreaterThan(0)
		})

		it('detects closing tag without opening tag', () => {
			const invalid = 'Текст {/span} лишний'
			const result = validateTranslation(invalid)

			expect(result.isValid).toBe(false)

			expect(result.errors[0]).toContain('without matching opening tag')
		})
	})

	describe('3. Tag Insertion, Wrapping and Nesting in Selection', () => {
		it('wraps plain text selection in a tag', () => {
			const text = 'Привет, мир!'
			// Select "мир" (indices 8 to 11)
			const res = wrapWithTag(text, 8, 11, 'b')

			expect(res.newText).toBe('Привет, {b}мир{/b}!')
		})

		it('inserts nested tag inside an existing tag', () => {
			const text = 'Привет, {span}красивый мир{/span}!'
			// Select "красивый" (indices 14 to 22)
			const res = wrapWithTag(text, 14, 22, 'b')

			expect(res.newText).toBe('Привет, {span}{b}красивый{/b} мир{/span}!')
		})

		it('wraps entire tag in an outer tag (multi-level nesting)', () => {
			const text = 'Привет, {b}мир{/b}!'
			// Select "{b}мир{/b}" (indices 8 to 18)
			const res = wrapWithTag(text, 8, 18, 'span')

			expect(res.newText).toBe('Привет, {span}{b}мир{/b}{/span}!')
		})

		it('toggles/unwraps tag when selection matches the tag exactly', () => {
			const text = 'Привет, {b}мир{/b}!'
			// Select "{b}мир{/b}" (indices 8 to 18)
			const res = wrapWithTag(text, 8, 18, 'b')

			expect(res.newText).toBe('Привет, мир!')
		})

		it('unwraps tag when selection is the inner text and surrounded by tag', () => {
			const text = 'Привет, {b}мир{/b}!'
			// Select "мир" (indices 11 to 14)
			const res = wrapWithTag(text, 11, 14, 'b')

			expect(res.newText).toBe('Привет, мир!')
		})

		it('inserts default tag pair when selection is empty (collapsed cursor)', () => {
			const text = 'Привет, !'
			const res = wrapWithTag(text, 8, 8, 'code')

			expect(res.newText).toBe('Привет, {code}text{/code}!')
		})

		it('removes tags with unwrapTag utility', () => {
			const text = '{span}Привет, {b}мир{/b}!{/span}'
			// Remove only {b}
			const resB = unwrapTag(text, 0, text.length, 'b')

			expect(resB.newText).toBe('{span}Привет, мир!{/span}')

			// Strip all tags
			const resAll = unwrapTag(text, 0, text.length)

			expect(resAll.newText).toBe('Привет, мир!')
		})
	})

	describe('4. Bi-directional HTML <-> Translation Template', () => {
		it('converts template to HTML with formatting and slot chips', () => {
			const template = 'Привет, {span}красивый {b}мир{/b}{/span} для {userName}!'
			const html = translationToHtml(template)

			expect(html).toContain('<b>мир</b>')

			expect(html).toContain('gp-highlight-span')

			expect(html).toContain('data-slot="userName"')
		})

		it('converts HTML back to template preserving tags and slots', () => {
			const html =
				'Привет, <span class="gp-highlight-span">красивый <b>мир</b></span> для <span class="gp-slot-chip" data-slot="userName">{userName}</span>!'
			const template = htmlToTranslation(html)

			expect(template).toBe('Привет, {span}красивый {b}мир{/b}{/span} для {userName}!')
		})

		it('converts self-closing tags <br/> and <hr/> faithfully', () => {
			const template = 'Строка 1{br}Строка 2{hr}Строка 3'
			const html = translationToHtml(template)

			expect(html).toContain('<br/>')

			expect(html).toContain('<hr/>')

			const roundtrip = htmlToTranslation(html)

			expect(roundtrip).toBe(template)
		})
	})
})
