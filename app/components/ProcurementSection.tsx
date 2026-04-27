"use client";

import type { ProcurementItem } from "@/app/lib/types";

interface ProcurementSectionProps {
  pengadaan: ProcurementItem[];
}

export default function ProcurementSection({ pengadaan }: ProcurementSectionProps) {
  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <h2 style={{ fontSize: "20px", fontWeight: 800, textTransform: "uppercase", marginBottom: "20px", color: "#1e293b" }}>
        Pengadaan PSO 2026
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {pengadaan.map((item, index) => {
          const progress = item.target > 0 ? (item.realization / item.target) * 100 : 0;
          const progressClamped = Math.min(Math.max(progress, 0), 100);
          
          return (
            <div key={index}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#334155" }}>{item.name}</div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>{progress.toFixed(0)}%</div>
              </div>
              <div style={{ height: "12px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden", marginBottom: "8px" }}>
                <div 
                  style={{ 
                    width: `${progressClamped}%`, 
                    height: "100%", 
                    background: index === 0 ? "#cbd5e1" : (index === 1 ? "#38bdf8" : "#cbd5e1"),
                    borderRadius: "6px"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "13px", color: "#475569" }}>
                <div>Target <span style={{ marginLeft: "12px" }}>: {item.target.toLocaleString("id-ID")} Ton</span></div>
                <div>Realisasi <span style={{ marginLeft: "4px" }}>: {item.realization.toLocaleString("id-ID")} Ton</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
