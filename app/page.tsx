import { fetchSheetData } from "@/app/lib/sheets";
import Dashboard from "@/app/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  let data;

  try {
    data = await fetchSheetData();
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Gagal Memuat Data</h2>
          <p className="error-message">
            Tidak dapat mengambil data dari spreadsheet. Pastikan spreadsheet
            sudah dipublikasikan dan koneksi internet tersedia.
          </p>
          <a href="/" className="btn btn-refresh" style={{ textDecoration: "none" }}>
            🔄 Coba Lagi
          </a>
        </div>
      </div>
    );
  }

  return <Dashboard initialData={data} />;
}
