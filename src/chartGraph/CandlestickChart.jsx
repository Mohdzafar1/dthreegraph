import * as d3 from "d3";
import { useRef, useEffect, useState } from "react";

export default function CandlestickChart({
  data,
  width = window.innerWidth - 40,
  height = window.innerHeight - 40,
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
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [drawingTrendLine, setDrawingTrendLine] = useState(false);
  const [allowTextInput, setAllowTextInput] = useState(false);

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
    .range([dimensions.width * 0.05, dimensions.width * 0.95]);

  const y = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)])
    .nice()
    .range([dimensions.height * 0.95, dimensions.height * 0.05]);

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
          x: event.transform.applyX(point.originalX),
          y: event.transform.applyY(point.originalY),
        }))
      );

      // Update trend line points position on zoom
      if (startPoint) {
        setStartPoint((prevPoint) => ({
          ...prevPoint,
          x: newX(prevPoint.index),
          y: newY(data[prevPoint.index].close) - 10,
        }));
      }
      if (endPoint) {
        setEndPoint((prevPoint) => ({
          ...prevPoint,
          x: newX(prevPoint.index),
          y: newY(data[prevPoint.index].close) - 10,
        }));
      }

      if (inputVisible && currentIndex !== null) {
        const clickedPoint = clickedPoints.find(
          (point) => point.index === currentIndex
        );
        if (clickedPoint) {
          const newClickedX = event.transform.applyX(clickedPoint.originalX);
          const newClickedY = event.transform.applyY(clickedPoint.originalY);

          d3.select(inputRef.current)
            .style("left", `${newClickedX + 10}px`)
            .style("top", `${newClickedY + 50}px`);
        }
      }
    };

    svg.call(d3.zoom().scaleExtent([0.5, 5]).on("zoom", zoomed));

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [
    gx,
    gy,
    x,
    y,
    data,
    minCandleWidth,
    dimensions.height,
    clickedPoints,
    inputVisible,
    currentIndex,
    startPoint,
    endPoint,
  ]);

  const handleMouseOver = (event, d) => {
    if (!d) return; // Check if d is undefined
    const rect = event.target.getBoundingClientRect();
    const tooltipX = rect.left + window.pageXOffset;
    const tooltipY = y(Math.max(d.open, d.close)) + 10;

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

  // const handleChartClick = (event, d, i) => {
  //   if (!d) return; // Check if d is undefined
  //   if (!drawingTrendLine) {
  //     if (allowTextInput) {
  //       setInputVisible(true);
  //       setCurrentIndex(i);
  //       setInputValue("");
  //     }
  //     return; // Ignore clicks if not in drawing mode
  //   }

  //   const svgRect = svgRef.current.getBoundingClientRect();
  //   const clickX = event.clientX - svgRect.left; // Relative to SVG
  //   const clickIndex = Math.round(x.invert(clickX));
  //   const clickY = event.clientY - svgRect.top; // Relative to SVG

  //   if (!startPoint) {
  //     setStartPoint({
  //       x: x(clickIndex),
  //       y: y(data[clickIndex].close) - 10,
  //       originalX: x(clickIndex),
  //       originalY: y(data[clickIndex].close) - 10,
  //       index: clickIndex,
  //     });
  //   } else if (!endPoint) {
  //     setEndPoint({
  //       x: x(clickIndex),
  //       y: y(data[clickIndex].close) - 10,
  //       originalX: x(clickIndex),
  //       originalY: y(data[clickIndex].close) - 10,
  //       index: clickIndex,
  //     });
  //     setDrawingTrendLine(false); // Exit drawing mode after setting end point
  //   } else {
  //     setStartPoint(null);
  //     setEndPoint(null);
  //   }
  // };

  const handleChartClick = (event, d, i) => {
    if (!d) return; // Check if d is undefined
    if (!drawingTrendLine) {
      if (allowTextInput) {
        setInputVisible(true);
        setCurrentIndex(i);
        setInputValue("");
      }
      return; // Ignore clicks if not in drawing mode
    }
  
    const svgRect = svgRef.current.getBoundingClientRect();
    const clickX = event.clientX - svgRect.left; // Relative to SVG
    const clickIndex = Math.round(x.invert(clickX));
    const clickY = event.clientY - svgRect.top; // Relative to SVG
  
    if (!startPoint) {
      setStartPoint({
        x: x(clickIndex),
        y: y(data[clickIndex].close) - 10,
        originalX: x(clickIndex),
        originalY: y(data[clickIndex].close) - 10,
        index: clickIndex,
      });
    } else if (!endPoint) {
      setEndPoint({
        x: x(clickIndex),
        y: y(data[clickIndex].close) - 10,
        originalX: x(clickIndex),
        originalY: y(data[clickIndex].close) - 10,
        index: clickIndex,
      });
    } else {
      // Change the endPoint if both startPoint and endPoint are set
      setEndPoint({
        x: x(clickIndex),
        y: y(data[clickIndex].close) - 10,
        originalX: x(clickIndex),
        originalY: y(data[clickIndex].close) - 10,
        index: clickIndex,
      });
    }
  };
  


  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputBlur = () => {
    if (currentIndex !== null) {
      const newPoint = {
        x: x(currentIndex),
        y: y(data[currentIndex].close) - 10,
        originalX: x(currentIndex),
        originalY: y(data[currentIndex].close) - 10,
        index: currentIndex,
        text: inputValue,
      };

      setClickedPoints((prevPoints) => [...prevPoints, newPoint]);
    }

    setInputVisible(false);
    setAllowTextInput(false); // Reset text input mode
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      handleInputBlur();
    }
  };

  const toggleTrendLineDrawing = () => {
    setDrawingTrendLine((prev) => !prev);

    // Reset points if trend line drawing is turned off
    if (drawingTrendLine) {
      setStartPoint(null);
      setEndPoint(null);
    }
  };

  const toggleTextInputMode = () => {
    setAllowTextInput((prev) => !prev);
    setInputVisible(false);
    setInputValue("");
    setCurrentIndex(null);
  };

  return (
    <>
      <button
        onClick={toggleTrendLineDrawing}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 10,
          padding: "10px",
          backgroundColor: drawingTrendLine ? "red" : "green",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",

        }}
      >
        {drawingTrendLine ? "Cancel Trend Line" : "Draw Trend Line"}
      </button>
      <button
        onClick={toggleTextInputMode}
        style={{
          position: "absolute",
          top: "10px",
          left: "140px",
          zIndex: 10,
          padding: "10px",
          backgroundColor: allowTextInput ? "blue" : "orange",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginLeft:"15px"
        }}
      >
        {allowTextInput ? "Cancel Text Input" : "Add Text"}
      </button>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        <defs>
          <clipPath id={clipPathId}>
            <rect
              x={dimensions.width * 0.05}
              y={dimensions.height * 0.05}
              width={dimensions.width * 0.9}
              height={dimensions.height * 0.9}
            />
          </clipPath>
        </defs>
        <g ref={gx} transform={`translate(0,${dimensions.height * 0.95})`} />
        <g ref={gy} transform={`translate(${dimensions.width * 0.05},0)`} />
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
          {startPoint && (
            <circle
              cx={startPoint.x}
              cy={startPoint.y}
              r={5}
              fill="blue"
              onClick={() => setStartPoint(null)}
            />
          )}
          {endPoint && (
            <circle
              cx={endPoint.x}
              cy={endPoint.y}
              r={5}
              fill="blue"
              onClick={() => setEndPoint(null)}
            />
          )}
          {startPoint && endPoint && (
            <line
              x1={startPoint.x}
              y1={startPoint.y}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="blue"
              strokeWidth={2}
            />
          )}
          {clickedPoints.map((point, i) => (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r={5} fill="yellow" />
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
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "5px",
            borderRadius: "5px",
            pointerEvents: "none",
          }}
        >
          <p>Date: {tooltip.date}</p>
          <p>Open: {tooltip.open}</p>
          <p>Close: {tooltip.close}</p>
          <p>High: {tooltip.high}</p>
          <p>Low: {tooltip.low}</p>
        </div>
      )}
      {inputVisible && currentIndex !== null && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          style={{
            position: "absolute",
            left: `${x(currentIndex) + 10}px`,
            top: `${y(data[currentIndex].close) - 50}px`,
            zIndex: 10,
            color: "white",
            borderColor: "black",
            backgroundColor: "#3b0f0f",
            padding: "7px",
            borderRadius: "10px",
          }}
        />
      )}
    </>
  );
}
