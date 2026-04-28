"use client";

import type { IHSGData } from "@/app/lib/types";

interface IHSGSectionProps {
  ihsg: IHSGData;
}

export default function IHSGSection({ ihsg }: IHSGSectionProps) {
  if (!ihsg.entries || ihsg.entries.length === 0) return null;

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
          📊 IHK — Harga Beras Per Kab/Kota
        </h2>
        {ihsg.date && (
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
            Per Tanggal: {ihsg.date}
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ overflow: "hidden", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#0c4a6e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #0ea5e9" }}>
                Kota
              </th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#0c4a6e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #22c55e" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                  Medium
                </span>
              </th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#0c4a6e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #3b82f6" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" }} />
                  Premium
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ihsg.entries.map((entry, index) => {
              const isMediumHigh = entry.medium > ihsg.hetMedium;
              const isPremiumHigh = entry.premium > ihsg.hetPremium;
              
              return (
                <tr 
                  key={index} 
                  style={{ 
                    background: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                    borderBottom: "1px solid #f1f5f9"
                  }}
                >
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#334155" }}>
                    {entry.city}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: isMediumHigh ? "#ef4444" : "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                    Rp{entry.medium.toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: isPremiumHigh ? "#ef4444" : "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                    Rp{entry.premium.toLocaleString("id-ID")}
                  </td>
                </tr>
              );
            })}
            {/* HET Bapanas Row */}
            {(ihsg.hetMedium > 0 || ihsg.hetPremium > 0) && (
              <tr style={{ background: "#fef2f2", borderTop: "2px solid #fecaca" }}>
                <td style={{ padding: "12px 14px", fontWeight: 800, color: "#991b1b", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                  HET Bapanas
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: "#991b1b", fontVariantNumeric: "tabular-nums" }}>
                  {ihsg.hetMedium > 0 ? `Rp${ihsg.hetMedium.toLocaleString("id-ID")}` : "-"}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: "#991b1b", fontVariantNumeric: "tabular-nums" }}>
                  {ihsg.hetPremium > 0 ? `Rp${ihsg.hetPremium.toLocaleString("id-ID")}` : "-"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Minyakita Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", marginTop: "24px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
          🫗 IHK — Harga Minyakita Per Kab/Kota
        </h2>
      </div>
      <div style={{ overflow: "hidden", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#92400e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #f59e0b" }}>
                Kota
              </th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#92400e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #f59e0b" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }} />
                  Minyakita
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ihsg.entries.map((entry, index) => (
              <tr 
                key={index} 
                style={{ 
                  background: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                  borderBottom: "1px solid #f1f5f9"
                }}
              >
                <td style={{ padding: "10px 14px", fontWeight: 600, color: "#334155" }}>
                  {entry.city}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: entry.minyakita > ihsg.hetMinyakita ? "#ef4444" : "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                  Rp{entry.minyakita.toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
            {ihsg.hetMinyakita > 0 && (
              <tr style={{ background: "#fef2f2", borderTop: "2px solid #fecaca" }}>
                <td style={{ padding: "12px 14px", fontWeight: 800, color: "#991b1b", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                  HET Bapanas
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: "#991b1b", fontVariantNumeric: "tabular-nums" }}>
                  Rp{ihsg.hetMinyakita.toLocaleString("id-ID")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
