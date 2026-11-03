<script lang="ts">
import { computed, defineComponent, h, type PropType } from 'vue'

import { useI18n } from '../index'
import type { I18nNode } from '../parser'

export default defineComponent({
	name: 'UiTranslation',
	props: {
		/**
		 * Translation key
		 */
		path: {
			type: String as PropType<string>,
			required: true,
		},
		/**
		 * Values for substitutions and slots
		 */
		params: {
			type: Object as PropType<Record<string, any>>,
			default: () => ({}),
		},
		/**
		 * Wrapper element
		 */
		tag: {
			type: String as PropType<string>,
			default: 'span',
		},
	},
	setup(props, { slots, expose }) {
		const { getNodes } = useI18n()

		const nodes = computed(() => getNodes(props.path))

		const renderNode = (node: I18nNode): any => {
			if (node.type === 'text') {
				return node.content
			}

			if (node.type === 'slot') {
				// If a slot with this name exists in the template, use it
				if (slots[node.name]) {
					return slots[node.name]!({
						value: props.params[node.name],
					})
				}

				// Otherwise, just render the param value as text
				return props.params[node.name] ?? `{${node.name}}`
			}

			if (node.type === 'tag') {
				const children = (node.children || []).map(renderNode)

				// Allow overriding tags with slots (e.g. <template #span="{ value }">)
				if (slots[node.name]) {
					return slots[node.name]!({
						children,
						value:
							children.length === 1 && (typeof children[0] === 'string' || typeof children[0] === 'number')
								? children[0]
								: undefined,
					})
				}

				// Map common tags for safe rendering
				const allowedTags = ['span', 'b', 'i', 'strong', 'em', 'u', 'br', 'hr', 'p', 'div', 'small', 'code', 'pre']

				const tagName = allowedTags.includes(node.name) ? node.name : 'span'

				// Self-closing tags don't need children array
				if (tagName === 'br' || tagName === 'hr') {
					return h(tagName)
				}

				return h(tagName, {}, children)
			}

			return null
		}

		expose({
			nodes,
		})

		return () => {
			return h(props.tag, {}, nodes.value.map(renderNode))
		}
	},
})
</script>
