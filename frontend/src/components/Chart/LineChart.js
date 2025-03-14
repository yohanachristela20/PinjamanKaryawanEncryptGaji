import React from "react";
import { Line } from "react-chartjs-2";

const LineComponent = ({ chartData }) => {
  // Konfigurasi data untuk Bar Chart
  const data = {
    labels: chartData.labels, // Labels untuk sumbu X
    datasets: [
      {
        label: "Divisi", 
        data: chartData.series[0], // Data pada sumbu Y
        backgroundColor: "rgba(170,84,134,1)", 
        borderColor: "rgba(170,84,134,1)",            
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
          display: false, // Sembunyikan grid di sumbu X
        },
      },
      y: {
        beginAtZero: true, 
        ticks: {
          stepSize: 10, // Langkah nilai pada sumbu Y
        },
        grid: {
          drawBorder: true, 
        },
            title: {
            display: true,
            text: "Jumlah Pinjaman (Juta)", // Label sumbu X
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
      <Line data={data} options={options} />
    </div>
  );
};

export default LineComponent;
