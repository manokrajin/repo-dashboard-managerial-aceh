import Papa from "papaparse";
import type { DashboardData, PriceEntry, StockItem, IHSGData, IHSGEntry } from "./types";

const SPREADSHEET_ID = "1_D6vhKTplYp8uACht3qJm2aVeDtNhvL6kEDylWOCVEo";
const SHEET_NAME = "data_web";

function getCsvUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
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

const STOCK_CONFIG: Array<{
  name: string;
  colIndex: number;
  unit: string;
  icon: string;
}> = [
  { name: "Beras PSO", colIndex: 1, unit: "Ton", icon: "🌾" },
  { name: "Beras Komersial", colIndex: 2, unit: "Ton", icon: "🍚" },
  { name: "Setara Beras", colIndex: 3, unit: "Ton", icon: "⚖️" },
  { name: "Jagung Pakan Ternak", colIndex: 4, unit: "Ton", icon: "🌽" },
  { name: "Gula Pasir", colIndex: 5, unit: "Ton", icon: "🧂" },
  { name: "Minyak Goreng", colIndex: 6, unit: "L", icon: "🫗" },
  { name: "Beras SPHP @5Kg", colIndex: 7, unit: "Ton", icon: "📦" },
  { name: "Beras BANPANG @10Kg", colIndex: 8, unit: "Ton", icon: "📦" },
  { name: "Kemasan SPHP", colIndex: 9, unit: "Lbr", icon: "🏷️" },
  { name: "Kemasan BANPANG", colIndex: 10, unit: "Lbr", icon: "🏷️" },
  {
    name: "Space Gudang Tersedia (real)",
    colIndex: -1,
    unit: "T",
    icon: "🏭",
  },
];

export async function fetchSheetData(): Promise<DashboardData> {
  const url = getCsvUrl();
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
  }

  const csvText = await response.text();
  const parsed = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = parsed.data;
  if (rows.length < 11) {
    throw new Error("Spreadsheet is missing required rows");
  }

  // Parse price history (rows 1 to 7)
  const priceHistory: PriceEntry[] = [];
  for (let i = 1; i <= 7; i++) {
    const row = rows[i];
    if (row && row[0] && row[1]) {
      priceHistory.push({
        date: row[0].trim(),
        medium: parseNumber(row[1]),
        premium: parseNumber(row[2]),
        minyakGoreng: parseNumber(row[3]),
      });
    }
  }

  // Parse stock data (row index 10)
  const stockRow = rows[10] || [];
  const stockDate = stockRow[0]?.trim() || new Date().toLocaleDateString("id-ID");

  const stock: StockItem[] = STOCK_CONFIG.map((config) => {
    if (config.colIndex === -1) {
      return {
        name: config.name,
        value: "-",
        unit: config.unit,
        icon: config.icon,
      };
    }
    const rawVal = stockRow[config.colIndex] || "0";
    return {
      name: config.name,
      value: formatValue(parseNumber(rawVal)),
      unit: config.unit,
      icon: config.icon,
    };
  });

  const lastPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1] : null;
  const latestMedium = lastPrice ? lastPrice.medium : 0;
  const latestPremium = lastPrice ? lastPrice.premium : 0;
  const latestMinyakGoreng = lastPrice ? lastPrice.minyakGoreng : 0;

  // Parse Pengadaan (target: row 12, realisasi: row 13)
  // Read names from header row (row 0) for cols 1-3, and label row (row 11) for col 4
  const pengadaanLabelRow = rows[11] || [];
  const pengadaanTargetRow = rows[12] || [];
  const pengadaanRealRow = rows[13] || [];
  const pengadaan = [
    { name: pengadaanLabelRow[1]?.trim() || "Beras Medium", target: parseNumber(pengadaanTargetRow[1]), realization: parseNumber(pengadaanRealRow[1]) },
    { name: pengadaanLabelRow[2]?.trim() || "GKP", target: parseNumber(pengadaanTargetRow[2]), realization: parseNumber(pengadaanRealRow[2]) },
    { name: pengadaanLabelRow[3]?.trim() || "Setara Beras", target: parseNumber(pengadaanTargetRow[3]), realization: parseNumber(pengadaanRealRow[3]) },
    { name: pengadaanLabelRow[4]?.trim() || "Jagung", target: parseNumber(pengadaanTargetRow[4]), realization: parseNumber(pengadaanRealRow[4]) },
  ];

  // Parse SPHP (col A=region, B=target, C=realization)
  // Only include rows where col A looks like a distribution region (Kanwil/Kancab)
  // Deduplicate by region name (last occurrence wins)
  const sphpMap = new Map<string, { region: string; target: number; realization: number }>();
  for (let i = 14; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) break;
    const label = row[0].trim().toLowerCase();
    // Stop when we hit non-distribution rows
    if (label === "" || label.startsWith("beras") || label.startsWith("per tanggal")) break;
    sphpMap.set(label, {
      region: row[0].trim(),
      target: parseNumber(row[1]),
      realization: parseNumber(row[2]),
    });
  }
  const sphp = Array.from(sphpMap.values());

  // Parse Banpang (col E=region, F=target, G=realization — 0-indexed: col4, col5, col6)
  // Deduplicate by region name (last occurrence wins)
  const banpangMap = new Map<string, { region: string; target: number; realization: number }>();
  for (let i = 14; i < rows.length; i++) {
    const row = rows[i];
    if (!row) break;
    const label = (row[4] || "").trim().toLowerCase();
    // Stop when we hit non-distribution rows
    if (label === "" || label.startsWith("beras") || label.startsWith("per tanggal") || label.startsWith("aceh")) break;
    if (row[4] && row[4].trim() !== "") {
      banpangMap.set(label, {
        region: row[4].trim(),
        target: parseNumber(row[5]),
        realization: parseNumber(row[6]),
      });
    }
  }
  const banpang = Array.from(banpangMap.values());

  // Parse IHSG data — dynamically find "beras medium" row
  const ihsg: IHSGData = { entries: [], date: "", hetMedium: 0, hetPremium: 0 };
  
  let mediumRowIdx = -1;
  for (let i = 14; i < rows.length; i++) {
    if (rows[i] && rows[i][0]?.trim().toLowerCase() === "beras medium") {
      mediumRowIdx = i;
      break;
    }
  }

  if (mediumRowIdx >= 0) {
    const mediumRow = rows[mediumRowIdx] || [];
    const premiumRow = rows[mediumRowIdx + 1] || [];
    const dateRow = rows[mediumRowIdx + 2] || [];

    // Use static city names that match the Aceh region IHSG reporting
    const ihsgCities = [
      "Banda Aceh", "Lhokseumawe", "Meulaboh", 
      "Aceh Tengah", "Aceh Tamiang"
    ];

    for (let i = 0; i < ihsgCities.length; i++) {
      const medVal = parseNumber(mediumRow[i + 1] || "0");
      const premVal = parseNumber(premiumRow[i + 1] || "0");
      if (medVal > 0 || premVal > 0) {
        ihsg.entries.push({
          city: ihsgCities[i],
          medium: medVal,
          premium: premVal,
        });
      }
    }

    ihsg.hetMedium = parseNumber(mediumRow[6] || "0");
    ihsg.hetPremium = parseNumber(premiumRow[6] || "0");

    if (dateRow[0]?.trim().toLowerCase().startsWith("per tanggal")) {
      ihsg.date = dateRow[1]?.trim() || "";
    }
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
    ihsg,
  };
}
