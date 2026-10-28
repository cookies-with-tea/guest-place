import { UiStatCard } from '@admin-panel/ui'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof UiStatCard> = {
	title: 'Ui/StatCard',
	component: UiStatCard,
	tags: ['autodocs'],
	args: {
		label: 'Pageviews',
		value: '50.8K',
		trend: 28.4,
		icon: '👁️',
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Up: Story = {
	args: {
		label: 'Pageviews',
		value: '50.8K',
		trend: 28.4,
		icon: '👁️',
	},
}

export const Down: Story = {
	args: {
		label: 'Bounce Rate',
		value: '16%',
		trend: -12.6,
		icon: '📉',
	},
}

export const WithTrendLabel: Story = {
	args: {
		label: 'Total revenue',
		value: '$240.8K',
		trend: 24.6,
		trendLabel: 'vs. last 12 months',
	},
}
