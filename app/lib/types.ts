export interface StockItem {
  name: string;
  value: string;
  unit: string;
  icon: string;
  imageUrl?: string;
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
  sphp: number;
  minyakita: number;
}

export interface IHSGData {
  entries: IHSGEntry[];
  date: string;
  hetMedium: number;
  hetPremium: number;
  hetSphp: number;
  hetMinyakita: number;
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
  distMinyakita: DistributionItem[];
  pengadaanGkp: DistributionItem[];
  ihsg: IHSGData;
}
