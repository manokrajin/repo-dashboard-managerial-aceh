"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { PriceEntry } from "@/app/lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  priceHistory: PriceEntry[];
}

export default function PriceChart({ priceHistory }: PriceChartProps) {
  const labels = priceHistory.map((p) => {
    // Format date: "16/04/2026" → "16 Apr"
    const parts = p.date.split("/");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${parts[0]} ${months[monthIdx] || parts[1]}`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Medium",
        data: priceHistory.map((p) => p.medium),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.08)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
      {
        label: "Premium",
        data: priceHistory.map((p) => p.premium),
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.08)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#0ea5e9",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
      {
        label: "Minyakita",
        data: priceHistory.map((p) => p.minyakGoreng),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#f59e0b",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
          font: {
            size: 11,
            weight: 600 as const,
            family: "Inter, sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { size: 12, family: "Inter, sans-serif" },
        bodyFont: { size: 12, family: "Inter, sans-serif" },
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const unit = context.dataset.label === "Minyak Goreng" ? "/L" : "/Kg";
            return `${context.dataset.label}: Rp${context.parsed.y.toLocaleString("id-ID")}${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10, family: "Inter, sans-serif" },
          color: "#94a3b8",
        },
        border: { display: false },
      },
      y: {
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
          drawTicks: false,
        },
        ticks: {
          font: { size: 10, family: "Inter, sans-serif" },
          color: "#94a3b8",
          padding: 8,
          callback: function (value: string | number) {
            return `${(Number(value) / 1000).toFixed(0)}rb`;
          },
        },
        border: { display: false },
      },
    },
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ height: "240px", width: "100%" }}>
        <Line data={data} options={options} />
      </div>
      <div style={{ marginTop: "12px", fontSize: "11px", color: "#94a3b8", textAlign: "right" }}>
        Sumber: SP2KP Kemendag
      </div>
    </div>
  );
}
