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

function formatDateString(seconds) {
  const date = new Date(seconds * 1000); // Convert seconds to milliseconds
  const options = { day: "numeric", month: "long" };
  return date.toLocaleDateString("en-US", options); // Format as "19 July"
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
         {/* <CandlestickChart2 data={data}/>  */}

    </div>
  );
}

export default App;
