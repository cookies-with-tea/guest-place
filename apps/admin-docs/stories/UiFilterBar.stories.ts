import { UiFilterBar } from '@admin-panel/ui'
import { ElInput, ElOption, ElSelect } from 'element-plus'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof UiFilterBar> = {
	title: 'Ui/FilterBar',
	component: UiFilterBar,
	tags: ['autodocs'],
	args: {
		totalLabel: 'Total: 12',
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const WithControls: Story = {
	render: (args) => ({
		components: { UiFilterBar, ElInput, ElSelect, ElOption },
		setup: () => ({ args }),
		template: `
			<UiFilterBar v-bind="args">
				<ElInput placeholder="Search by name..." clearable style="width: 280px" />
				<ElSelect style="width: 160px" model-value="all">
					<ElOption label="All statuses" value="all" />
					<ElOption label="Active only" value="active" />
					<ElOption label="Inactive only" value="inactive" />
				</ElSelect>
			</UiFilterBar>
		`,
	}),
}

export const WithoutTotal: Story = {
	args: {
		totalLabel: undefined,
	},
	render: (args) => ({
		components: { UiFilterBar, ElInput },
		setup: () => ({ args }),
		template: `
			<UiFilterBar v-bind="args">
				<ElInput placeholder="Search..." clearable style="width: 280px" />
			</UiFilterBar>
		`,
	}),
}
