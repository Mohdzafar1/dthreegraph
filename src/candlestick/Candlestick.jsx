import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const CandlestickChart = ({
  data,
  width = window.innerWidth - 40,
  height = window.innerHeight - 40,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  minCandleWidth = 5,
  minCandleSpacing = 20,
}) => {
  const gx = useRef();
  const gy = useRef();
  const candlesRef = useRef();

  // Calculate total width required for all candles
  const totalCandleWidth = minCandleWidth + minCandleSpacing;
  const totalWidth = totalCandleWidth * data.length;

  // Define x and y scales
  const x = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([0, totalWidth]);
  const y = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Define x and y axes
  const xAxis = d3
    .axisBottom(x)
    .tickSizeOuter(0)
    .tickFormat((i) => (data[i] ? data[i].date : ""));
  const yAxis = d3.axisLeft(y).tickSizeOuter(0);

  // Effect to update x-axis on x-axis changes
  useEffect(() => {
    d3.select(gx.current).call(xAxis);
  }, [gx, xAxis, data]);

  // Effect to update y-axis on y-axis changes
  useEffect(() => {
    d3.select(gy.current).call(yAxis);
  }, [gy, yAxis, data]);

  // Effect to handle zooming behavior
  useEffect(() => {
    const svg = d3.select(candlesRef.current);

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
        .attr("x", (d, i) => newX(i))
        .attr("width", candleWidth)
        .attr("y", (d, i) => newY(Math.max(data[i].open, data[i].close)))
        .attr("height", (d, i) =>
          Math.abs(newY(data[i].open) - newY(data[i].close))
        );

      svg
        .selectAll(".wick")
        .attr("x1", (d, i) => newX(i) + candleWidth / 2)
        .attr("x2", (d, i) => newX(i) + candleWidth / 2)
        .attr("y1", (d, i) => newY(data[i].high))
        .attr("y2", (d, i) => newY(data[i].low));
    };

    svg.call(d3.zoom().scaleExtent([0.5, 3]).on("zoom", zoomed));
  }, [gx, gy, x, y, data, minCandleWidth]);

  // Calculate initial candle width
  const candleWidth = Math.max((x(1) - x(0)) * 0.8, minCandleWidth);

  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height}>
        <g ref={gx} transform={`translate(30, ${height - marginBottom})`} />
        <g ref={gy} transform={`translate(${marginLeft}, 0)`} />
      </svg>
      <div
        style={{
          overflowX: "auto",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE 10+
        }}
      >
        <svg ref={candlesRef} width={totalWidth} height={height}>
          {data.map((d, i) => (
            <g key={i} className="candlestick">
              <line
                className="wick"
                stroke="black"
                x1={x(i) + candleWidth / 2}
                x2={x(i) + candleWidth / 2}
                y1={y(d.high)}
                y2={y(d.low)}
              />
              <rect
                className="candle"
                fill={d.open > d.close ? "red" : "green"}
                x={x(i)}
                width={candleWidth}
                y={y(Math.max(d.open, d.close))}
                height={Math.abs(y(d.open) - y(d.close))}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default CandlestickChart;
