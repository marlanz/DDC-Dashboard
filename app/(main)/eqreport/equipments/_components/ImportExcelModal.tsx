"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

import { useGetSheetsMutation } from "@/lib/hooks/useSheets";

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastState {
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const c = {
    success: { border: "rgba(34,197,94,0.3)", icon: "#22c55e" },
    error: { border: "rgba(239,68,68,0.3)", icon: "#ef4444" },
    info: { border: "rgba(59,130,246,0.3)", icon: "#3b82f6" },
  }[toast.type];

  const Icon =
    toast.type === "success"
      ? CheckCircle2
      : toast.type === "error"
        ? XCircle
        : AlertTriangle;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "14px 16px",
        background: "var(--color-surface)",
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${c.icon}`,
        borderRadius: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        maxWidth: 360,
        animation: "slideInToast 0.25s ease",
      }}
    >
      <Icon size={18} style={{ color: c.icon, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            marginBottom: 2,
          }}
        >
          {toast.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            whiteSpace: "pre-line",
          }}
        >
          {toast.message}
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-muted)",
          padding: 0,
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Done summary ─────────────────────────────────────────────────────────────

interface UploadResult {
  success: boolean;
  inserted: number;
  total: number;
  error?: string;
}

function DoneSummary({ result }: { result: UploadResult }) {
  return (
    <div
      style={{
        padding: 20,
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <CheckCircle2 size={20} style={{ color: "#22c55e" }} />
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          Import Complete
        </span>
      </div>
      {(
        [
          {
            label: "Records inserted",
            value: result.inserted,
            color: "#22c55e",
          },
          {
            label: "Skipped (duplicates / invalid)",
            value: result.total - result.inserted,
            color: "#eab308",
          },
        ] as const
      ).map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
            padding: "6px 0",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
          <span style={{ fontWeight: 700, color, fontSize: 15 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

type ModalStep = "idle" | "ready" | "uploading" | "done";

type SheetInfo = {
  index: number;
  sheetName: string;
};

interface ImportExcelModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportExcelModal({
  open,
  onClose,
  onSuccess,
}: ImportExcelModalProps) {
  const [step, setStep] = useState<ModalStep>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fatalError, setFatalError] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  // Remove useSheets, use mutation instead
  const [allSheets, setAllSheets] = useState<SheetInfo[]>([]);
  const getSheetsMutation = useGetSheetsMutation();

  const closeModal = () => {
    onClose();
    setStep("idle");
    setDragOver(false);
    setFileName("");
    setFatalError("");
    setResult(null);
    setAllSheets([]);
    setSelectedSheetIndex(null);
    fileRef.current = null;
  };

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const showToast = useCallback((t: ToastState) => setToast(t), []);

  // ── File handling ──────────────────────────────────────────────────────────

  const processFile = useCallback(
    async (file: File) => {
      const name = file.name.toLowerCase();
      if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
        setFatalError("Please select a valid Excel file (.xlsx or .xls).");
        return;
      }
      setFatalError("");
      setFileName(file.name);
      fileRef.current = file;
      // Get sheet names from file
      try {
        setAllSheets([]);
        const sheets = await getSheetsMutation.mutateAsync(file);
        const formattedSheets = sheets.map((sheet, index) => ({
          index,
          sheetName: sheet,
        }));
        setAllSheets(formattedSheets);
      } catch (err) {
        setFatalError(
          err instanceof Error ? err.message : "Failed to get sheets",
        );
        setAllSheets([]);
      }
      setStep("ready");
    },
    [getSheetsMutation],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleImport = useCallback(async () => {
    if (!fileRef.current) return;
    if (selectedSheetIndex === null) {
      setFatalError("Please select a sheet.");
      return;
    }
    setStep("uploading");
    setFatalError("");
    try {
      const formData = new FormData();
      formData.append("file", fileRef.current);
      formData.append("sheetIndex", String(selectedSheetIndex));

      const res = await fetch("/api/equipments/import-excel", {
        method: "POST",
        body: formData,
      });

      const data: UploadResult = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed.");
      }

      setResult(data);
      setStep("done");

      const skipped = data.total - data.inserted;
      const lines = [
        `✓ Inserted ${data.inserted} records`,
        skipped > 0 ? `⊘ Skipped ${skipped} rows` : "",
      ]
        .filter(Boolean)
        .join("\n");

      showToast({
        type: data.inserted > 0 ? "success" : "info",
        title: "Import complete",
        message: lines,
      });

      // if (data.inserted > 0) onSuccess();
    } catch (err) {
      showToast({
        type: "error",
        title: "Import failed",
        message: err instanceof Error ? err.message : "Unknown error.",
      });
      setStep("ready");
    }
  }, [onSuccess, showToast, selectedSheetIndex]);

  if (!open)
    return toast ? (
      <Toast toast={toast} onClose={() => setToast(null)} />
    ) : null;

  const isLoading = step === "uploading";
  const canSubmit = step === "ready";
  const isDone = step === "done";

  // console.log(selectedSheets);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 1000,
          backdropFilter: "blur(3px)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Import Excel"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 1001,
          width: "min(520px, 95vw)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 14,
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "scaleIn 0.2s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "18px 20px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "rgba(34,197,94,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet size={18} style={{ color: "#22c55e" }} />
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              Import Excel
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 1,
              }}
            >
              Upload an .xlsx or .xls file to bulk-import equipment
            </div>
          </div>
          <button
            id="import-excel-modal-close"
            onClick={() => closeModal()}
            aria-label="Close"
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              padding: 4,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Drop zone — hide after done */}
          {!isDone && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#22c55e" : fileName ? "rgba(34,197,94,0.5)" : "var(--color-border)"}`,
                borderRadius: 10,
                padding: "32px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                background: dragOver
                  ? "rgba(34,197,94,0.04)"
                  : fileName
                    ? "rgba(34,197,94,0.03)"
                    : "var(--color-surface-2)",
                transition: "border-color 0.15s, background 0.15s",
                textAlign: "center",
              }}
            >
              <input
                ref={fileInputRef}
                id="import-excel-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {isLoading ? (
                <Loader2
                  size={32}
                  style={{
                    color: "#22c55e",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <FileSpreadsheet
                  size={32}
                  style={{
                    color: dragOver
                      ? "#22c55e"
                      : fileName
                        ? "#22c55e"
                        : "var(--color-text-muted)",
                  }}
                />
              )}
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {isLoading
                    ? "Uploading…"
                    : fileName
                      ? fileName
                      : "Drop your Excel file here"}
                </div>
                {!isLoading && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-muted)",
                      marginTop: 4,
                    }}
                  >
                    {fileName
                      ? "Click to choose a different file"
                      : "or click to browse · .xlsx, .xls"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sheet selection UI */}
          {allSheets.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Select sheet:
              </div>
              <select
                value={selectedSheetIndex ?? ""}
                onChange={(e) => setSelectedSheetIndex(Number(e.target.value))}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  fontSize: 13,
                }}
              >
                <option value="">-- Choose a sheet --</option>
                {allSheets.map((sheet) => (
                  <option key={sheet.index} value={sheet.index}>
                    {sheet.sheetName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Column hint */}
          {!isDone && (
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "8px 12px",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "var(--color-text-secondary)" }}>
                Expected columns:
              </strong>{" "}
              no, equipmentName, equipmentCode, groupLevel1–4, legalEntity,
              factory, workshop, layout, workCenter, area, country, brand,
              model, produceYear, specification, installationLocation, note
            </div>
          )}

          {/* Fatal error */}
          {fatalError && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: "10px 12px",
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                fontSize: 12,
                color: "#ef4444",
              }}
            >
              <XCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              {fatalError}
            </div>
          )}

          {/* Done */}
          {isDone && result && <DoneSummary result={result} />}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            id="import-excel-cancel-btn"
            onClick={() => closeModal()}
            style={{
              height: 34,
              padding: "0 16px",
              border: "1px solid var(--color-border)",
              borderRadius: 7,
              background: "var(--color-surface)",
              color: "var(--color-text-secondary)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {isDone ? "Close" : "Cancel"}
          </button>

          {!isDone && (
            <button
              id="import-excel-submit-btn"
              onClick={handleImport}
              disabled={!canSubmit || isLoading}
              style={{
                height: 34,
                padding: "0 20px",
                border: "none",
                borderRadius: 7,
                background:
                  canSubmit && !isLoading ? "#22c55e" : "rgba(34,197,94,0.4)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: canSubmit && !isLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.15s",
              }}
            >
              {isLoading && (
                <Loader2
                  size={13}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              )}
              {isLoading ? "Uploading…" : "Import Excel"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn      { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn     { from { opacity:0; transform:translate(-50%,-50%) scale(0.96) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
        @keyframes spin        { to { transform:rotate(360deg) } }
        @keyframes slideInToast{ from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}
