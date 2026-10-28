import { UiDonutProgress } from '@admin-panel/ui'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof UiDonutProgress> = {
	title: 'Ui/DonutProgress',
	component: UiDonutProgress,
	tags: ['autodocs'],
	args: {
		percent: 80,
		label: 'Earning',
		size: 140,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = {
	args: { percent: 50, size: 80, label: 'Growth' },
}

export const CustomColor: Story = {
	args: { percent: 70, color: 'var(--el-color-success, #10b981)', label: 'Completed' },
}
