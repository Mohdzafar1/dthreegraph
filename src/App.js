import React from 'react';
import LineChart from './chartGraph/LineChart';
import data from './data';
// import CandlestickChart from './chartGraph/CandleStick';
import E01CommonSvgElement from './Sections/s01Svg/E01CommonSvgElement';
import CustomBarChart from './Sections/barChart/CustomBarChart';
import LinerScale from './Sections/LinerScal/LinerScale';
import CandlestickChartD3 from "./chartGraph/CandelStickD3";
import CandleStickChart from './chartGraph/CandlestickChart';
import CandlestickChart2 from './chartGraph/CandleStickChart2';

function generateRandomData(startDate, numPoints) {
  const data = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < numPoints; i++) {
    const open = Math.random() * (200 - 80) + 80;
    const close = Math.random() * (200 - 80) + 80;
    const high = Math.max(open, close) + Math.random() * 20;
    const low = Math.min(open, close) - Math.random() * 20;

    data.push({
      date: currentDate.toISOString().split("T")[0],
      open: parseFloat(open.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}



function App() {
  return (
    <div className="App">
       {/* <LineChart data={data}/> */}
       {/* <CandlestickChart/> */}
       {/* <E01CommonSvgElement/> */}
       {/* <CustomBarChart/> */}
       {/* <LinerScale/> */}
       {/* <CandlestickChartD3  data={data}/> */}
         {/* <CandleStickChart  data={generateRandomData("2024-07-01",5000)}/> */}
         <CandleStickChart  data={data}/>
         {/* <CandlestickChart2 data={data}/> */}

    </div>
  );
}

export default App;
