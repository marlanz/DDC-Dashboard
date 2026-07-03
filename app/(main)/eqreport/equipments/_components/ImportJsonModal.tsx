"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Upload,
  FileJson,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
  ClipboardPaste,
} from "lucide-react";
import { parseJsonText, sanitizeBatch } from "@/lib/utils/equipmentSanitizer";
import type { ParseError, SanitizedEquipment } from "@/lib/utils/equipmentSanitizer";
import type { ImportSummary } from "@/app/api/equipments/import-json/route";

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
    error:   { border: "rgba(239,68,68,0.3)",  icon: "#ef4444" },
    info:    { border: "rgba(59,130,246,0.3)",  icon: "#3b82f6" },
  }[toast.type];

  const Icon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? XCircle : AlertTriangle;

  return (
    <div role="alert" style={{
      position:"fixed", bottom:24, right:24, zIndex:9999,
      display:"flex", alignItems:"flex-start", gap:10,
      padding:"14px 16px",
      background:"var(--color-surface)",
      border:`1px solid ${c.border}`,
      borderLeft:`4px solid ${c.icon}`,
      borderRadius:10, boxShadow:"0 8px 32px rgba(0,0,0,0.18)",
      maxWidth:360, animation:"slideInToast 0.25s ease",
    }}>
      <Icon size={18} style={{ color: c.icon, flexShrink:0, marginTop:1 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"var(--color-text-primary)", marginBottom:2 }}>{toast.title}</div>
        <div style={{ fontSize:12, color:"var(--color-text-secondary)", whiteSpace:"pre-line" }}>{toast.message}</div>
      </div>
      <button onClick={onClose} aria-label="Dismiss" style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-muted)", padding:0, flexShrink:0 }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Shared validation-result UI ──────────────────────────────────────────────

