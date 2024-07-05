import React from 'react';
import LineChart from './chartGraph/LineChart';
import data from './data';


function App() {
  return (
    <div className="App">
       <LineChart data={data}/>
    </div>
  );
}

export default App;
