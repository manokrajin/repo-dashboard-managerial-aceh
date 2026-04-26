"use client";

interface ExportButtonsProps {
  onRefresh: () => void;
  onDownloadImage: () => void;
  onDownloadPdf: () => void;
  isRefreshing: boolean;
  isExporting: boolean;
}

export default function ExportButtons({
  onRefresh,
  onDownloadImage,
  onDownloadPdf,
  isRefreshing,
  isExporting,
}: ExportButtonsProps) {
  return (
    <div className="action-bar" id="action-bar">
      <div className="action-bar-title">
        <span className="dot" />
        Dashboard Managerial BULOG
      </div>
      <div className="action-buttons">
        <button
          className="btn btn-refresh"
          onClick={onRefresh}
          disabled={isRefreshing || isExporting}
          id="btn-refresh"
        >
          {isRefreshing ? (
            <>
              <span className="spinner" />
              Memuat...
            </>
          ) : (
            <>🔄 Refresh Data</>
          )}
        </button>
        <button
          className="btn btn-image"
          onClick={onDownloadImage}
          disabled={isRefreshing || isExporting}
          id="btn-download-image"
        >
          {isExporting ? (
            <>
              <span className="spinner" />
              Proses...
            </>
          ) : (
            <>🖼️ Unduh Gambar</>
          )}
        </button>
        <button
          className="btn btn-pdf"
          onClick={onDownloadPdf}
          disabled={isRefreshing || isExporting}
          id="btn-download-pdf"
        >
          {isExporting ? (
            <>
              <span className="spinner" />
              Proses...
            </>
          ) : (
            <>📄 Unduh PDF</>
          )}
        </button>
      </div>
    </div>
  );
}
