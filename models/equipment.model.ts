import mongoose, { Schema, model, models } from "mongoose";

const EquipmentGroupSchema = new Schema(
  {
    level1: String,
    level2: String,
    level3: String,
    level4: String,
  },
  { _id: false },
);

const OrganizationSchema = new Schema(
  {
    legalEntity: String,
    factory: String,
    workshop: String,
    layout: String,
    workCenter: String,
    area: String,
  },
  { _id: false },
);

const ManufacturerSchema = new Schema(
  {
    country: String,
    brand: String,
    model: String,
    produceYear: Number,
  },
  { _id: false },
);

const EquipmentSchema = new Schema(
  {
    no: {
      type: Number,
      required: true,
    },

    equipmentName: {
      type: String,
      required: true,
      trim: true,
    },

    equipmentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    equipmentGroup: {
      type: EquipmentGroupSchema,
      required: true,
    },

    organization: {
      type: OrganizationSchema,
      required: true,
    },

    manufacturer: {
      type: ManufacturerSchema,
      required: true,
    },

    specification: {
      type: String,
      default: "",
    },

    installationLocation: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "maintenance", "inactive", "inspection"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

export const EquipmentModel =
  models.Equipment || model("Equipment", EquipmentSchema);
