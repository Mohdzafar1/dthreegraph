import * as d3 from "d3";
import { useRef, useEffect, useState } from "react";

function formatDateString(seconds) {
  const date = new Date(seconds * 1000); // Convert seconds to milliseconds
  const options = { day: "numeric", month: "long" };
  return date.toLocaleDateString("en-US", options); // Format as "19 July"
}

export default function CandlestickChart2({
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
  const clipPathId = "clip-path"; // Unique ID for the clip path
  const [tooltip, setTooltip] = useState(null);
  const [markers, setMarkers] = useState([]); // Array of marker objects
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(null); // Index of active marker

  const totalCandleWidth = minCandleWidth + minCandleSpacing;
  const totalWidth = totalCandleWidth * data.length;

  const x = d3
    .scaleTime()
    .domain([new Date(data[0].date), new Date(data[data.length - 1].date)])
    .range([marginLeft, totalWidth + marginLeft - minCandleSpacing]);

  const y = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)])
    .nice()
    .range([height - marginBottom, marginTop]);

  const xAxis = d3
    .axisBottom(x)
    .tickSizeOuter(0)
    .tickFormat((date, i) => {
      if (i >= 0 && i < data.length) {
        return formatDateString(data[i].date);
      }
      return "";
    });

  const yAxis = d3.axisLeft(y).tickSizeOuter(0);

  useEffect(() => {
    d3.select(gx.current).call(xAxis);
  }, [gx, xAxis, data]);

  useEffect(() => {
    d3.select(gy.current).call(yAxis);
  }, [gy, yAxis]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const zoomed = (event) => {
      const newX = event.transform.rescaleX(x);
      const newY = event.transform.rescaleY(y);

      d3.select(gx.current).call(
        d3.axisBottom(newX).tickFormat((date, i) => {
          if (i >= 0 && i < data.length) {
            return formatDateString(data[i].date);
          }
          return "";
        })
      );

      d3.select(gy.current).call(d3.axisLeft(newY));

      const candleWidth =
        Math.max((newX(1) - newX(0)) * 0.8, minCandleWidth) * 2.2;

      svg
        .selectAll(".candle")
        .attr("x", (d, i) => newX(new Date(data[i].date)) - candleWidth / 2)
        .attr("width", candleWidth)
        .attr("y", (d, i) => newY(Math.max(data[i].open, data[i].close)))
        .attr("height", (d, i) =>
          Math.abs(newY(data[i].open) - newY(data[i].close))
        );

      svg
        .selectAll(".wick")
        .attr("x1", (d, i) => newX(new Date(data[i].date)))
        .attr("x2", (d, i) => newX(new Date(data[i].date)))
        .attr("y1", (d, i) => newY(data[i].high))
        .attr("y2", (d, i) => newY(data[i].low));

      // Update marker positions on zoom
      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) => ({
          ...marker,
          x: newX(new Date(data[marker.index].date)),
          y:
            newY(Math.max(data[marker.index].open, data[marker.index].close)) +
            marginTop,
        }))
      );
    };

    svg.call(d3.zoom().scaleExtent([0.5, 5]).on("zoom", zoomed));
  }, [
    gx,
    gy,
    x,
    y,
    data,
    minCandleWidth,
    minCandleSpacing,
    width,
    height,
    marginBottom,
    marginLeft,
    marginRight,
    marginTop,
  ]);

  const candleWidth = Math.max((x(1) - x(0)) * 0.8, minCandleWidth);

  const handleMouseOver = (event, d, i) => {
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
    const mouseX = event.clientX - svgRef.current.getBoundingClientRect().left;
    const clickedDate = x.invert(mouseX);

    const closestDataPoint = data.reduce((prev, curr) =>
      Math.abs(new Date(curr.date) - clickedDate) <
      Math.abs(new Date(prev.date) - clickedDate)
        ? curr
        : prev
    );

    const markerX = x(new Date(closestDataPoint.date));
    const markerY =
      y(Math.max(closestDataPoint.open, closestDataPoint.close)) + marginTop;

    setMarkers((prevMarkers) => [
      ...prevMarkers,
      {
        x: markerX,
        y: markerY,
        index: data.indexOf(closestDataPoint),
        text: "",
      },
    ]);
  };

  const handleMarkerTextChange = (event) => {
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker, i) =>
        i === activeMarkerIndex
          ? { ...marker, text: event.target.value }
          : marker
      )
    );
  };

  const handleMarkerClick = (index) => {
    setActiveMarkerIndex(index);
  };

  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onClick={handleChartClick}
      >
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
                x1={x(new Date(d.date))}
                x2={x(new Date(d.date))}
                y1={y(d.high)}
                y2={y(d.low)}
              />
              <rect
                className={`candle ${
                  d.open > d.close ? "text-red-500" : "text-green-500"
                }`}
                fill={d.open > d.close ? "red" : "green"}
                x={x(new Date(d.date)) - candleWidth / 2}
                width={candleWidth}
                y={y(Math.max(d.open, d.close))}
                height={Math.abs(y(d.open) - y(d.close))}
                onMouseOver={(event) => handleMouseOver(event, d)}
                onMouseOut={handleMouseOut}
              />
            </g>
          ))}
          {markers.map((marker, index) => (
            <g key={index} onClick={() => handleMarkerClick(index)}>
              <circle cx={marker.x} cy={marker.y} r={5} fill="yellow" />
              <text x={marker.x + 10} y={marker.y} fontSize="12" fill="black">
                {marker.text}
              </text>
            </g>
          ))}
        </g>
        {tooltip && (
          <g>
            <rect
              x={tooltip.x}
              y={tooltip.y}
              width={tooltip.width + 150}
              height={tooltip.height + 70}
              fill="#000"
              stroke="red"
              strokeWidth={1}
              rx={6}
              ry={6}
              filter="url(#tooltip-shadow)"
            />
            <text x={tooltip.x + 10} y={tooltip.y + 20} fill="white">
              Date: {formatDateString(tooltip.date)}
            </text>
            <text x={tooltip.x + 10} y={tooltip.y + 35} fill="white">
              Open: {tooltip.open}
            </text>
            <text x={tooltip.x + 10} y={tooltip.y + 50} fill="white">
              Close: {tooltip.close}
            </text>
            <text x={tooltip.x + 10} y={tooltip.y + 65} fill="white">
              High: {tooltip.high}
            </text>
            <text x={tooltip.x + 10} y={tooltip.y + 80} fill="white">
              Low: {tooltip.low}
            </text>
          </g>
        )}
        <defs>
          <filter
            id="tooltip-shadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="4"
              floodColor="rgba(0, 0, 0, 0.1)"
            />
          </filter>
        </defs>
      </svg>
      <div>
        <input
          type="text"
          value={markers[activeMarkerIndex]?.text || ""}
          onChange={handleMarkerTextChange}
          placeholder="Enter marker text"
        />
      </div>
    </div>
  );
}