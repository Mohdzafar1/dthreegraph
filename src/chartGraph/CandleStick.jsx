import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { FaPencilAlt } from 'react-icons/fa';

const CandlestickChart = () => {
  const [options, setOptions] = useState({
    chart: {
      type: 'candlestick',
      height: window.innerHeight,
      toolbar: {
        show: true,
        tools: {
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: 'x', // can be 'x', 'y', or 'xy'
        autoScaleYaxis: true,
      },
      pan: {
        enabled: true,
        mode: 'x', // pan on x axis
      },
    },
    title: {
      text: 'Candlestick Chart ',
      align: 'left',
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
    annotations: {
      xaxis: [],
      yaxis: [],
      points: [],
      lines: [],
    },
  });

  const [series, setSeries] = useState([
    {
      data: [
        { x: 1538778600000, y: [6629.81, 6650.5, 6623.04, 6633.33] },
        { x: 1538780400000, y: [6632.01, 6643.59, 6620, 6630.11] },
        { x: 1538782200000, y: [6630.71, 6648.95, 6623.34, 6635.65] },
        { x: 1538784000000, y: [6635.65, 6651, 6629.67, 6638.24] },
        { x: 1538785800000, y: [6638.24, 6640, 6620, 6624.47] },
        { x: 1538787600000, y: [6624.53, 6636.03, 6621.68, 6624.31] },
        { x: 1538789400000, y: [6624.61, 6632.2, 6617, 6626.02] },
        { x: 1538791200000, y: [6627, 6627.62, 6584.22, 6603.02] },
        { x: 1538793000000, y: [6605, 6608.03, 6598.95, 6604.01] },
        { x: 1538794800000, y: [6604.5, 6614.4, 6602.26, 6608.02] },
        { x: 1538796600000, y: [6608.02, 6610.68, 6601.99, 6608.91] },
        { x: 1538798400000, y: [6608.91, 6618.99, 6608.01, 6612] },
        { x: 1538800200000, y: [6612, 6615.13, 6605.09, 6612] },
        { x: 1538802000000, y: [6612, 6624.12, 6608.43, 6622.95] },
        { x: 1538803800000, y: [6623.91, 6623.91, 6615, 6615.67] },
        { x: 1538805600000, y: [6618.69, 6618.74, 6610, 6610.4] },
        { x: 1538807400000, y: [6611, 6622.78, 6610.4, 6614.9] },
        { x: 1538809200000, y: [6614.9, 6626.2, 6613.33, 6623.45] },
        { x: 1538811000000, y: [6623.48, 6627, 6618.38, 6620.35] },
        { x: 1538812800000, y: [6619.43, 6620.35, 6610.05, 6615.53] }
      ],
    },
  ]);

  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false); // State to toggle drawing mode

  const handleChartClick = (event, chartContext, config) => {
    if (drawingMode) {
      const { clientX, clientY } = event;

      // Convert client coordinates to chart data values
      const xValue = chartContext.xaxis?.invert(clientX - chartContext.el.getBoundingClientRect().left);
      const yValue = chartContext.yaxis?.invert(clientY - chartContext.el.getBoundingClientRect().top);

      if (xValue !== undefined && yValue !== undefined) {
        if (!startPoint) {
          setStartPoint({ x: xValue, y: yValue });
        } else if (!endPoint) {
          setEndPoint({ x: xValue, y: yValue });

          // Add trend line annotation
          const newLine = {
            x: [
              { x: startPoint.x, y: startPoint.y },
              { x: endPoint.x, y: endPoint.y }
            ],
            borderColor: '#775DD0', // Set the border color here
            strokeDashArray: 0,
            opacity: 0.8
          };

          setOptions(prevOptions => ({
            ...prevOptions,
            annotations: {
              ...prevOptions.annotations,
              lines: [...prevOptions.annotations.lines, newLine]
            }
          }));

          // Reset points and drawing mode
          setStartPoint(null);
          setEndPoint(null);
          setDrawingMode(false);
        }
      }
    }
  };

  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    setStartPoint(null); // Clear any existing start point
    setEndPoint(null); // Clear any existing end point
  };

  return (
    <div>
      {/* <button onClick={toggleDrawingMode}>
        <FaPencilAlt /> {drawingMode ? 'Cancel Drawing' : 'Draw Trend Line'}
      </button> */}
      <Chart options={options} series={series} type="candlestick" height={window.innerHeight} events={{ click: handleChartClick }} />
    </div>
  );
};

export default CandlestickChart;
