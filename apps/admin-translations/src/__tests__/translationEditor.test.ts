/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'

import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'

import TranslationEditor from '../features/translation-editor/ui/TranslationEditor.vue'

describe('TranslationEditor Component', () => {
	it('mounts properly and renders initial translation text', () => {
		const wrapper = mount(TranslationEditor, {
			props: {
				modelValue: 'Привет, {span}красивый {b}мир{/b}{/span}!',
			},
			global: {
				plugins: [ElementPlus],
			},
		})

		expect(wrapper.exists()).toBe(true)

		expect(wrapper.find('.translation-editor').exists()).toBe(true)

		expect(wrapper.find('.editor-toolbar').exists()).toBe(true)
	})

	it('shows valid syntax indicator for well-formed nested translation', () => {
		const wrapper = mount(TranslationEditor, {
			props: {
				modelValue: '{span}Добро пожаловать, {b}{userName}{/b}!{/span}',
			},
			global: {
				plugins: [ElementPlus],
			},
		})

		const validStatus = wrapper.find('.validation-status.is-valid')

		expect(validStatus.exists()).toBe(true)

		expect(validStatus.text()).toContain('Синтаксис тегов корректен')
	})

	it('shows invalid syntax indicator and error message for unclosed tag', () => {
		const wrapper = mount(TranslationEditor, {
			props: {
				modelValue: 'Текст {span}без закрывающего тега',
			},
			global: {
				plugins: [ElementPlus],
			},
		})

		const invalidStatus = wrapper.find('.validation-status.is-invalid')

		expect(invalidStatus.exists()).toBe(true)

		expect(invalidStatus.find('.error-msg').text()).toContain('Unclosed')
	})

	it('toggles mode between visual and source editor', async () => {
		const wrapper = mount(TranslationEditor, {
			props: {
				modelValue: 'Тестовая строка',
			},
			global: {
				plugins: [ElementPlus],
			},
		})

		const modeButtons = wrapper.findAll('.mode-btn')

		expect(modeButtons.length).toBe(2)

		// Click "Теги / Исходник"
		await modeButtons[1].trigger('click')

		expect(wrapper.find('.source-textarea').isVisible()).toBe(true)

		// Click "Визуальный"
		await modeButtons[0].trigger('click')

		expect(wrapper.find('.visual-editor').isVisible()).toBe(true)
	})

	it('emits update:modelValue when typing in source mode', async () => {
		const wrapper = mount(TranslationEditor, {
			props: {
				modelValue: 'Старый текст',
			},
			global: {
				plugins: [ElementPlus],
			},
		})

		// Switch to source mode
		const modeButtons = wrapper.findAll('.mode-btn')

		await modeButtons[1].trigger('click')

		const textarea = wrapper.find('.source-textarea')

		await textarea.setValue('Новый текст с {b}тегом{/b}')

		expect(wrapper.emitted('update:modelValue')).toBeTruthy()

		const emittedValues = wrapper.emitted('update:modelValue')!

		expect(emittedValues[emittedValues.length - 1]).toEqual(['Новый текст с {b}тегом{/b}'])
	})

	it('toggles live preview section and detects slots', async () => {
		const wrapper = mount(TranslationEditor, {
			props: {
				modelValue: 'Привет, {userName}! Твой баланс {balance}',
			},
			global: {
				plugins: [ElementPlus],
			},
		})

		const previewToggle = wrapper.find('.preview-toggle-btn')

		expect(wrapper.find('.editor-preview-card').exists()).toBe(false)

		await previewToggle.trigger('click')

		expect(wrapper.find('.editor-preview-card').exists()).toBe(true)

		expect(wrapper.find('.preview-title').text()).toContain('Живой предпросмотр')

		// Should show mock params for detected slots: userName, balance
		const paramKeys = wrapper.findAll('.param-key').map((el) => el.text())

		expect(paramKeys).toContain('userName:')

		expect(paramKeys).toContain('balance:')
	})
})
