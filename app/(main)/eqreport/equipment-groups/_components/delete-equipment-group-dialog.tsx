"use client";

import { useState } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { EquipmentGroupRecord } from "@/types/equipment-group";

interface DeleteEquipmentGroupDialogProps {
  group: EquipmentGroupRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (group: EquipmentGroupRecord) => Promise<void>;
}

export function DeleteEquipmentGroupDialog({
  group,
  open,
  onOpenChange,
  onConfirm,
}: DeleteEquipmentGroupDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!group) return;
    setIsDeleting(true);
    try {
      await onConfirm(group);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(239,68,68,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} style={{ color: "#ef4444" }} />
            </div>
            <AlertDialogTitle>Xoá nhóm thiết bị</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Hành động này không thể hoàn tác.</p>
              {group && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: "monospace",
                    color: "var(--color-text-primary)",
                    wordBreak: "break-all",
                  }}
                >
                  {group.fullPath}
                </div>
              )}
              <p>
                Thiết bị đã được gán nhóm này sẽ không bị ảnh hưởng, nhưng bạn
                sẽ không thể chọn nhóm này khi tạo thiết bị mới.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDeleting}
            style={{
              background: "#ef4444",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Đang xoá…
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Xoá nhóm
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
