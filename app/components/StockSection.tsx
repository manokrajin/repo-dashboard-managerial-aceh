"use client";

import { useState } from "react";
import type { StockItem } from "@/app/lib/types";

interface StockSectionProps {
  stock: StockItem[];
  stockDate: string;
}

/** Renders the icon for a stock item — either an <img> or emoji fallback */
function StockIcon({ item }: { item: StockItem }) {
  const [imgError, setImgError] = useState(false);

  if (item.imageUrl && !imgError) {
    return (
      <img
        src={item.imageUrl}
        alt={item.name}
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
        style={{
          width: "24px",
          height: "24px",
          objectFit: "contain",
          borderRadius: "4px",
        }}
      />
    );
  }

  return <span style={{ fontSize: "18px", lineHeight: 1 }}>{item.icon}</span>;
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
            key={`${item.name}-${index}`} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "10px 16px", 
              background: index % 2 === 0 ? "#f8fafc" : "transparent",
              borderRadius: "8px",
              fontSize: "14px"
            }}
          >
            <div style={{
              marginRight: "12px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              borderRadius: "6px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              flexShrink: 0,
            }}>
              <StockIcon item={item} />
            </div>
            <div style={{ flex: 1, fontWeight: 600, color: "#334155" }}>{item.name}</div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>
              <span style={{ marginRight: "4px" }}>:</span>
              {item.value} {item.unit && <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{item.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
