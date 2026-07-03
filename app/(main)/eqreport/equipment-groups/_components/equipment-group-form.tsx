"use client";

import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  EquipmentGroupFormSchema,
  equipmentGroupFormDefaultValues,
  type EquipmentGroupFormValues,
} from "@/lib/schemas/equipment-group.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EquipmentGroupFormProps {
  /** pre-fill values when editing */
  defaultValues?: Partial<EquipmentGroupFormValues>;
  /** form id so the submit button can live outside the form element */
  formId: string;
  onSubmit: (values: EquipmentGroupFormValues) => Promise<void>;
}

export function EquipmentGroupForm({
  defaultValues,
  formId,
  onSubmit,
}: EquipmentGroupFormProps) {
  const form = useForm<EquipmentGroupFormValues>({
    resolver: zodResolver(EquipmentGroupFormSchema),
    defaultValues: { ...equipmentGroupFormDefaultValues, ...defaultValues },
    mode: "onBlur",
  });

  const { isSubmitting } = useFormState({ control: form.control });

  // Re-sync when parent swaps defaultValues (e.g. opening edit for different row)
  useEffect(() => {
    form.reset({ ...equipmentGroupFormDefaultValues, ...defaultValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValues)]);

  const FIELDS = [
    { name: "level1" as const, label: "Nhóm thiết bị", placeholder: "VD: Thiết bị nâng hạ" },
    { name: "level2" as const, label: "Loại thiết bị", placeholder: "VD: Cầu trục" },
    { name: "level3" as const, label: "Cấu hình", placeholder: "VD: Dầm đơn" },
    { name: "level4" as const, label: "Công suất", placeholder: "VD: 5T" },
  ] as const;

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {FIELDS.map(({ name, label, placeholder }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {label}
                  <span className="text-destructive ml-0.5">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={placeholder}
                    autoComplete="off"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {/* Full path preview */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            fontSize: "12px",
            color: "var(--color-text-muted)",
            fontFamily: "monospace",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Full path:{" "}
          </span>
          {[
            form.watch("level1"),
            form.watch("level2"),
            form.watch("level3"),
            form.watch("level4"),
          ]
            .filter(Boolean)
            .join(" > ") || "—"}
        </div>
      </form>
    </Form>
  );
}
