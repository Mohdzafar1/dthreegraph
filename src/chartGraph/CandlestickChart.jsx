import * as d3 from "d3";
import { useRef, useEffect } from "react";

export default function CandlestickChart({
  data,
  width = window.innerWidth - 40,
  height = window.innerHeight - 40,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  minCandleWidth = 5, // Define the minimum candle width
  minCandleSpacing = 20, // Define the minimum space between candles
}) {
  const gx = useRef();
  const gy = useRef();
  const svgRef = useRef();
  const clipPathId = "clip-path"; // Unique ID for the clip path

  // Calculate the total width required for all candles
  const totalCandleWidth = minCandleWidth + minCandleSpacing;
  const totalWidth = totalCandleWidth * data.length;

  const x = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([marginLeft, totalWidth + marginLeft - minCandleSpacing]);

  const y = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)])
    .nice()
    .range([height - marginBottom, marginTop]);

  const xAxis = d3
    .axisBottom(x)
    .tickSizeOuter(0)
    .tickFormat((i) => (data[i] ? data[i].date : ""));
  const yAxis = d3.axisLeft(y).tickSizeOuter(0);

  useEffect(() => {
    d3.select(gx.current).call(xAxis);
  }, [gx, xAxis]);

  useEffect(() => {
    d3.select(gy.current).call(yAxis);
  }, [gy, yAxis]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const zoomed = (event) => {
      const newX = event.transform.rescaleX(x);
      const newY = event.transform.rescaleY(y);

      d3.select(gx.current).call(
        d3.axisBottom(newX).tickFormat((i) => (data[i] ? data[i].date : ""))
      );
      d3.select(gy.current).call(d3.axisLeft(newY));

      const candleWidth = Math.max((newX(1) - newX(0)) * 0.8, minCandleWidth);

      svg
        .selectAll(".candle")
        .attr("x", (d, i) => newX(i) - candleWidth / 2) // Adjust x position based on candle width
        .attr("width", candleWidth)
        .attr("y", (d, i) => newY(Math.max(data[i].open, data[i].close)))
        .attr("height", (d, i) =>
          Math.abs(newY(data[i].open) - newY(data[i].close))
        );

      svg
        .selectAll(".wick")
        .attr("x1", (d, i) => newX(i))
        .attr("x2", (d, i) => newX(i))
        .attr("y1", (d, i) => newY(data[i].high))
        .attr("y2", (d, i) => newY(data[i].low));
    };

    svg.call(
      d3.zoom()
        .scaleExtent([0.5, 5]) // Limit zoom scale from 0.5x to 5x
        .on("zoom", zoomed)
    );
  }, [gx, gy, x, y, data, minCandleWidth, minCandleSpacing]);

  const candleWidth = Math.max((x(1) - x(0)) * 0.8, minCandleWidth);

  return (
    <svg ref={svgRef} width={width} height={height}>
      <defs>
        <clipPath id={clipPathId}>
          <rect
            x={marginLeft}
            y={marginTop}
            width={width - marginLeft - marginRight}
            height={height - marginTop - marginBottom}
          />
        </clipPath>
      </defs>
      <g ref={gx} transform={`translate(0,${height - marginBottom})`} />
      <g ref={gy} transform={`translate(${marginLeft},0)`} />
      <g clipPath={`url(#${clipPathId})`}>
        {data.map((d, i) => (
          <g key={i} className="candlestick">
            <line
              className="wick"
              stroke="black"
              x1={x(i)}
              x2={x(i)}
              y1={y(d.high)}
              y2={y(d.low)}
            />
            <rect
              className="candle"
              fill={d.open > d.close ? "red" : "green"}
              x={x(i) - candleWidth / 2} // Adjust x position based on candle width
              width={candleWidth}
              y={y(Math.max(d.open, d.close))}
              height={Math.abs(y(d.open) - y(d.close))}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
