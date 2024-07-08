import React, { useEffect, useRef, useState } from 'react';
import { select, scaleBand, scaleLinear, scaleLog, axisBottom, axisLeft, zoom, format, timeFormat } from 'd3';

const CandlestickChart = ({ data }) => {
  const svgRef = useRef(null);
  const height = 550; // Define height here
  const margin = { top: 50, right: 30, bottom: 30, left: 130 }; // Define margin here

  // State to track the current scale type
  const [scaleType, setScaleType] = useState('linear'); // 'linear' or 'logarithmic'

  useEffect(() => {
    if (!data || data.length === 0) {
      // If data is empty or undefined, return early
      return;
    }

    // Dimensions
    const width = 1300;

    // Convert date strings to Date objects and parse numerical data
    data.forEach(d => {
      d.date = new Date(d.date);
      d.open = +d.open;
      d.close = +d.close;
      d.high = +d.high;
      d.low = +d.low;
    });

    // Scales
    const x = scaleBand()
      .domain(data.map(d => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    let y;
    if (scaleType === 'linear') {
      y = scaleLinear()
        .domain([Math.min(...data.map(d => d.low)), Math.max(...data.map(d => d.high))])
        .nice()
        .range([height - margin.bottom, margin.top]);
    } else if (scaleType === 'logarithmic') {
      y = scaleLog()
        .domain([Math.min(...data.map(d => d.low)), Math.max(...data.map(d => d.high))])
        .nice()
        .range([height - margin.bottom, margin.top]);
    }

    // SVG container
    const svg = select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('font-size', '12px'); // Default font size

    svg.selectAll("*").remove(); // Clear previous elements

    // Axes
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(axisBottom(x).tickFormat(timeFormat('%Y-%m-%d')))
      .selectAll('.domain').remove();

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(axisLeft(y).tickFormat(format('$~f')))
      .call(g => g.selectAll('.tick line').clone()
        .attr('stroke-opacity', 0.2)
        .attr('x2', width - margin.left - margin.right))
      .selectAll('.domain').remove();

    // Candlesticks
    const g = svg.append('g')
      .attr('class', 'candlesticks-group')
      .attr('stroke-linecap', 'round')
      .attr('stroke', 'black')
      .selectAll('g')
      .data(data)
      .join('g')
      .attr('transform', d => `translate(${x(d.date)}, 0)`);

    g.append('line')
      .attr('y1', d => y(d.low))
      .attr('y2', d => y(d.high))
      .attr('stroke', 'black');

    g.append('line')
      .attr('y1', d => y(d.open))
      .attr('y2', d => y(d.close))
      .attr('stroke-width', x.bandwidth())
      .attr('stroke', d => d.open > d.close ? 'red' : 'green')
      .style('stroke-width', '13px') // Adjust candlestick thickness
      .style('font-size', '8px'); // Adjust font size

    // Tooltip
    g.append('title')
      .text(d => `${d.date.toLocaleDateString()}
Open: ${d.open.toFixed(2)}
Close: ${d.close.toFixed(2)}
Low: ${d.low.toFixed(2)}
High: ${d.high.toFixed(2)}`);

    // Zoom behavior
    const zoomBehavior = zoom()
      .scaleExtent([1, 4]) // Limit zoom scale from 1x to 4x
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const transform = event.transform;
        // Update x scale with new transform
        const newX = transform.rescaleX(x);
        svg.select('.x-axis').call(axisBottom(newX).tickFormat(timeFormat('%Y-%m-%d')));
        // Update candlestick positions with new x scale
        g.attr('transform', d => `translate(${newX(d.date)}, 0)`);
      });

    svg.call(zoomBehavior);

    return () => {
      svg.on('.zoom', null); // Clean up zoom behavior on unmount or data change
    };

  }, [data, scaleType]);

  return (
    <div>
      <svg ref={svgRef}>
        <g className="x-axis" transform={`translate(0, ${height - margin.bottom})`}></g>
        <g className="y-axis" transform={`translate(${margin.left}, 0)`}></g>
      </svg>
      <button onClick={() => setScaleType(scaleType === 'linear' ? 'logarithmic' : 'linear')}>
        Toggle Scale Type
      </button>
    </div>
  );
};

export default CandlestickChart;
