import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data }) => {
  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const linePathRef = useRef(null); // Ref to store line path element

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
      .nice()
      .range([height - marginBottom, marginTop]);

    // Line generator
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.close));

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])  // Limits zoom scale from 1x to 8x
      .extent([[0, 0], [width, height]])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    // Select or create SVG element
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .call(zoom);

    // X axis
    const xAxis = d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0);
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(xAxis);

    // Y axis
    const yAxis = d3.axisLeft(y).ticks(height / 40);
    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(yAxis)
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
    const linePath = svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 4.5)
      .attr("d", line);

    // Store line path reference
    linePathRef.current = linePath;

    function zoomed(event) {
      const { transform } = event;
      svg.select(".x-axis").call(xAxis.scale(transform.rescaleX(x)));
      svg.select(".y-axis").call(yAxis.scale(transform.rescaleY(y)));
      linePathRef.current.attr("d", line); // Update the line path based on new scale
    }

    // Save zoom behavior reference
    zoomRef.current = zoom;

    // Zoom reset on double click
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    // Cleanup
    return () => {
      svg.on(".zoom", null);
    };

  }, [data]);

  return (
    <div>
      <h1>Line Chart</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default LineChart;
