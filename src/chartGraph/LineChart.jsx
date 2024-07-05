import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';


const LineChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    // Chart dimensions and margins
    const width = 928;
    const height = 500;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    // X scale
    const x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date))
      .range([marginLeft, width - marginRight]);

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.close)])
      .range([height - marginBottom, marginTop]);

    // Line generator
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.close));

    // Select or create SVG element
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    // X axis
    svg.append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    // Y axis
    svg.append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1))
      .append("text")
      .attr("x", -marginLeft)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text("↑ Daily close ($)");

    // Line path
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

  }, [data]);

  return (
    <div>
      <h1>Line Chart</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default LineChart;
