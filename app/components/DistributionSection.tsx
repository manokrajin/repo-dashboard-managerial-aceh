"use client";

import type { DistributionItem } from "@/app/lib/types";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DistributionSectionProps {
  title: string;
  data: DistributionItem[];
  colorTheme: "green" | "blue" | "amber" | "purple";
  icon: string;
}

export default function DistributionSection({ title, data, colorTheme, icon }: DistributionSectionProps) {
  const themeMap = {
    green: { fill: "#22c55e" },
    blue: { fill: "#0ea5e9" },
    amber: { fill: "#f59e0b" },
    purple: { fill: "#a855f7" },
  };

  const theme = themeMap[colorTheme];

  const totalTarget = data.reduce((sum, item) => sum + item.target, 0);
  const totalRealisasi = data.reduce((sum, item) => sum + item.realization, 0);
  const totalProgress = totalTarget > 0 ? (totalRealisasi / totalTarget) * 100 : 0;
  const remainingTarget = Math.max(0, totalTarget - totalRealisasi);

  const chartData = {
    labels: ["Realisasi", "Sisa Target"],
    datasets: [
      {
        data: [totalRealisasi, remainingTarget],
        backgroundColor: [theme.fill, "#e2e8f0"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: "80%",
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw.toLocaleString("id-ID")} Ton`;
          },
        },
      },
    },
  };

  // Split data into two columns
  const midpoint = Math.ceil(data.length / 2);
  const leftColumn = data.slice(0, midpoint);
  const rightColumn = data.slice(midpoint);

  const renderRegionItem = (item: DistributionItem, index: number) => {
    const progress = item.target > 0 ? (item.realization / item.target) * 100 : 0;
    const progressClamped = Math.min(Math.max(progress, 0), 100);

    return (
      <div key={index} style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#334155", lineHeight: 1.3 }}>
            {item.region}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a", flexShrink: 0, marginLeft: "6px" }}>
            {progress.toFixed(0)}%
          </div>
        </div>
        <div style={{ position: "relative", height: "5px", background: "#e2e8f0", borderRadius: "3px" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progressClamped}%`, background: theme.fill, borderRadius: "3px" }} />
        </div>
        <div style={{ display: "flex", gap: "8px", fontSize: "9px", color: "#94a3b8", marginTop: "2px" }}>
          <span>Target: {item.target.toLocaleString("id-ID")}</span>
          <span>Realisasi: {item.realization.toLocaleString("id-ID")}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 800, textTransform: "uppercase", marginBottom: "16px", color: "#1e293b" }}>
        {title}
      </h2>

      {/* Top: Chart + Totals */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px dashed #e2e8f0" }}>
        <div style={{ position: "relative", width: "90px", height: "90px", flexShrink: 0 }}>
          <Doughnut data={chartData} options={chartOptions} />
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", pointerEvents: "none"
          }}>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
              {totalProgress.toFixed(0)}%
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", color: "#475569" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Realisasi Keseluruhan
          </div>
          <div>Target: <strong>{totalTarget.toLocaleString("id-ID")} Ton</strong></div>
          <div>Realisasi: <strong style={{ color: theme.fill }}>{totalRealisasi.toLocaleString("id-ID")} Ton</strong></div>
        </div>
      </div>

      {/* Bottom: List of regions — 2-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {leftColumn.map((item, index) => renderRegionItem(item, index))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {rightColumn.map((item, index) => renderRegionItem(item, midpoint + index))}
        </div>
      </div>
    </div>
  );
}
