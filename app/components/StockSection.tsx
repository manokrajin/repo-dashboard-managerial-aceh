"use client";

import type { StockItem } from "@/app/lib/types";

interface StockSectionProps {
  stock: StockItem[];
  stockDate: string;
}

export default function StockSection({ stock, stockDate }: StockSectionProps) {
  return (
    <div style={{ padding: "24px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <h2 style={{ fontSize: "20px", fontWeight: 800, textTransform: "uppercase", marginBottom: "20px", color: "#1e293b" }}>
        STOK <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "8px", fontWeight: 500, textTransform: "none" }}>Per Tanggal {stockDate}</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
        {stock.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "10px 16px", 
              background: index % 2 === 0 ? "#f8fafc" : "transparent",
              borderRadius: "8px",
              fontSize: "14px"
            }}
          >
            <div style={{ marginRight: "12px", fontSize: "18px" }}>{item.icon}</div>
            <div style={{ flex: 1, fontWeight: 600, color: "#334155" }}>{item.name}</div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>
              <span style={{ marginRight: "4px" }}>:</span>
              {item.value} <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
