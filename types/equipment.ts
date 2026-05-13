export type EquipmentStatus =
  | "active"
  | "maintenance"
  | "inactive"
  | "inspection";

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
  area?: string;
}

export interface Manufacturer {
  country: string;
  brand: string;
  model: string;
  produceYear: number | null;
}

export interface Equipment {
  _id?: string;

  no: number;

  equipmentName: string;
  equipmentCode: string;

  equipmentGroup: EquipmentGroup;

  organization: Organization;

  manufacturer: Manufacturer;

  specification?: string;

  installationLocation?: string;

  note?: string;

  status: EquipmentStatus;

  createdAt?: Date;
  updatedAt?: Date;
}