function ValidationResult({ validCount, parseErrors }: { validCount: number; parseErrors: ParseError[] }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", gap:8 }}>
        <div style={{
          flex:1, padding:"10px 14px",
          background:"rgba(34,197,94,0.07)", border:"1px solid rgba(34,197,94,0.25)",
          borderRadius:8, display:"flex", alignItems:"center", gap:8, fontSize:13,
        }}>
          <CheckCircle2 size={15} style={{ color:"#22c55e", flexShrink:0 }} />
          <span style={{ fontWeight:600, color:"#22c55e" }}>{validCount}</span>
          <span style={{ color:"var(--color-text-secondary)" }}>valid records</span>
        </div>
        {parseErrors.length > 0 && (
          <div style={{
            flex:1, padding:"10px 14px",
            background:"rgba(234,179,8,0.07)", border:"1px solid rgba(234,179,8,0.25)",
            borderRadius:8, display:"flex", alignItems:"center", gap:8, fontSize:13,
          }}>
            <AlertTriangle size={15} style={{ color:"#eab308", flexShrink:0 }} />
            <span style={{ fontWeight:600, color:"#eab308" }}>{parseErrors.length}</span>
            <span style={{ color:"var(--color-text-secondary)" }}>will be skipped</span>
          </div>
        )}
      </div>
      {parseErrors.length > 0 && (
        <div style={{ maxHeight:130, overflowY:"auto", border:"1px solid var(--color-border)", borderRadius:8, fontSize:11 }}>
          {parseErrors.map(err => (
            <div key={err.index} style={{
              padding:"7px 12px", borderBottom:"1px solid var(--color-border)",
              display:"flex", gap:8, color:"var(--color-text-secondary)",
            }}>
              <span style={{ color:"var(--color-text-muted)", flexShrink:0 }}>Row {err.index + 1}</span>
              {err.equipmentCode && <span style={{ color:"var(--color-text-primary)", fontWeight:500, flexShrink:0 }}>[{err.equipmentCode}]</span>}
              <span>{err.messages.join("; ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Done summary ─────────────────────────────────────────────────────────────

function DoneSummary({ summary }: { summary: ImportSummary }) {
  return (
    <div style={{
      padding:20, background:"var(--color-surface-2)",
      border:"1px solid var(--color-border)", borderRadius:10,
      display:"flex", flexDirection:"column", gap:12,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
        <CheckCircle2 size={20} style={{ color:"#22c55e" }} />
        <span style={{ fontSize:15, fontWeight:700, color:"var(--color-text-primary)" }}>Import Complete</span>
      </div>
      {([
        { label:"Records inserted",   value: summary.inserted, color:"#22c55e" },
        { label:"Duplicates skipped", value: summary.skipped,  color:"#eab308" },
        { label:"Invalid records",    value: summary.errors,   color:"#ef4444" },
      ] as const).map(({ label, value, color }) => (
        <div key={label} style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          fontSize:13, padding:"6px 0", borderBottom:"1px solid var(--color-border)",
        }}>
          <span style={{ color:"var(--color-text-secondary)" }}>{label}</span>
          <span style={{ fontWeight:700, color, fontSize:15 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

type InputTab = "file" | "text";
type ModalStep = "idle" | "validating" | "ready" | "uploading" | "done";

interface ImportJsonModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportJsonModal({ open, onClose, onSuccess }: ImportJsonModalProps) {
  const [tab, setTab] = useState<InputTab>("file");
  const [step, setStep] = useState<ModalStep>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [validCount, setValidCount] = useState(0);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [fatalError, setFatalError] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const parsedRef = useRef<SanitizedEquipment[]>([]);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setTab("file"); setStep("idle"); setDragOver(false);
      setFileName(""); setPasteText(""); setValidCount(0);
      setParseErrors([]); setSummary(null); setFatalError("");
      parsedRef.current = [];
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const showToast = useCallback((t: ToastState) => setToast(t), []);

  // Reset validation state when switching tabs
  const switchTab = useCallback((t: InputTab) => {
    setTab(t);
    setStep("idle");
    setFatalError("");
    setParseErrors([]);
    setValidCount(0);
    parsedRef.current = [];
  }, []);

  // ── Core validation ────────────────────────────────────────────────────────

  const runValidation = useCallback((text: string, name = "") => {
    setStep("validating");
    setFatalError("");
    setParseErrors([]);
    if (name) setFileName(name);

    try {
      const raw = parseJsonText(text);
      const { valid, errors } = sanitizeBatch(raw);
      parsedRef.current = valid;
      setValidCount(valid.length);
      setParseErrors(errors);
      setStep("ready");
    } catch (err) {
      setFatalError(err instanceof Error ? err.message : "Failed to parse JSON.");
      setStep("idle");
    }
  }, []);

  // ── File handling ──────────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".json")) {
      setFatalError("Please select a valid .json file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result;
      if (typeof text !== "string") { setFatalError("Could not read file."); return; }
      runValidation(text, file.name);
    };
    reader.onerror = () => setFatalError("Failed to read the file.");
    reader.readAsText(file);
  }, [runValidation]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  // ── Paste / text handling ──────────────────────────────────────────────────

  const handleValidateText = useCallback(() => {
    const trimmed = pasteText.trim();
    if (!trimmed) { setFatalError("Please paste some JSON first."); return; }
    runValidation(trimmed);
  }, [pasteText, runValidation]);

  // ── Import ─────────────────────────────────────────────────────────────────

  const handleImport = useCallback(async () => {
    if (parsedRef.current.length === 0) return;
    setStep("uploading");
    try {
      const res = await fetch("/api/equipments/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedRef.current),
      });
      const result: ImportSummary = await res.json();
      if (!res.ok && !("inserted" in result)) throw new Error((result as { error?: string }).error ?? "Import failed.");

      setSummary(result);
      setStep("done");
      const lines = [
        `✓ Inserted ${result.inserted} records`,
        result.skipped > 0 ? `⊘ Skipped ${result.skipped} duplicates` : "",
        result.errors  > 0 ? `⚠ ${result.errors} invalid records` : "",
      ].filter(Boolean).join("\n");
      showToast({ type: result.inserted > 0 ? "success" : "info", title: "Import complete", message: lines });
      if (result.inserted > 0) onSuccess();
    } catch (err) {
      showToast({ type:"error", title:"Import failed", message: err instanceof Error ? err.message : "Unknown error." });
      setStep("ready");
    }
  }, [onSuccess, showToast]);

  if (!open) return toast ? <Toast toast={toast} onClose={() => setToast(null)} /> : null;

  const isLoading = step === "validating" || step === "uploading";
  const canSubmit = step === "ready" && validCount > 0;
  const isDone    = step === "done";

  // ── Tab styles helper ──────────────────────────────────────────────────────

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, height: 36,
    display:"flex", alignItems:"center", justifyContent:"center", gap:6,
    border:"none", cursor:"pointer", fontSize:13, fontWeight: active ? 600 : 400,
    borderBottom: active ? "2px solid rgb(233,34,39)" : "2px solid transparent",
    background:"none",
    color: active ? "rgb(233,34,39)" : "var(--color-text-secondary)",
    transition:"all 0.15s",
  });

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
        zIndex:1000, backdropFilter:"blur(3px)", animation:"fadeIn 0.2s ease",
      }} />

      {/* Panel */}
      <div role="dialog" aria-modal="true" aria-label="Import JSON" style={{
        position:"fixed", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)", zIndex:1001,
        width:"min(560px, 95vw)",
        background:"var(--color-surface)",
        border:"1px solid var(--color-border)",
        borderRadius:14, boxShadow:"0 24px 64px rgba(0,0,0,0.35)",
        display:"flex", flexDirection:"column", overflow:"hidden",
        animation:"scaleIn 0.2s ease",
      }}>

        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"18px 20px", borderBottom:"1px solid var(--color-border)",
          background:"var(--color-surface-2)",
        }}>
          <div style={{
            width:36, height:36, borderRadius:9,
            background:"rgba(233,34,39,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>
            <FileJson size={18} style={{ color:"rgb(233,34,39)" }} />
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--color-text-primary)" }}>Import JSON</div>
            <div style={{ fontSize:12, color:"var(--color-text-muted)", marginTop:1 }}>Bulk import equipment records</div>
          </div>
          <button id="import-json-modal-close" onClick={onClose} aria-label="Close" style={{
            marginLeft:"auto", background:"none", border:"none", cursor:"pointer",
            color:"var(--color-text-muted)", padding:4, borderRadius:6,
            display:"flex", alignItems:"center",
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Tab bar — only show before done */}
        {!isDone && (
          <div style={{
            display:"flex", borderBottom:"1px solid var(--color-border)",
            background:"var(--color-surface-2)",
          }}>
            <button id="import-tab-file" style={tabStyle(tab === "file")} onClick={() => switchTab("file")}>
              <Upload size={13} /> Upload File
            </button>
            <button id="import-tab-text" style={tabStyle(tab === "text")} onClick={() => switchTab("text")}>
              <ClipboardPaste size={13} /> Paste JSON
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16, minHeight:0 }}>

          {/* ── Upload File tab ── */}
          {tab === "file" && !isDone && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border:`2px dashed ${dragOver ? "rgb(233,34,39)" : "var(--color-border)"}`,
                borderRadius:10, padding:"32px 20px",
                display:"flex", flexDirection:"column", alignItems:"center",
                justifyContent:"center", gap:10, cursor:"pointer",
                background: dragOver ? "rgba(233,34,39,0.04)" : "var(--color-surface-2)",
                transition:"border-color 0.15s, background 0.15s", textAlign:"center",
              }}
            >
              <input ref={fileInputRef} id="import-json-file-input" type="file" accept=".json"
                onChange={handleFileChange} style={{ display:"none" }} />
              {step === "validating"
                ? <Loader2 size={32} style={{ color:"rgb(233,34,39)", animation:"spin 1s linear infinite" }} />
                : <Upload size={32} style={{ color: dragOver ? "rgb(233,34,39)" : "var(--color-text-muted)" }} />
              }
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--color-text-primary)" }}>
                  {step === "validating" ? "Parsing file…"
                    : fileName ? fileName
                    : "Drop your JSON file here"}
                </div>
                {step !== "validating" && (
                  <div style={{ fontSize:11, color:"var(--color-text-muted)", marginTop:4 }}>
                    {fileName ? "Click to choose a different file" : "or click to browse · .json only"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Paste JSON tab ── */}
          {tab === "text" && !isDone && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <textarea
                id="import-json-textarea"
                value={pasteText}
                onChange={e => {
                  setPasteText(e.target.value);
                  // reset validation when user edits
                  if (step === "ready") {
                    setStep("idle");
                    setValidCount(0);
                    setParseErrors([]);
                    parsedRef.current = [];
                  }
                }}
                placeholder={`Paste a JSON array here, e.g.\n[\n  { "equipmentName": "Robot Arm", "equipmentCode": "RB001" }\n]`}
                spellCheck={false}
                style={{
                  width:"100%", height:200, padding:"12px 14px",
                  border:"1px solid var(--color-border)", borderRadius:9,
                  background:"var(--color-surface-2)",
                  color:"var(--color-text-primary)",
                  fontSize:12, fontFamily:"monospace", lineHeight:1.6,
                  resize:"vertical", outline:"none",
                  transition:"border-color 0.15s, box-shadow 0.15s",
                  boxSizing:"border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgb(233,34,39)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(233,34,39,0.08)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--color-border)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                id="import-json-validate-btn"
                onClick={handleValidateText}
                disabled={isLoading || !pasteText.trim()}
                style={{
                  alignSelf:"flex-end", height:34, padding:"0 18px",
                  border:"1px solid var(--color-border)", borderRadius:7,
                  background:"var(--color-surface)", fontSize:13, fontWeight:500,
                  color:"var(--color-text-primary)", cursor: pasteText.trim() ? "pointer" : "not-allowed",
                  opacity: pasteText.trim() ? 1 : 0.5,
                  display:"flex", alignItems:"center", gap:6,
                  transition:"border-color 0.15s",
                }}
                onMouseEnter={e => { if (pasteText.trim()) e.currentTarget.style.borderColor = "rgb(233,34,39)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
              >
                {step === "validating"
                  ? <><Loader2 size={13} style={{ animation:"spin 1s linear infinite" }} /> Validating…</>
                  : "Validate JSON"
                }
              </button>
            </div>
          )}

          {/* Fatal error */}
          {fatalError && (
            <div style={{
              display:"flex", alignItems:"flex-start", gap:8,
              padding:"10px 12px",
              background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.25)",
              borderRadius:8, fontSize:12, color:"#ef4444",
            }}>
              <XCircle size={14} style={{ flexShrink:0, marginTop:1 }} />
              {fatalError}
            </div>
          )}

          {/* Validation result */}
          {(step === "ready" || step === "uploading") && (
            <ValidationResult validCount={validCount} parseErrors={parseErrors} />
          )}

          {/* Done */}
          {isDone && summary && <DoneSummary summary={summary} />}
        </div>

        {/* Footer */}
        <div style={{
          padding:"14px 20px", borderTop:"1px solid var(--color-border)",
          background:"var(--color-surface-2)",
          display:"flex", justifyContent:"flex-end", gap:8,
        }}>
          <button id="import-json-cancel-btn" onClick={onClose} style={{
            height:34, padding:"0 16px",
            border:"1px solid var(--color-border)", borderRadius:7,
            background:"var(--color-surface)", color:"var(--color-text-secondary)",
            fontSize:13, fontWeight:500, cursor:"pointer",
          }}>
            {isDone ? "Close" : "Cancel"}
          </button>

          {!isDone && (
            <button
              id="import-json-submit-btn"
              onClick={handleImport}
              disabled={!canSubmit || isLoading}
              style={{
                height:34, padding:"0 20px", border:"none", borderRadius:7,
                background: canSubmit && !isLoading ? "rgb(233,34,39)" : "rgba(233,34,39,0.4)",
                color:"white", fontSize:13, fontWeight:600,
                cursor: canSubmit && !isLoading ? "pointer" : "not-allowed",
                display:"flex", alignItems:"center", gap:6,
                transition:"background 0.15s",
              }}
            >
              {step === "uploading" && <Loader2 size={13} style={{ animation:"spin 1s linear infinite" }} />}
              {step === "uploading" ? "Importing…" : `Import${validCount > 0 ? ` (${validCount})` : ""}`}
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
