<template>
	<div ref="chartContainer" class="mfe-stats-chart">
		<svg ref="svgRef"></svg>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import * as d3 from 'd3'

interface Node extends d3.SimulationNodeDatum {
	id: string
	group: number
	status: 'online' | 'offline'
	type: 'shell' | 'mfe' | 'route' | 'package'
	x?: number
	y?: number
}

interface Link extends d3.SimulationLinkDatum<Node> {
	source: any
	target: any
	value: number
}

const props = defineProps<{
	data: {
		nodes: Node[]
		links: Link[]
	}
}>()

const chartContainer = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)

const initChart = () => {
	if (!svgRef.value || !chartContainer.value) return

	const width = chartContainer.value.clientWidth
	const height = 500 // Increased height for more nodes

	// Deep copy for D3 mutations
	const nodes = props.data.nodes.map((d) => ({ ...d }))
	const links = props.data.links.map((d) => ({ ...d }))

	// Clear previous content
	d3.select(svgRef.value).selectAll('*').remove()

	const svg = d3.select(svgRef.value).attr('width', width).attr('height', height).attr('viewBox', [0, 0, width, height])

	// Zoom and Pan
	const g = svg.append('g')

	const zoom = d3
		.zoom()
		.scaleExtent([0.1, 8])
		.on('zoom', (event) => {
			g.attr('transform', event.transform)
		})

	svg.call(zoom as any)

	// Add glow filter
	const defs = svg.append('defs')

	// Shell/MFE glow
	const glow = defs.append('filter').attr('id', 'glow')

	glow.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'coloredBlur')

	const feMergeGlow = glow.append('feMerge')

	feMergeGlow.append('feMergeNode').attr('in', 'coloredBlur')

	feMergeGlow.append('feMergeNode').attr('in', 'SourceGraphic')

	// Route glow (purple)
	const routeGlow = defs.append('filter').attr('id', 'routeGlow')

	routeGlow.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur')

	const feMergeRoute = routeGlow.append('feMerge')

	feMergeRoute.append('feMergeNode').attr('in', 'coloredBlur')

	feMergeRoute.append('feMergeNode').attr('in', 'SourceGraphic')

	const simulation = d3
		.forceSimulation(nodes as any)
		.force(
			'link',
			d3
				.forceLink(links)
				.id((d: any) => d.id)
				.distance((d: any) => {
					if (d.target.type === 'route') return 60
					if (d.target.type === 'package') return 100

					return 180
				})
		)
		.force(
			'charge',
			d3.forceManyBody().strength((d: any) => {
				if (d.type === 'shell') return -1000
				if (d.type === 'package') return -200

				return -500
			})
		)
		.force('center', d3.forceCenter(width / 2, height / 2))
		.force(
			'collision',
			d3.forceCollide().radius((d: any) => {
				if (d.type === 'shell') return 60
				if (d.type === 'route') return 30

				return 40
			})
		)

	const link = g
		.append('g')
		.selectAll('path')
		.data(links)
		.join('path')
		.attr('fill', 'none')
		.attr('stroke', (d: any) => {
			if (d.target.type === 'route') return 'rgba(100, 108, 255, 0.15)'
			if (d.target.type === 'package') return 'rgba(144, 147, 153, 0.1)'

			return 'rgba(66, 184, 131, 0.2)'
		})
		.attr('stroke-width', (d: any) => (d.target.type === 'package' ? 1 : 2))
		.attr('stroke-dasharray', (d: any) => (d.target.type === 'package' ? '4,4' : 'none'))
		.attr('class', 'link-path')

	const nodeGroup = g
		.append('g')
		.selectAll('g')
		.data(nodes)
		.join('g')
		.attr('class', (d) => `node-group type-${d.type}`)
		.call(drag(simulation as any) as any)

	// Node circles
	nodeGroup
		.append('circle')
		.attr('r', (d) => {
			if (d.type === 'shell') return 20
			if (d.type === 'mfe') return 14
			if (d.type === 'route') return 8

			return 6
		})
		.attr('fill', (d) => {
			if (d.type === 'shell') return '#35495e'
			if (d.type === 'route') return '#646cff'
			if (d.type === 'package') return '#909399'

			return d.status === 'online' ? '#42b883' : '#ff5f5f'
		})
		.attr('stroke', (d) => (d.type === 'shell' ? '#42b883' : 'transparent'))
		.attr('stroke-width', 2)
		.style('filter', (d) => {
			if (d.type === 'shell' || (d.type === 'mfe' && d.status === 'online')) return 'url(#glow)'
			if (d.type === 'route') return 'url(#routeGlow)'

			return 'none'
		})
		.attr('class', 'node-circle')
		.style('opacity', (d) => (d.type === 'package' ? 0.6 : 1))

	// Labels
	nodeGroup
		.append('text')
		.text((d) => d.id)
		.attr('dx', (d) => {
			if (d.type === 'shell') return 28
			if (d.type === 'mfe') return 20

			return 14
		})
		.attr('dy', 5)
		.attr('class', 'node-text')
		.style('font-size', (d) => {
			if (d.type === 'shell') return '14px'
			if (d.type === 'mfe') return '12px'

			return '10px'
		})
		.style('font-weight', (d) => (d.type === 'shell' || d.type === 'mfe' ? '700' : '500'))
		.style('pointer-events', 'none')
		.style('opacity', (d) => (d.type === 'package' ? 0.5 : 1))

	simulation.on('tick', () => {
		link.attr('d', (d: any) => {
			const dx = d.target.x - d.source.x
			const dy = d.target.y - d.source.y
			const dr = Math.sqrt(dx * dx + dy * dy) * 1.5

			return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`
		})

		nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
	})

	function drag(simulation: d3.Simulation<Node, undefined>) {
		function dragstarted(event: any) {
			if (!event.active) simulation.alphaTarget(0.3).restart()
			event.subject.fx = event.subject.x

			event.subject.fy = event.subject.y
		}

		function dragged(event: any) {
			event.subject.fx = event.x

			event.subject.fy = event.y
		}

		function dragended(event: any) {
			if (!event.active) simulation.alphaTarget(0)
			event.subject.fx = null

			event.subject.fy = null
		}

		return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
	}
}

onMounted(() => {
	initChart()
})

watch(
	() => props.data,
	() => {
		initChart()
	},
	{ deep: true }
)
</script>

<style scoped>
.mfe-stats-chart {
	width: 100%;
	height: 400px;
	position: relative;
	border-radius: 12px;
	background: transparent;
	cursor: grab;
	overflow: hidden;
}

.mfe-stats-chart:active {
	cursor: grabbing;
}

.chart-overlay {
	top: 16px;
	right: 16px;
	position: absolute;
	pointer-events: none;
}

.status-badge {
	border: 1px solid rgb(66, 184, 131, 0.3);
	border-radius: 20px;
	font-weight: 700;
	font-size: 10px;
	letter-spacing: 1px;
	text-transform: uppercase;
	color: #42b883;
	background: rgb(0, 0, 0, 0.5);
	padding: 4px 12px;
}

.status-badge.is-online::before {
	content: '';
	width: 6px;
	height: 6px;
	display: inline-block;
	border-radius: 50%;
	box-shadow: 0 0 8px #42b883;
	background: #42b883;
	margin-right: 8px;
}

:deep(.link-path) {
	transition: stroke 0.3s;
}

:deep(.node-text) {
	fill: var(--gp-text-main) !important;
}

:deep(.node-circle) {
	transition: transform 0.2s;
	cursor: grab;
}

:deep(.node-circle:hover) {
	transform: scale(1.1);
}
</style>
