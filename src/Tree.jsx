import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

export default function Tree({ tree }) {
  const svgRef = useRef()
  const [isDark, setIsDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  // Listen for color scheme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      setIsDark(e.matches)
    }

    mediaQuery.addListener(handleChange)

    return () => mediaQuery.removeListener(handleChange)
  }, [])

  // Convert Tree {val, left, right} format to D3 format {name, children}
  const convertTreeToD3Format = (tree) => {
    if (!tree) return null
    const node = { name: tree.val.toString() }
    const children = []
    if (tree.left) children.push(convertTreeToD3Format(tree.left))
    if (tree.right) children.push(convertTreeToD3Format(tree.right))
    if (children.length > 0) {
      node.children = children
    }
    return node
  }

  // Example tree if none provided
  const defaultTree = {
    val: '+',
    left: { val: 1392832 },
    right: {
      val: '*',
      left: { val: 22891 },
      right: { val: 903823 },
    },
  }

  const treeData = convertTreeToD3Format(tree || defaultTree)

  const style = {
    nodeRadius: 12,
    linkWidth: 2,
    showText: true,
    strokeWidth: 2,
    linkColor: isDark ? '#888' : '#555',
    outlineColor: isDark ? '#fff' : '#000',
    fillColor: isDark ? '#242424' : '#fff',
  }

  useEffect(() => {
    if (!treeData) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 250
    const height = 180
    const margin = { top: 15 }

    svg.attr('width', width).attr('height', height)

    // Create tree layout
    const treeLayout = d3
      .tree()
      .nodeSize([20, 50])
      .separation((a, b) => 3)

    const root = d3.hierarchy(treeData)
    const treeNodes = treeLayout(root)

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${margin.top})`)

    // Add links
    g.selectAll('.link')
      .data(treeNodes.links())
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .attr('stroke', style.linkColor)
      .attr('stroke-width', style.linkWidth)

    // Add nodes
    const node = g
      .selectAll('.node')
      .data(treeNodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)

    // Add circles
    node
      .append('circle')
      .attr('r', style.nodeRadius)
      .attr('stroke', style.outlineColor)
      .attr('stroke-width', style.strokeWidth || 0)
      .attr('fill', style.fillColor)

    // Add text if enabled
    if (style.showText) {
      node
        .append('text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'system-ui')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', style.outlineColor)
        .text((d) => d.data.name)
    }
  }, [tree, treeData, isDark])

  return <svg ref={svgRef}></svg>
}
