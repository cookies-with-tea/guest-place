import { UiRichTextField } from '@admin-panel/ui'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof UiRichTextField> = {
	title: 'Ui/RichTextField',
	component: UiRichTextField,
	tags: ['autodocs'],
	argTypes: {
		mode: { control: 'select', options: ['simple', 'full'] },
	},
	args: {
		mode: 'simple',
		namespace: 'storybook',
		fieldPath: 'demo',
		placeholder: 'Введите текст…',
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const SimpleText: Story = {
	args: {
		mode: 'simple',
		modelValue: 'Выделите слово и нажмите «В перевод», «Исключить» или «Валюта».',
	},
}

export const SimpleMultiline: Story = {
	args: {
		mode: 'simple',
		multiline: true,
		modelValue: 'Первая строка.{br}Вторая строка с {key:storybook.demo.1}ключом перевода{/key:storybook.demo.1}.',
	},
}

export const FullRichText: Story = {
	args: {
		mode: 'full',
		modelValue: '<p>Полноценный WYSIWYG-редактор с поддержкой <b>жирного</b> текста и переводов.</p>',
	},
}

export const Disabled: Story = {
	args: {
		mode: 'simple',
		disabled: true,
		modelValue: 'Поле недоступно для редактирования.',
	},
}
