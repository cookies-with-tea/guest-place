import { UiButton } from '@admin-panel/ui'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
	title: 'Ui/Button',
	component: UiButton,
	// This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	argTypes: {
		size: { control: 'select', options: ['m', 'l'] },
		appearance: { control: 'select', options: ['primary', 'secondary', 'text'] },
		as: { control: 'select', options: ['button', 'router-link'] },
	},
	args: {
		appearance: 'primary',
		as: 'button',
		size: 'm',
	},
} satisfies Meta<typeof UiButton>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {
		default: 'Primary Button',
		appearance: 'primary',
		as: 'button',
		size: 'm',
	},
}

export const Secondary: Story = {
	args: {
		default: 'Secondary Button',
		appearance: 'secondary',
		as: 'button',
		size: 'm',
	},
}

export const Text: Story = {
	args: {
		default: 'Text Button',
		appearance: 'text',
		as: 'button',
		size: 'm',
	},
}
