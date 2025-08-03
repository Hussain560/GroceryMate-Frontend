import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, options }) => {
  // Set width/height to make the chart bigger
  return (
    <div style={{ width: 220, height: 220 }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;