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
  const inputRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [clickedPoints, setClickedPoints] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentIndex, setCurrentIndex] = useState(null);

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

      // Update clicked points position on zoom
      setClickedPoints((prevPoints) =>
        prevPoints.map((point) => ({
          ...point,
          x: newX(point.index),
          y: newY(data[point.index].close) - 10,
        }))
      );

      if (inputVisible && currentIndex !== null) {
        const newClickedX = newX(currentIndex);
        const newClickedY = newY(data[currentIndex].close) - 10;

        d3.select(inputRef.current)
          .style("left", `${newClickedX + 10}px`)
          .style("top", `${newClickedY + 50}px`);
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
  }, [gx, gy, x, y, data, minCandleWidth, dimensions.height, clickedPoints, inputVisible, currentIndex]);

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
    setInputVisible(true); // Ensure inputVisible is set to true after setting clickedPoint
    setCurrentIndex(clickIndex);
    setInputValue("");

    const clickedX = x(clickIndex);
    const clickedY = y(data[clickIndex].close) - 10;

    d3.select(inputRef.current)
      .style("left", `${clickedX + 10}px`)
      .style("top", `${clickedY + 50}px`);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputBlur = () => {
    setInputVisible(false);

    if (currentIndex !== null) {
      const newPoint = {
        x: x(currentIndex),
        y: y(data[currentIndex].close) - 10,
        index: currentIndex,
        text: inputValue,
      };

      setClickedPoints((prevPoints) => [...prevPoints, newPoint]);
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
            </g>
          ))}
          {clickedPoints.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r={5}
                fill="yellow"
              />
              <text
                x={point.x + 10}
                y={point.y - 20}
                fontSize="14px"
                fontWeight="bold"
                textAnchor="start"
              >
                {point.text}
              </text>
            </g>
          ))}
        </g>
      </svg>
      {inputVisible && currentIndex !== null && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          style={{
            position: "absolute",
            left: `${x(currentIndex) + 10}px`,
            top: `${y(data[currentIndex].close) - 50}px`,
            zIndex: 10,
            color: "white",
            borderColor: "black",
            backgroundColor: "#db1616",
          }}
        />
      )}
    </>
  );
}
