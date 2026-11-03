import { UiRankedList } from '@admin-panel/ui'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta: Meta<typeof UiRankedList> = {
	title: 'Ui/RankedList',
	component: UiRankedList,
	tags: ['autodocs'],
	args: {
		items: [
			{ label: 'United States', value: '100%', percent: 100, trend: -10, icon: '🇺🇸' },
			{ label: 'United Kingdom', value: '72%', percent: 72, trend: 12, icon: '🇬🇧' },
			{ label: 'Australia', value: '54%', percent: 54, trend: 20, icon: '🇦🇺' },
			{ label: 'Denmark', value: '30%', percent: 30, trend: -30, icon: '🇩🇰' },
		],
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoTrack: Story = {
	args: {
		items: [
			{ label: 'Slack', value: '$25' },
			{ label: 'Drive', value: '$20' },
			{ label: 'Dropbox', value: '$30' },
		],
	},
}
