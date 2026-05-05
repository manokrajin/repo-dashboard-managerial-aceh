"use client";

import type { DistributionItem } from "@/app/lib/types";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PengelolaanSectionProps {
  title: string;
  dataGkp: DistributionItem[];
  dataOlah: DistributionItem[];
}

export default function PengelolaanSection({ title, dataGkp, dataOlah }: PengelolaanSectionProps) {
  const themeGkp = { fill: "#10b981" }; // emerald
  const themeOlah = { fill: "#f59e0b" }; // amber

  const totalGkp = dataGkp.reduce((sum, item) => sum + item.realization, 0);
  const totalOlah = dataOlah.reduce((sum, item) => sum + item.realization, 0);

  const chartDataGkp = {
    labels: ["GKP"],
    datasets: [{
      data: [totalGkp || 1],
      backgroundColor: [themeGkp.fill],
      borderWidth: 0,
      hoverOffset: 0,
    }],
  };

  const chartDataOlah = {
    labels: ["Olah"],
    datasets: [{
      data: [totalOlah || 1],
      backgroundColor: [themeOlah.fill],
      borderWidth: 0,
      hoverOffset: 0,
    }],
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
            return `Total: ${context.raw.toLocaleString("id-ID")} Ton`;
          },
        },
      },
    },
  };

  const renderRegionItem = (item: DistributionItem, index: number, theme: { fill: string }) => {
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
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", height: "100%" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 800, textTransform: "uppercase", marginBottom: "16px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>🌾</span> {title}
      </h2>

      {/* Top: Two Charts */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px dashed #e2e8f0" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ position: "relative", width: "70px", height: "70px", flexShrink: 0 }}>
            <Doughnut data={chartDataGkp} options={chartOptions} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Realisasi GKP</div>
            <strong style={{ color: themeGkp.fill, fontSize: "14px" }}>{totalGkp.toLocaleString("id-ID")}</strong>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ position: "relative", width: "70px", height: "70px", flexShrink: 0 }}>
            <Doughnut data={chartDataOlah} options={chartOptions} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Realisasi Pengolahan</div>
            <strong style={{ color: themeOlah.fill, fontSize: "14px" }}>{totalOlah.toLocaleString("id-ID")}</strong>
          </div>
        </div>
      </div>

      {/* Bottom: List of regions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: themeGkp.fill, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", marginBottom: "2px" }}>
            Rincian GKP
          </div>
          {dataGkp.map((item, index) => renderRegionItem(item, index, themeGkp))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: themeOlah.fill, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", marginBottom: "2px" }}>
            Rincian Olah
          </div>
          {dataOlah.map((item, index) => renderRegionItem(item, index, themeOlah))}
        </div>
      </div>
    </div>
  );
}
