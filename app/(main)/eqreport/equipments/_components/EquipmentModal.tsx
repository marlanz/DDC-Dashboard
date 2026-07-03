"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  useForm,
  useFormState,
  type FieldPath,
  type UseFormSetError,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cpu, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  EquipmentSchema,
  equipmentFormDefaultValues,
  type EquipmentFormValues,
} from "@/lib/schemas/equipment.schema";
import type {
  ApiErrorResponse,
  CreateEquipmentSuccessResponse,
} from "@/lib/equipment/api-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CascadingGroupSelect } from "@/app/(main)/eqreport/equipment-groups/_components/cascading-group-select";
import type { EquipmentGroupSelection } from "@/types/equipment-group";
import { useEquipmentGroups } from "@/lib/equipment-groups/queries/use-equipment-groups";
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ⭐  MOCK DATA fallback while the API is not seeded yet         ║
// ║  REMOVE the next two lines once /api/equipment-groups has data  ║
// ╚══════════════════════════════════════════════════════════════════╝
import { MOCK_EQUIPMENT_GROUPS } from "@/lib/equipment-groups/mock-data"; // ⭐ DELETE when API ready

interface EquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful create — use to invalidate/refetch list data. */
  onSuccess?: () => void;
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-xs font-semibold tracking-wide text-primary uppercase">
        {title}
      </legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function applyServerFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
  setError: UseFormSetError<EquipmentFormValues>,
) {
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0];
    if (!message) continue;
    setError(key as FieldPath<EquipmentFormValues>, { message });
  }
}

/**
 * Client-only create modal. Data mutation goes through POST /api/equipments;
 * the route delegates to shared server-side createEquipment() with Zod validation.
 */
export default function EquipmentModal({
  open,
  onOpenChange,
  onSuccess,
}: EquipmentModalProps) {
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(EquipmentSchema),
    defaultValues: equipmentFormDefaultValues,
    mode: "onSubmit",
  });

  const { isSubmitting, errors, isValid } = useFormState({
    control: form.control,
  });

  // Fetch equipment groups for the cascading select
  const { data: remoteGroups } = useEquipmentGroups();
  // ⭐ Fallback to mock data while API returns nothing; remove MOCK_EQUIPMENT_GROUPS once API is seeded
  const equipmentGroups =
    remoteGroups && remoteGroups.length > 0
      ? remoteGroups
      : MOCK_EQUIPMENT_GROUPS; // ⭐ simplify to: const equipmentGroups = remoteGroups ?? [];

  // Current cascading-select value mirrored from RHF
  const groupValue = {
    level1: form.watch("equipmentGroup.level1") ?? "",
    level2: form.watch("equipmentGroup.level2") ?? "",
    level3: form.watch("equipmentGroup.level3") ?? "",
    level4: form.watch("equipmentGroup.level4") ?? "",
  };

  useEffect(() => {
    if (open) {
      form.reset(equipmentFormDefaultValues);
    }
  }, [open, form]);

  const onSubmit = useCallback(
    async (values: EquipmentFormValues) => {
      try {
        const res = await fetch("/api/equipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const json = (await res.json()) as
          | CreateEquipmentSuccessResponse
          | ApiErrorResponse;

        if (!res.ok) {
          const err = json as ApiErrorResponse;
          if (err.fieldErrors) {
            applyServerFieldErrors(err.fieldErrors, form.setError);
          }
          toast.error(err.error ?? "Failed to create equipment.");
          return;
        }

        toast.success("Equipment created successfully.");
        form.reset(equipmentFormDefaultValues);
        onOpenChange(false);
        onSuccess?.();
      } catch {
        toast.error("Network error. Please try again.");
      }
    },
    [form, onOpenChange, onSuccess],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,800px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg  text-primary"
              style={{
                backgroundColor: "rgba(233, 34, 39, 0.1)",
              }}
            >
              <Cpu
                className="size-4"
                aria-hidden
                style={{
                  color: "rgb(233, 34, 39)",
                }}
              />
            </div>
            <div>
              <DialogTitle>Tạo thiết bị cơ khí mới</DialogTitle>
              <DialogDescription>
                Create a new equipment record. Fields marked with * are
                required.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
          <Form {...form}>
            <form
              id="equipment-create-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              noValidate
            >
              <div className="space-y-3">
                <FormSection title="Thông tin cơ bản">
                  <FormField
                    control={form.control}
                    name="equipmentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tên MMTB
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. CNC Milling Machine"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        {/* <FormMessage /> */}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipmentCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mã MMTB
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. EQ-001"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormSection>

                {/* ✅ Shared error message */}
                {(errors.equipmentName || errors.equipmentCode) && (
                  <p className="text-sm text-destructive">
                    Tên MMTB/Mã MMTB còn thiếu. Hãy điền đầy đủ
                  </p>
                )}
              </div>

              <FormSection title="Nhóm MMTB">
                <div className="sm:col-span-2">
                  <CascadingGroupSelect
                    groups={equipmentGroups}
                    value={groupValue}
                    onChange={(sel: EquipmentGroupSelection) => {
                      form.setValue("equipmentGroup.level1", sel.level1, {
                        shouldValidate: true,
                      });
                      form.setValue("equipmentGroup.level2", sel.level2, {
                        shouldValidate: true,
                      });
                      form.setValue("equipmentGroup.level3", sel.level3, {
                        shouldValidate: true,
                      });
                      form.setValue("equipmentGroup.level4", sel.level4, {
                        shouldValidate: true,
                      });
                    }}
                    disabled={isSubmitting}
                  />
                  {equipmentGroups.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Chưa có nhóm thiết bị nào. Hãy tạo nhóm tại trang{" "}
                      <a
                        href="/equipment-groups"
                        className="underline text-primary"
                      >
                        Nhóm thiết bị
                      </a>{" "}
                      trước.
                    </p>
                  )}
                </div>
              </FormSection>

              <FormSection title="THÔNG TIN TỔ CHỨC">
                <FormField
                  control={form.control}
                  name="organization.factory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhà máy</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization.workshop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xưởng/Layout</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <FormSection title="Nhóm nhà sản xuất">
                <FormField
                  control={form.control}
                  name="manufacturer.brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hãng sản xuất</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manufacturer.model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <FormSection title="Các thông tin khác">
                <FormField
                  control={form.control}
                  name="specification"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Đặc tính kỹ thuật</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Technical specifications…"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="installationLocation"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Vị trí lắp đặt</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional notes…"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            form="equipment-create-form"
            disabled={isSubmitting}
            className="min-w-35 bg-brand"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Đang lưu
              </>
            ) : (
              "Lưu thiết bị"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
