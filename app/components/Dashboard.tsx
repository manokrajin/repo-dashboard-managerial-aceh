"use client";

import { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { DashboardData } from "@/app/lib/types";
import Header from "./Header";
import PriceChart from "./PriceChart";
import StockSection from "./StockSection";
import PriceSection from "./PriceSection";
import ExportButtons from "./ExportButtons";
import ProcurementSection from "./ProcurementSection";
import DistributionSection from "./DistributionSection";
import IHSGSection from "./IHSGSection";

interface DashboardProps {
  initialData: DashboardData;
}

export default function Dashboard({ initialData }: DashboardProps) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
  );
  const captureRef = useRef<HTMLDivElement>(null);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/sheets", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const newData: DashboardData = await res.json();
      setData(newData);
      setLastUpdated(
        new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      );
    } catch (err) {
      console.error("Refresh failed:", err);
      alert("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const getCanvas = useCallback(async () => {
    if (!captureRef.current) return null;
    
    // Create canvas with refined options
    const canvas = await html2canvas(captureRef.current, {
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: captureRef.current.scrollWidth,
      height: captureRef.current.scrollHeight,
      onclone: (clonedDoc) => {
        // Find the element in the cloned document
        const element = clonedDoc.querySelector(".dashboard-capture") as HTMLElement;
        if (element) {
          element.style.height = "auto";
          element.style.overflow = "visible";
        }
      }
    });
    return canvas;
  }, []);

  const handleDownloadImage = useCallback(async () => {
    setIsExporting(true);
    try {
      const canvas = await getCanvas();
      if (!canvas) return;
      
      const safeDate = data.stockDate.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/-$/, "");
      const fileName = `bulog-aceh-${safeDate}.png`;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.style.display = "none";
        document.body.appendChild(a);
        
        // Trigger download
        a.click();
        
        // Cleanup after a long delay to ensure browser finished
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 30000);
      }, "image/png");

    } catch (err) {
      console.error("Image export failed:", err);
      alert("Gagal mengunduh gambar.");
    } finally {
      setIsExporting(false);
    }
  }, [getCanvas, data.stockDate]);

  const handleDownloadPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const canvas = await getCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [210, (canvas.height * 210) / canvas.width],
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 210, (canvas.height * 210) / canvas.width);
      
      const safeDate = data.stockDate.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/-$/, "");
      pdf.save(`bulog-aceh-${safeDate}.pdf`);
      
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Gagal mengunduh PDF.");
    } finally {
      setIsExporting(false);
    }
  }, [getCanvas, data.stockDate]);

  return (
    <div className="dashboard-page">
      <ExportButtons
        onRefresh={handleRefresh}
        onDownloadImage={handleDownloadImage}
        onDownloadPdf={handleDownloadPdf}
        isRefreshing={isRefreshing}
        isExporting={isExporting}
      />

      {/* Loading overlay */}
      {isRefreshing && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="loading-spinner" />
            <div className="loading-text">Memuat data dari spreadsheet...</div>
          </div>
        </div>
      )}

      <div className="dashboard-container">
        <div className="dashboard-capture" ref={captureRef}>
          {/* Header */}
          <Header date={data.stockDate} />

          {/* Body */}
          <div className="dashboard-body">
            {/* Top Grid: Left (Price, Chart, Pengadaan) / Right (Stock, IHSG) */}
            <div className="dashboard-columns">
              {/* Left Column */}
              <div className="dashboard-column">
                <PriceSection
                  latestMedium={data.latestMedium}
                  latestPremium={data.latestPremium}
                  latestMinyakGoreng={data.latestMinyakGoreng}
                />

                <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "16px", letterSpacing: "0.05em" }}>
                    Grafik Harga Beras &amp; Minyak Goreng — SP2KP Kemendag
                  </h2>
                  <PriceChart priceHistory={data.priceHistory} />
                </div>

                <ProcurementSection pengadaan={data.pengadaan} />
              </div>

              {/* Right Column */}
              <div className="dashboard-column">
                <IHSGSection ihsg={data.ihsg} />
                
                <StockSection stock={data.stock} stockDate={data.stockDate} />
              </div>
            </div>

            {/* SPHP, BANPANG, MINYAKITA side by side */}
            <div className="distribution-row">
              <DistributionSection title="SPHP" data={data.sphp} colorTheme="amber" icon="📦" />
              <DistributionSection title="BANPANG" data={data.banpang} colorTheme="purple" icon="🏷️" />
              <DistributionSection title="MINYAKITA" data={data.distMinyakita} colorTheme="blue" icon="🫗" />
            </div>
          </div>

          {/* Footer */}
          <div className="dashboard-footer">
            <div className="footer-source">
              Sumber Data: Google Spreadsheet BULOG Kanwil Aceh
            </div>
            <div className="footer-timestamp">
              Terakhir diperbarui: {lastUpdated}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
