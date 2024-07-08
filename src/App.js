import CandleStick from "./candlestick/Candlestick";

export default function App() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <CandleStick data={generateRandomData(new Date(2015, 0, 1), 10000)} />
    </div>
  );
}

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

    // Increment the currentDate by 1 day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

// Example usage:
const startDate = "2024-07-01";
const numPoints = 150;
const randomData = generateRandomData(startDate, numPoints);
console.log(randomData);
