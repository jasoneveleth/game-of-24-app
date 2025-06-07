import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function Tree({ tree }) {
  const svgRef = useRef()

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
    linkColor: '#555',
    nodeRadius: 12,
    linkWidth: 2,
    showText: true,
    nodeStroke: '#000',
    strokeWidth: 2,
    textColor: '#000',
    nodeFill: '#fff',
  }

  useEffect(() => {
    if (!treeData) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const width = 250
    const height = 180
    const margin = { top: 15, right: 0, bottom: 15, left: 0 }

    svg.attr('width', width).attr('height', height)

    // Create tree layout
    const treeLayout = d3
      .tree()
      .size([
        width - margin.left - margin.right,
        height - margin.top - margin.bottom,
      ])

    const root = d3.hierarchy(treeData)
    const treeNodes = treeLayout(root)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

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
      .attr('stroke', style.nodeStroke)
      .attr('stroke-width', style.strokeWidth || 0)
      .attr('fill', (d) => {
        const depth = d.depth
        return style.nodeFill || '#fff'
      })

    // Add text if enabled
    if (style.showText) {
      node
        .append('text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'system-ui')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', style.textColor || '#000')
        .text((d) => d.data.name)
    }
  }, [tree, treeData])

  return <svg ref={svgRef}></svg>
}
