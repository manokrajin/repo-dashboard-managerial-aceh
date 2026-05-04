"use client";

import type { DistributionItem } from "@/app/lib/types";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface RealisasiSectionProps {
  title: string;
  data: DistributionItem[];
  colorTheme: "green" | "blue" | "amber" | "purple" | "emerald";
  icon?: string;
}

export default function RealisasiSection({ title, data, colorTheme, icon }: RealisasiSectionProps) {
  const themeMap = {
    green: { fill: "#22c55e" },
    blue: { fill: "#0ea5e9" },
    amber: { fill: "#f59e0b" },
    purple: { fill: "#a855f7" },
    emerald: { fill: "#10b981" },
  };

  const theme = themeMap[colorTheme] || themeMap.green;

  const totalRealisasi = data.reduce((sum, item) => sum + item.realization, 0);

  const chartData = {
    labels: ["Realisasi"],
    datasets: [
      {
        data: [totalRealisasi || 1], // Provide 1 to show a full circle if total is 0
        backgroundColor: [theme.fill],
        borderWidth: 0,
        hoverOffset: 0,
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
            return `Realisasi: ${totalRealisasi.toLocaleString("id-ID")} Ton`;
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
    return (
      <div key={index} style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#334155", lineHeight: 1.3 }}>
            {item.region}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: theme.fill, flexShrink: 0, marginLeft: "6px" }}>
            {item.realization.toLocaleString("id-ID")}
          </div>
        </div>
        <div style={{ position: "relative", height: "5px", background: "#e2e8f0", borderRadius: "3px" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "100%", background: theme.fill, borderRadius: "3px" }} />
        </div>
        <div style={{ display: "flex", gap: "8px", fontSize: "9px", color: "#94a3b8", marginTop: "2px" }}>
          <span>Realisasi: {item.realization.toLocaleString("id-ID")}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", height: "100%" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 800, textTransform: "uppercase", marginBottom: "16px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
        {icon && <span>{icon}</span>} {title}
      </h2>

      {/* Top: Chart + Totals */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px dashed #e2e8f0" }}>
        <div style={{ position: "relative", width: "90px", height: "90px", flexShrink: 0 }}>
          <Doughnut data={chartData} options={chartOptions} />
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", pointerEvents: "none"
          }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>
              Total
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", color: "#475569" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Realisasi Keseluruhan
          </div>
          <div>Total: <strong style={{ color: theme.fill, fontSize: "14px" }}>{totalRealisasi.toLocaleString("id-ID")} Ton</strong></div>
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
