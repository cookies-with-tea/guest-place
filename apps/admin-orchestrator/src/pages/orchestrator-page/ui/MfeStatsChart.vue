<template>
  <div class="mfe-stats-chart" ref="chartContainer">
    <div class="chart-overlay">
      <div class="status-badge" :class="{ 'is-online': true }">System Live</div>
    </div>
    <svg ref="svgRef"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'

interface Node extends d3.SimulationNodeDatum {
  id: string
  group: number
  status: 'online' | 'offline'
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
  const height = 400

  // Deep copy for D3 mutations
  const nodes = props.data.nodes.map(d => ({ ...d }))
  const links = props.data.links.map(d => ({ ...d }))

  // Clear previous content
  d3.select(svgRef.value).selectAll('*').remove()

  const svg = d3.select(svgRef.value)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // Add glow filter
  const defs = svg.append('defs')
  const filter = defs.append('filter')
    .attr('id', 'glow')
  
  filter.append('feGaussianBlur')
    .attr('stdDeviation', '3.5')
    .attr('result', 'coloredBlur')
  
  const feMerge = filter.append('feMerge')
  feMerge.append('feMergeNode')
    .attr('in', 'coloredBlur')
  feMerge.append('feMergeNode')
    .attr('in', 'SourceGraphic')

  const simulation = d3.forceSimulation(nodes as any)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(50))

  const link = svg.append('g')
    .selectAll('path')
    .data(links)
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', 'rgba(66, 184, 131, 0.2)')
    .attr('stroke-width', 2)
    .attr('class', 'link-path')

  const nodeGroup = svg.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .call(drag(simulation as any) as any)

  // Node circles
  nodeGroup.append('circle')
    .attr('r', d => d.id === 'Shell' ? 18 : 12)
    .attr('fill', d => d.id === 'Shell' ? '#35495e' : (d.status === 'online' ? '#42b883' : '#ff5f5f'))
    .attr('stroke', d => d.id === 'Shell' ? '#42b883' : 'transparent')
    .attr('stroke-width', 2)
    .style('filter', d => d.status === 'online' ? 'url(#glow)' : 'none')
    .attr('class', 'node-circle')

  // Labels
  nodeGroup.append('text')
    .text(d => d.id)
    .attr('dx', d => d.id === 'Shell' ? 25 : 18)
    .attr('dy', 5)
    .style('fill', '#fff')
    .style('font-size', d => d.id === 'Shell' ? '14px' : '12px')
    .style('font-weight', '500')
    .style('pointer-events', 'none')
    .style('text-shadow', '0 2px 4px rgba(0,0,0,0.5)')

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

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
  }
}

onMounted(() => {
  initChart()
})

watch(() => props.data, () => {
  initChart()
}, { deep: true })
</script>

<style scoped>
.mfe-stats-chart {
  position: relative;
  width: 100%;
  height: 400px;
  background: #1a1a1a;
  background-image: 
    radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
  background-size: 24px 24px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(66, 184, 131, 0.2);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

.chart-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  pointer-events: none;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgba(0, 0, 0, 0.5);
  color: #42b883;
  border: 1px solid rgba(66, 184, 131, 0.3);
}

.status-badge.is-online::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #42b883;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 8px #42b883;
}

.link-path {
  transition: stroke 0.3s;
}

.node-circle {
  transition: transform 0.2s;
  cursor: grab;
}

.node-circle:active {
  cursor: grabbing;
}
</style>
