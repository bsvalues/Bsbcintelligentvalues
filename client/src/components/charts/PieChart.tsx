import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  animationDuration?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  width = 300,
  height = 300,
  innerRadius = 0,
  outerRadius = 130,
  animationDuration = 800
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create the SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Set up the pie layout
    const pie = d3.pie<any>()
      .value((d) => d.value)
      .sort(null);

    // Generate the arcs
    const arc = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    // Compute the labels position
    const labelArc = d3.arc<any>()
      .innerRadius(outerRadius * 0.8)
      .outerRadius(outerRadius * 0.8);

    // Create the pie chart
    const path = svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('class', 'arc')
      .attr('fill', (d) => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Add animation
    path
      .transition()
      .duration(animationDuration)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });

    // Add hover effects
    path
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke-width', 2);
      });

    // Add value labels for slices with significant value
    const threshold = d3.sum(data, d => d.value) * 0.05; // 5% threshold

    svg
      .selectAll('.value-label')
      .data(pie(data.filter(d => d.value > threshold)))
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => {
        if (d.data.value < 10) {
          return `${d.data.value.toFixed(1)}%`;
        }
        return `${Math.round(d.data.value)}%`;
      });

  }, [data, width, height, innerRadius, outerRadius, animationDuration]);

  return (
    <div className="flex justify-center items-center h-full w-full">
      <svg ref={svgRef} />
    </div>
  );
};