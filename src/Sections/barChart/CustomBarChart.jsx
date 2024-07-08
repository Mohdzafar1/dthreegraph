import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "d3";

const CustomBarChart = () => {
  const myEle = useRef(null);
  const [barData, setBarData] = useState([
    { name: "A", age: 10 },
    { name: "B", age: 20 },
    { name: "C", age: 30 },
    { name: "D", age: 40 },
    { name: "E", age: 50 },
    { name: "F", age: 60 },
    { name: "G", age: 100 },
    { name: "H", age: 20 },
    { name: "I", age: 30 },
    { name: "J", age: 40 },
    { name: "K", age: 50 },
    { name: "L", age: 60 }
  ]);

  // Calculate the max age
  const maxAge = d3.max(barData, (d) => d.age);

  const totalHeight = maxAge * 10 + 100; // Add some padding to the total height
  const rectWidth = 50;
  
  // Margin
  const margin = {
    top: 10,
    right: 200,
    bottom: 50,
    left: 130
  };

  const yAxisLabelSpacing=20;


  useEffect(() => {
    const svg = d3.select(myEle.current);

    svg.selectAll('*').remove(); // Clear the previous content

    const allRectData = svg.selectAll('rect')
      .data(barData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * rectWidth + margin.left)
      .attr("y", (d) => totalHeight - d.age * 10 - margin.bottom)
      .attr("height", (d) => d.age * 10)
      .attr("width", rectWidth - 10)
      .attr('stroke-width', 2)
      .attr('stroke', "#38bcc2")
      .attr('fill', '#97e3d5');
     
    // Draw x-axis line
    svg.append('line')
      .attr('x1', margin.left)
      .attr('y1', totalHeight - margin.bottom)
      .attr("x2", margin.left + rectWidth * barData.length ) //right x+
      .attr('y2', totalHeight - margin.bottom)
      .attr('stroke-width', 2)
      .attr('stroke', '#000'); // Set the stroke color to make the line visible

    // Draw y-axis line
    svg.append('line')
      .attr('x1', margin.left)
      .attr('y1', margin.top)
      .attr('x2', margin.left)
      .attr('y2', totalHeight - margin.bottom)
      .attr('stroke-width', 2)
      .attr('stroke', '#000'); // Set the stroke color to make the line visible

    // Create x-axis labels (name)
    svg.selectAll('.name-label')
      .data(barData)
      .enter()
      .append('text')
      .text((d) => d.name)
      .attr('class', 'name-label')
      .attr('x', (d, i) => i * rectWidth + margin.left + rectWidth / 2 - 5)
      .attr('y', totalHeight - margin.bottom + 20)
      .attr('transform', (d, i) => `rotate(45 ${i * rectWidth + margin.left + rectWidth / 2 - 5} ${totalHeight - margin.bottom + 20})`)
      .attr('fill', 'gray')
      .style('text-anchor', 'middle');

    // Create y-axis labels (age)
    svg.selectAll('.age-label')
      .data(barData)
      .enter()
      .append('text')
      .text((d) => d.age)
      .attr('class', 'age-label')
      .attr('x', margin.left - 10)
      .attr('y', (d) => totalHeight - d.age * 10 - margin.bottom + 10)
      .attr('fill', '#1f77b4')
      .attr('text-anchor', 'end')
      .attr('font-weight', 'bold');

//  // Create y-axis labels (yAxisLabelSpacing)
//  const yAxisLabelData = d3.range(0, maxAge + 1, yAxisLabelSpacing); // Adjusted to include maxAge
//  svg.selectAll('.y-axis-label')
//    .data(yAxisLabelData)
//    .enter()
//    .append('text')
//    .text((d) => d)
//    .attr('class', 'y-axis-label')
//    .attr('x', margin.left - 10)
//    .attr('y', (d) => totalHeight - d * 10 - margin.bottom + 5) // Adjusted to position labels correctly
//    .attr('fill', 'gray')
//    .attr('text-anchor', 'end')
//    .attr('alignment-baseline', 'middle');
                       


  }, [barData]);

  return (
    <div>
      <svg
        ref={myEle}
        width={rectWidth * barData.length + margin.left + margin.right}
        height={totalHeight}
        style={{ border: "1px solid black" }}
      >
      </svg>
    </div>
  );
}

export default CustomBarChart;
