export type EquipmentStatus = "active" | "maintenance" | "inactive" | "inspection";

export interface EquipmentGroup {
  level1: string;
  level2: string;
  level3: string;
  level4: string;
}

export interface Organization {
  legalEntity: string;
  factory: string;
  workshop: string;
  layout: string;
  workCenter: string;
  area: string;
}

export interface Manufacturer {
  country: string;
  brand: string;
  model: string;
  produceYear: number;
}

export interface Equipment {
  no: number;
  equipmentName: string;
  equipmentCode: string;
  equipmentGroup: EquipmentGroup;
  organization: Organization;
  manufacturer: Manufacturer;
  specification: string;
  installationLocation: string;
  note: string;
  status?: EquipmentStatus;
}

export interface EquipmentFilters {
  factories: string[];
  workshops: string[];
  workCenters: string[];
  layouts: string[];
  group1s: string[];
  group2s: string[];
  brands: string[];
  countries: string[];
  produceYears: string[];
  statuses: string[];
}
