"use client";

interface PriceSectionProps {
  latestMedium: number;
  latestPremium: number;
  latestMinyakGoreng: number;
  hetMedium?: number;
  hetPremium?: number;
  hetMinyakita?: number;
}

export default function PriceSection({
  latestMedium,
  latestPremium,
  latestMinyakGoreng,
  hetMedium = 0,
  hetPremium = 0,
  hetMinyakita = 0,
}: PriceSectionProps) {
  const isMediumAboveHet = hetMedium > 0 && latestMedium > hetMedium;
  const isPremiumAboveHet = hetPremium > 0 && latestPremium > hetPremium;
  const isMinyakitaAboveHet = hetMinyakita > 0 && latestMinyakGoreng > hetMinyakita;

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "16px", letterSpacing: "0.05em" }}>
        Harga Beras &amp; Minyak Goreng Rata-Rata Se-Aceh
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        <div style={{ flex: 1, padding: "14px", background: isMediumAboveHet ? "#fef2f2" : "#f8fafc", borderRadius: "8px", border: isMediumAboveHet ? "1px solid #fecaca" : "1px solid transparent" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
            Medium
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: isMediumAboveHet ? "#ef4444" : "#0f172a" }}>
            Rp{latestMedium.toLocaleString("id-ID")}<span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>/Kg</span>
          </div>
          {isMediumAboveHet && (
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#ef4444", marginTop: "4px" }}>
              ▲ Di atas HET Rp{hetMedium.toLocaleString("id-ID")}
            </div>
          )}
        </div>
        <div style={{ flex: 1, padding: "14px", background: isPremiumAboveHet ? "#fef2f2" : "#f8fafc", borderRadius: "8px", border: isPremiumAboveHet ? "1px solid #fecaca" : "1px solid transparent" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }} />
            Premium
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: isPremiumAboveHet ? "#ef4444" : "#0f172a" }}>
            Rp{latestPremium.toLocaleString("id-ID")}<span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>/Kg</span>
          </div>
          {isPremiumAboveHet && (
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#ef4444", marginTop: "4px" }}>
              ▲ Di atas HET Rp{hetPremium.toLocaleString("id-ID")}
            </div>
          )}
        </div>
        <div style={{ flex: 1, padding: "14px", background: isMinyakitaAboveHet ? "#fef2f2" : "#f8fafc", borderRadius: "8px", border: isMinyakitaAboveHet ? "1px solid #fecaca" : "1px solid transparent" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
            Minyakita
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: isMinyakitaAboveHet ? "#ef4444" : "#0f172a" }}>
            Rp{latestMinyakGoreng.toLocaleString("id-ID")}<span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>/L</span>
          </div>
          {isMinyakitaAboveHet && (
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#ef4444", marginTop: "4px" }}>
              ▲ Di atas HET Rp{hetMinyakita.toLocaleString("id-ID")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
