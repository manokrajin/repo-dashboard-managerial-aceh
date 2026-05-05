import Papa from "papaparse";
import type { DashboardData, PriceEntry, StockItem, IHSGData, IHSGEntry } from "./types";

const SPREADSHEET_ID = "1_D6vhKTplYp8uACht3qJm2aVeDtNhvL6kEDylWOCVEo";

// Sheet GIDs (found in the spreadsheet URL when each tab is selected)
const GID_WEB = "1327062648";
const GID_STOK = "630102233";

/** Use the raw export URL which preserves all rows exactly as-is (no header merging) */
function getCsvUrl(gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;
}

function parseNumber(val: string): number {
  if (!val || val.trim() === "") return 0;
  // Strip "Rp" prefix if present
  let cleaned = val.replace(/^Rp\s*/i, "");
  // Handle comma as decimal separator (Indonesian format)
  cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatValue(val: number): string {
  if (val === 0) return "0";
  // If it's a whole number, no decimals
  if (Number.isInteger(val)) return val.toLocaleString("id-ID");
  // Otherwise show with decimals
  return val.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

/** Detect whether a cell value looks like an image URL */
function isImageUrl(val: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

/** Convert Google Drive URLs to direct image URLs that work as <img> src */
function toDirectImageUrl(url: string): string {
  const trimmed = url.trim();

  // Extract file ID from various Google Drive URL formats:
  // - https://drive.google.com/file/d/FILE_ID/view
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?export=view&id=FILE_ID
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (driveFileMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveFileMatch[1]}`;
  }

  const driveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?.*id=([^&#]+)/);
  if (driveIdMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveIdMatch[1]}`;
  }

  // Not a Google Drive URL — return as-is
  return trimmed;
}

/** Fetch and parse stock data dynamically from the data_stok sheet */
async function fetchStockData(): Promise<{ stock: StockItem[]; stockDate: string }> {
  const url = getCsvUrl(GID_STOK);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch stock sheet: ${response.statusText}`);
  }

  const csvText = await response.text();
  const parsed = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = parsed.data;
  if (rows.length < 2) {
    throw new Error("Stock sheet is missing required rows");
  }

  // Row 0: Header row — column names (skip col 0 which is "Tanggal")
  const headerRow = rows[0] || [];

  // Detect whether icon/unit rows exist:
  // If row 1 col 0 looks like a date (contains "/"), it's a data row → no icon/unit rows.
  // Otherwise, row 1 = icons, row 2 = units, row 3+ = data.
  const row1Col0 = (rows[1]?.[0] || "").trim();
  const hasMetaRows = !row1Col0.includes("/") && !/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(row1Col0);

  let iconRow: string[] = [];
  let unitRow: string[] = [];
  let dataStartIdx: number;

  if (hasMetaRows && rows.length >= 4) {
    // Row 1: Icon/Image URL row
    iconRow = rows[1] || [];
    // Row 2: Unit row
    unitRow = rows[2] || [];
    // Row 3+: Data rows
    dataStartIdx = 3;
  } else {
    // No icon/unit rows — all rows after header are data
    dataStartIdx = 1;
  }

  // Use the latest (last) data row
  const latestDataRow = rows[rows.length - 1] || [];
  const stockDate = latestDataRow[0]?.trim() || new Date().toLocaleDateString("id-ID");

  const stock: StockItem[] = [];
  for (let col = 1; col < headerRow.length; col++) {
    const name = headerRow[col]?.trim();
    if (!name) continue; // Skip empty header columns

    const rawIcon = iconRow[col]?.trim() || "📦";
    const unit = unitRow[col]?.trim() || "";
    const rawVal = latestDataRow[col] || "0";

    stock.push({
      name,
      value: formatValue(parseNumber(rawVal)),
      unit,
      icon: isImageUrl(rawIcon) ? "📦" : rawIcon,
      imageUrl: isImageUrl(rawIcon) ? toDirectImageUrl(rawIcon) : undefined,
    });
  }

  return { stock, stockDate };
}

export async function fetchSheetData(): Promise<DashboardData> {
  // Fetch stock data from dedicated data_stok sheet
  const { stock, stockDate } = await fetchStockData();

  // Fetch main dashboard data from data_web sheet
  const url = getCsvUrl(GID_WEB);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
  }

  const csvText = await response.text();
  const parsed = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: "greedy",
  });

  const rows = parsed.data;

  // Parse price history — collect rows that start with a date pattern (dd/mm/yyyy) before "data stok"
  const priceHistory: PriceEntry[] = [];
  let dataStokIdx = -1;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const col0 = (row[0] || "").trim().toLowerCase();
    if (col0 === "data stok") {
      dataStokIdx = i;
      break;
    }
    if (row[0] && row[1] && row[0].includes("/")) {
      priceHistory.push({
        date: row[0].trim(),
        medium: parseNumber(row[1]),
        premium: parseNumber(row[2]),
        minyakGoreng: parseNumber(row[3]),
      });
    }
  }

  // Stock data is already fetched from data_stok sheet above

  const lastPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1] : null;
  const latestMedium = lastPrice ? lastPrice.medium : 0;
  const latestPremium = lastPrice ? lastPrice.premium : 0;
  const latestMinyakGoreng = lastPrice ? lastPrice.minyakGoreng : 0;

  // Find key marker rows dynamically
  let pengadaanLabelIdx = -1;
  let targetIdx = -1;
  let realisasiIdx = -1;
  let distHeaderIdx = -1;
  let distStartIdx = -1;

  const searchStart = dataStokIdx > 0 ? dataStokIdx : 8;
  for (let i = searchStart; i < rows.length; i++) {
    const col0 = (rows[i]?.[0] || "").trim().toLowerCase();
    
    // Pengadaan labels row: has names like "Beras Medium" in cols 1+, col 0 is empty
    // It comes right before "target" and "realisasi" rows
    if (col0 === "target" && targetIdx < 0) {
      targetIdx = i;
      // The row before "target" is the pengadaan label row
      if (i > 0) pengadaanLabelIdx = i - 1;
    }
    if (col0 === "realisasi" && realisasiIdx < 0) {
      realisasiIdx = i;
    }
    
    // Distribution header row has "target" in col 1 and "realisasi" in col 2
    if (realisasiIdx > 0 && i > realisasiIdx) {
      const col1 = (rows[i]?.[1] || "").trim().toLowerCase();
      const col2 = (rows[i]?.[2] || "").trim().toLowerCase();
      if (col1 === "target" && col2 === "realisasi" && distHeaderIdx < 0) {
        distHeaderIdx = i;
        distStartIdx = i + 1;
      }
    }

    // If we find a Kanwil/Kancab row and haven't found a distHeader, use this as start
    if (distStartIdx < 0 && (col0.startsWith("kanwil") || col0.startsWith("kancab"))) {
      distStartIdx = i;
    }
  }

  // Parse Pengadaan
  const pengadaanLabelRow = pengadaanLabelIdx >= 0 ? rows[pengadaanLabelIdx] : [];
  const pengadaanTargetRow = targetIdx >= 0 ? rows[targetIdx] : [];
  const pengadaanRealRow = realisasiIdx >= 0 ? rows[realisasiIdx] : [];
  const pengadaan = [
    { name: pengadaanLabelRow[1]?.trim() || "Beras Medium", target: parseNumber(pengadaanTargetRow[1]), realization: parseNumber(pengadaanRealRow[1]) },
    { name: pengadaanLabelRow[2]?.trim() || "GKP", target: parseNumber(pengadaanTargetRow[2]), realization: parseNumber(pengadaanRealRow[2]) },
    { name: pengadaanLabelRow[3]?.trim() || "Setara Beras", target: parseNumber(pengadaanTargetRow[3]), realization: parseNumber(pengadaanRealRow[3]) },
    { name: pengadaanLabelRow[4]?.trim() || "Jagung", target: parseNumber(pengadaanTargetRow[4]), realization: parseNumber(pengadaanRealRow[4]) },
  ];

  // Parse SPHP distribution (col A=region, B=target, C=realization)
  const sphpMap = new Map<string, { region: string; target: number; realization: number }>();
  if (distStartIdx > 0) {
    for (let i = distStartIdx; i < rows.length; i++) {
      const row = rows[i];
      if (!row) break;
      const col0 = (row[0] || "").trim();
      const label = col0.toLowerCase();
      if (label === "" || label.startsWith("beras") || label.startsWith("per tanggal")) break;
      if (label.startsWith("kanwil") || label.startsWith("kancab")) {
        sphpMap.set(label, {
          region: col0,
          target: parseNumber(row[1]),
          realization: parseNumber(row[2]),
        });
      }
    }
  }
  const sphp = Array.from(sphpMap.values());

  // Parse Banpang distribution (col E=region, F=target, G=realization — 0-indexed: col4, col5, col6)
  const banpangMap = new Map<string, { region: string; target: number; realization: number }>();
  if (distStartIdx > 0) {
    for (let i = distStartIdx; i < rows.length; i++) {
      const row = rows[i];
      if (!row) break;
      const col4 = (row[4] || "").trim();
      const label = col4.toLowerCase();
      if (label === "" || label.startsWith("beras") || label.startsWith("per tanggal") || label.startsWith("aceh")) break;
      if (label.startsWith("kanwil") || label.startsWith("kancab")) {
        banpangMap.set(label, {
          region: col4,
          target: parseNumber(row[5]),
          realization: parseNumber(row[6]),
        });
      }
    }
  }
  const banpang = Array.from(banpangMap.values());

  // Parse Minyakita Distribution (col I=region, J=target, K=realization — 0-indexed: col8, col9, col10)
  const minyakitaDistMap = new Map<string, { region: string; target: number; realization: number }>();
  if (distStartIdx > 0) {
    for (let i = distStartIdx; i < rows.length; i++) {
      const row = rows[i];
      if (!row) break;
      const col8 = (row[8] || "").trim();
      const label = col8.toLowerCase();
      if (label === "" || label.startsWith("beras") || label.startsWith("per tanggal") || label.startsWith("aceh")) break;
      if (label.startsWith("kanwil") || label.startsWith("kancab")) {
        minyakitaDistMap.set(label, {
          region: col8,
          target: parseNumber(row[9]),
          realization: parseNumber(row[10]),
        });
      }
    }
  }
  const distMinyakita = Array.from(minyakitaDistMap.values());

  // Parse Pengadaan GKP & Olah Distribution
  const pengadaanGkpMap = new Map<string, { region: string; target: number; realization: number }>();
  const pengadaanOlahMap = new Map<string, { region: string; target: number; realization: number }>();
  let gkpStartIdx = -1;
  let hasOlah = false;
  
  for (let i = rows.length - 1; i >= 0; i--) {
    const col1 = (rows[i]?.[1] || "").trim().toLowerCase();
    const col0 = (rows[i]?.[0] || "").trim().toLowerCase();
    if (col1.includes("realisasi") && col0 === "") {
      gkpStartIdx = i + 1;
      const col2 = (rows[i]?.[2] || "").trim().toLowerCase();
      if (col2.includes("olah")) {
        hasOlah = true;
      }
      break;
    }
  }

  if (gkpStartIdx > 0) {
    for (let i = gkpStartIdx; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;
      const col0 = (row[0] || "").trim();
      const label = col0.toLowerCase();
      if (label === "") continue;
      if (label.startsWith("kanwil") || label.startsWith("kancab")) {
        pengadaanGkpMap.set(label, {
          region: col0,
          target: 0,
          realization: parseNumber(row[1]),
        });
        if (hasOlah) {
          pengadaanOlahMap.set(label, {
            region: col0,
            target: 0,
            realization: parseNumber(row[2]),
          });
        }
      }
    }
  }
  const pengadaanGkp = Array.from(pengadaanGkpMap.values());
  const pengadaanOlah = Array.from(pengadaanOlahMap.values());

  // Parse IHSG data — dynamically find "beras medium" row
  const ihsg: IHSGData = { entries: [], date: "", hetMedium: 0, hetPremium: 0, hetSphp: 0, hetMinyakita: 0 };
  
  let mediumRowIdx = -1;
  let sphpRowIdx = -1;
  let minyakitaRowIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const col0 = (rows[i]?.[0] || "").trim().toLowerCase();
    if (col0 === "beras medium") mediumRowIdx = i;
    if (col0 === "beras sphp") sphpRowIdx = i;
    if (col0 === "minyakita") minyakitaRowIdx = i;
    if (col0.startsWith("per tanggal") && ihsg.date === "") {
      ihsg.date = rows[i][1]?.trim() || "";
    }
  }

  if (mediumRowIdx >= 0) {
    const mediumRow = rows[mediumRowIdx] || [];
    const premiumRow = rows[mediumRowIdx + 1] || [];
    const sphpRow = sphpRowIdx >= 0 ? rows[sphpRowIdx] : [];
    const minyakitaRow = minyakitaRowIdx >= 0 ? rows[minyakitaRowIdx] : [];

    // Use static city names that match the Aceh region IHSG reporting
    const ihsgCities = [
      "Banda Aceh", "Lhokseumawe", "Meulaboh", 
      "Aceh Tengah", "Aceh Tamiang"
    ];

    for (let i = 0; i < ihsgCities.length; i++) {
      const medVal = parseNumber(mediumRow[i + 1] || "0");
      const premVal = parseNumber(premiumRow[i + 1] || "0");
      const sphpVal = parseNumber(sphpRow[i + 1] || "0");
      const minyakitaVal = parseNumber(minyakitaRow[i + 1] || "0");
      if (medVal > 0 || premVal > 0 || sphpVal > 0 || minyakitaVal > 0) {
        ihsg.entries.push({
          city: ihsgCities[i],
          medium: medVal,
          premium: premVal,
          sphp: sphpVal,
          minyakita: minyakitaVal,
        });
      }
    }

    ihsg.hetMedium = parseNumber(mediumRow[6] || "0");
    ihsg.hetPremium = parseNumber(premiumRow[6] || "0");
    ihsg.hetSphp = parseNumber(sphpRow[6] || "0");
    ihsg.hetMinyakita = parseNumber(minyakitaRow[6] || "0");
  }

  return {
    title: "Ringkasan Operasional Kanwil Aceh",
    stockDate,
    priceHistory,
    stock,
    latestMedium,
    latestPremium,
    latestMinyakGoreng,
    pengadaan,
    sphp,
    banpang,
    distMinyakita,
    pengadaanGkp,
    pengadaanOlah,
    ihsg,
  };
}
