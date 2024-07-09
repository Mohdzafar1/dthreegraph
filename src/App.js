import React from 'react';
import data from './data';
import CandleStickChart from './chartGraph/CandlestickChart';

function dateToSeconds(dateString) {
  const date = new Date(dateString);
  return date.getTime() / 1000;
}

const newData = data.map((entry) => ({
  ...entry,
  date: dateToSeconds(entry.date),
}));


function App() {
  return (
    <>
         <CandleStickChart  data={data}/> 
    </>
  );
}

export default App;
