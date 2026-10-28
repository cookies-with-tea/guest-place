import { UiSparkline } from '@admin-panel/ui'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof UiSparkline> = {
	title: 'Ui/Sparkline',
	component: UiSparkline,
	tags: ['autodocs'],
	args: {
		data: [12, 18, 14, 22, 19, 28, 24, 30],
	},
	render: (args) => ({
		components: { UiSparkline },
		setup: () => ({ args }),
		template: `<div style="width: 220px"><UiSparkline v-bind="args" /></div>`,
	}),
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoFill: Story = {
	args: { areaFill: false, color: 'var(--el-color-danger, #f04438)' },
}
