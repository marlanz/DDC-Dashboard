"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─── Form types ───────────────────────────────────────────────────────────────

interface AddEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EquipmentSchema = z.object({
  no: z.number(),

  equipmentName: z.string().trim().min(1, "Equipment name is required"),

  equipmentCode: z.string().trim().min(1, "Equipment code is required"),

  equipmentGroup: z.object({
    level1: z.string().trim().optional(),
    level2: z.string().trim().optional(),
    level3: z.string().trim().optional(),
    level4: z.string().trim().optional(),
  }),

  organization: z.object({
    legalEntity: z.string().trim().optional(),
    factory: z.string().trim().optional(),
    workshop: z.string().trim().optional(),
    layout: z.string().trim().optional(),
    workCenter: z.string().trim().optional(),
    area: z.string().trim().optional(),
  }),

  manufacturer: z.object({
    country: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    model: z.string().trim().optional(),

    produceYear: z.number().int().nonnegative().optional(),
  }),

  specification: z.string().trim().optional(),

  installationLocation: z.string().trim().optional(),

  note: z.string().trim().optional(),

  status: z.enum(["active", "inactive"]),

  createdAt: z.date().optional(),

  updatedAt: z.date().optional(),
});

type Equipment = z.infer<typeof EquipmentSchema>;

export default function AddEquipmentModal({
  open,
  onClose,
  onSuccess,
}: AddEquipmentModalProps) {
  const form = useForm<Equipment>({
    resolver: zodResolver(EquipmentSchema),

    defaultValues: {
      no: 1,

      equipmentName: "",
      equipmentCode: "",

      equipmentGroup: {
        level1: "",
        level2: "",
        level3: "",
        level4: "",
      },

      organization: {
        legalEntity: "",
        factory: "",
        workshop: "",
        layout: "",
        workCenter: "",
        area: "",
      },

      manufacturer: {
        country: "",
        brand: "",
        model: "",
        produceYear: undefined,
      },

      specification: "",
      installationLocation: "",
      note: "",

      status: "active",
    },
  });

  if (!open) return null;
  return <></>;
}
