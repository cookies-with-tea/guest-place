import { UiAreaChart } from '@admin-panel/ui'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof UiAreaChart> = {
	title: 'Ui/AreaChart',
	component: UiAreaChart,
	tags: ['autodocs'],
	args: {
		categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		series: [{ name: 'Revenue', data: [30, 55, 40, 70, 60, 95] }],
	},
	render: (args) => ({
		components: { UiAreaChart },
		setup: () => ({ args }),
		template: `<div style="height: 320px"><UiAreaChart v-bind="args" /></div>`,
	}),
}

export default meta

type Story = StoryObj<typeof meta>

export const SingleSeries: Story = {}

export const TwoSeries: Story = {
	args: {
		categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		series: [
			{ name: 'Revenue', data: [30, 55, 40, 70, 60, 95] },
			{ name: 'Expenses', data: [20, 30, 35, 40, 38, 50] },
		],
	},
}
