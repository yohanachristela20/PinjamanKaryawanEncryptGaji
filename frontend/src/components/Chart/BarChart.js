import React from "react";
import { Bar } from "react-chartjs-2";

const ChartComponent = ({ chartData }) => {
  const data = {
    labels: chartData.labels, // Labels untuk sumbu X
    datasets: [
      {
        label: "Departemen", 
        data: chartData.series[0], // Data pada sumbu Y
        backgroundColor: "rgba(250,124,114, 0.6)",
        borderColor: "rgba(250,124,114, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Konfigurasi opsi untuk Bar Chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false, 
        },
      },
      y: {
        beginAtZero: true, 
        ticks: {
          stepSize: 10, 
        },
        grid: {
          drawBorder: true, 
        },
            title: {
            display: true,
            text: "Jumlah Pinjaman (Juta)", 
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.raw; 
          },
        },
      },
      legend: {
        display: true,
        position: "top", 
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: "245px" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ChartComponent;
