import * as d3 from "d3";
import { useRef, useEffect, useState } from "react";

export default function CandlestickChart({
  data,
  width = window.innerWidth - 40,
  height = window.innerHeight - 40,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  minCandleWidth = 5,
  minCandleSpacing = 20,
}) {
  const gx = useRef();
  const gy = useRef();
  const svgRef = useRef();
  const clipPathId = "clip-path";
  const [tooltip, setTooltip] = useState(null);
  const [clickedPoint, setClickedPoint] = useState(null);

  const handleResize = () => {
    const newWidth = window.innerWidth - 40;
    const newHeight = window.innerHeight - 40;
    setDimensions({ width: newWidth, height: newHeight });
  };

  const [dimensions, setDimensions] = useState({
    width: width,
    height: height,
  });

  const x = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([marginLeft, dimensions.width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)])
    .nice()
    .range([dimensions.height - marginBottom, marginTop]);

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
        .attr("x", (d, i) => newX(i) - candleWidth / 2)
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

      // Update clicked point position on zoom
      if (clickedPoint) {
        setClickedPoint({
          ...clickedPoint,
          x: x(clickedPoint.index) + marginLeft,
          y: y(data[clickedPoint.index].close) + marginTop,
        });
      }
    };

    svg.call(
      d3.zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", zoomed)
    );

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [gx, gy, x, y, data, minCandleWidth, dimensions.height, clickedPoint]);

  const handleMouseOver = (event, d) => {
    if (!d) return; // Check if d is undefined
    const rect = event.target.getBoundingClientRect();
    const tooltipX = rect.left + window.pageXOffset;
    const tooltipY = y(Math.max(d.open, d.close)) + marginTop;

    setTooltip({
      date: d.date,
      open: d.open,
      close: d.close,
      high: d.high,
      low: d.low,
      x: tooltipX,
      y: tooltipY,
      width: rect.width,
      height: Math.abs(y(d.open) - y(d.close)),
    });
  };

  const handleMouseOut = () => {
    setTooltip(null);
  };

  const handleChartClick = (event, d, i) => {
    if (!d) return; // Check if d is undefined
    const svgRect = svgRef.current.getBoundingClientRect();
    const clickX = event.clientX - svgRect.left; // Relative to SVG
    const clickIndex = Math.round(x.invert(clickX));
    const clickY = event.clientY - svgRect.top; // Relative to SVG
    handleText(clickIndex, clickY);
  };

  const handleText = (clickIndex, clickY) => {
    const updatedClickedPoint = {
      x: x(clickIndex) + marginLeft,
      y: clickY + marginTop,
      index: clickIndex,
      text: "", // Initially empty
    };

    // Set the clicked point with initial text
    setClickedPoint(updatedClickedPoint);

    // Prompt for text input
    const input = prompt("Enter text:");
    if (input !== null) {
      setClickedPoint({
        ...updatedClickedPoint,
        text: input,
      });
    }
  };

  return (
    <>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        <defs>
          <clipPath id={clipPathId}>
            <rect
              x={marginLeft}
              y={marginTop}
              width={dimensions.width - marginLeft - marginRight}
              height={dimensions.height - marginTop - marginBottom}
            />
          </clipPath>
        </defs>
        <g ref={gx} transform={`translate(0,${dimensions.height - marginBottom})`} />
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
                x={x(i) - Math.max((x(1) - x(0)) * 0.8, minCandleWidth) / 2}
                width={Math.max((x(1) - x(0)) * 0.8, minCandleWidth)}
                y={y(Math.max(d.open, d.close))}
                height={Math.abs(y(d.open) - y(d.close))}
                onMouseOver={(event) => handleMouseOver(event, d)}
                onMouseOut={handleMouseOut}
                onClick={(event) => handleChartClick(event, d, i)}
              />
              {clickedPoint && clickedPoint.index === i && (
                <>
                  <circle
                    cx={x(i)} // Adjust to be centered on the candlestick
                    cy={y(Math.max(d.open, d.close))} // Adjust vertical position to be centered
                    r={5}
                    fill="yellow"
                  />
                  <text
                    x={x(i) + 10} // Adjust horizontal position as needed
                    y={y(Math.max(d.open, d.close)) - 20} // Adjust vertical position to place it higher above the circle
                    fontSize="14px"
                    fontWeight="bold"
                    textAnchor="start"
                  >
                    {clickedPoint.text}
                  </text>
                </>
              )}
            </g>
          ))}
        </g>
      </svg>
    </>
  );
}
