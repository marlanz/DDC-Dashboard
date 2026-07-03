"use client";

import { useCallback, useState } from "react";
import { Loader2, Layers } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EquipmentGroupForm } from "./equipment-group-form";
import type { EquipmentGroupRecord } from "@/types/equipment-group";
import type { EquipmentGroupFormValues } from "@/lib/schemas/equipment-group.schema";
import type {
  ApiErrorResponse,
  CreateEquipmentGroupResponse,
  UpdateEquipmentGroupResponse,
} from "@/lib/equipment-groups/api-types";

type DialogMode = "create" | "edit";

interface EquipmentGroupDialogProps {
  mode: DialogMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Populated when mode === 'edit' */
  editTarget?: EquipmentGroupRecord | null;
  /** Called after a successful mutation so the parent can refetch / invalidate */
  onSuccess?: () => void;
}

const FORM_ID = "equipment-group-form";

export function EquipmentGroupDialog({
  mode,
  open,
  onOpenChange,
  editTarget,
  onSuccess,
}: EquipmentGroupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (values: EquipmentGroupFormValues) => {
      setIsSubmitting(true);
      try {
        const isEdit = mode === "edit" && editTarget;
        const url = isEdit
          ? `/api/equipment-groups/${editTarget._id}`
          : "/api/equipment-groups";
        const method = isEdit ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const json = (await res.json()) as
          | CreateEquipmentGroupResponse
          | UpdateEquipmentGroupResponse
          | ApiErrorResponse;

        if (!res.ok) {
          const err = json as ApiErrorResponse;
          toast.error(err.error ?? "Có lỗi xảy ra. Vui lòng thử lại.");
          return;
        }

        toast.success(
          mode === "create"
            ? "Tạo nhóm thiết bị thành công."
            : "Cập nhật nhóm thiết bị thành công.",
        );
        onOpenChange(false);
        onSuccess?.();
      } catch {
        toast.error("Network error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, editTarget, onOpenChange, onSuccess],
  );

  const title =
    mode === "create" ? "Tạo nhóm thiết bị mới" : "Chỉnh sửa nhóm thiết bị";

  const description =
    mode === "create"
      ? "Điền đầy đủ 4 cấp bậc. Tổ hợp phải là duy nhất trong hệ thống."
      : "Cập nhật thông tin nhóm thiết bị.";

  const defaultValues = editTarget
    ? {
        level1: editTarget.level1,
        level2: editTarget.level2,
        level3: editTarget.level3,
        level4: editTarget.level4,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        style={{ maxHeight: "min(90vh, 640px)" }}
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(233,34,39,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Layers size={17} style={{ color: "rgb(233,34,39)" }} />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-0.5">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 overscroll-contain">
          <EquipmentGroupForm
            formId={FORM_ID}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Footer */}
        <DialogFooter
          className="px-6 py-4"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Huỷ bỏ
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="min-w-32"
            style={{ background: "rgb(233,34,39)", color: "white" }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-1.5" size={14} />
                Đang lưu…
              </>
            ) : mode === "create" ? (
              "Tạo nhóm"
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
