export interface StockItem {
  name: string;
  value: string;
  unit: string;
  icon: string;
}

export interface PriceEntry {
  date: string;
  medium: number;
  premium: number;
  minyakGoreng: number;
}

export interface ProcurementItem {
  name: string;
  target: number;
  realization: number;
}

export interface DistributionItem {
  region: string;
  target: number;
  realization: number;
}

export interface IHSGEntry {
  city: string;
  medium: number;
  premium: number;
}

export interface IHSGData {
  entries: IHSGEntry[];
  date: string;
  hetMedium: number;
  hetPremium: number;
}

export interface DashboardData {
  title: string;
  stockDate: string;
  priceHistory: PriceEntry[];
  stock: StockItem[];
  latestMedium: number;
  latestPremium: number;
  latestMinyakGoreng: number;
  pengadaan: ProcurementItem[];
  sphp: DistributionItem[];
  banpang: DistributionItem[];
  ihsg: IHSGData;
}
