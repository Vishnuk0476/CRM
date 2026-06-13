import { useRef, useState, useEffect } from "react";
import { X, Printer, Download, Share2, Mail, Copy, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { downloadLRPdf, getLRPdfBase64, type LRData } from "@/lib/generateLRPdf";
import { useToast } from "@/hooks/use-toast";
import logoBlack from "@/assets/logo-black.webp";

interface LRReceiptProps {
  consignment: LRData & { id: string; lr_pdf_path?: string | null };
  onClose: () => void;
  onSaved?: (pdfPath: string) => void;
}

// Maps service_type to the correct description for the LR receipt
function getServiceDescription(serviceType?: string): string {
  if (!serviceType) return "PACKETS HOUSEHOLD GOODS & PERSONAL BELONGINGS";
  const t = serviceType.toLowerCase();
  if (t.includes("household") || t.includes("home"))
    return "PACKETS HOUSEHOLD GOODS & PERSONAL BELONGINGS";
  if (t.includes("office"))
    return "PACKETS OFFICE FURNITURE, EQUIPMENT & FILES";
  if (t.includes("international"))
    return "PACKETS INTERNATIONAL CONSIGNMENT GOODS";
  if (t.includes("vehicle") || t.includes("car") || t.includes("bike"))
    return "VEHICLE TRANSPORT CONSIGNMENT";
  if (t.includes("storage"))
    return "PACKETS STORAGE GOODS & PERSONAL ITEMS";
  if (t.includes("pet"))
    return "PET RELOCATION CONSIGNMENT";
  if (t.includes("art") || t.includes("antique"))
    return "PACKETS FINE ART, ANTIQUES & COLLECTIBLES";
  if (t.includes("industrial") || t.includes("factory"))
    return "PACKETS INDUSTRIAL MACHINERY & EQUIPMENT";
  if (t.includes("lab"))
    return "PACKETS LABORATORY EQUIPMENT & INSTRUMENTS";
  if (t.includes("it") || t.includes("data"))
    return "PACKETS IT EQUIPMENT & DATA CENTER HARDWARE";
  return "PACKETS CONSIGNMENT GOODS";
}

export const LRReceipt = ({ consignment: c, onClose, onSaved }: LRReceiptProps) => {
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(c.lr_pdf_path ?? null);
  const [shareUrl, setShareUrl] = useState<string | null>(
    c.lr_pdf_path ? `https://panyaglobal.in${c.lr_pdf_path}` : null
  );

  const lrLabel = c.lr_number ?? c.consignment_number ?? "LR";

  // ── Auto-save to server when first opened (if not already saved) ──────────
  useEffect(() => {
    if (!savedPath && c.id) {
      handleSaveToServer(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadLRPdf(c);
      toast({ title: "Downloaded!", description: `LR_${lrLabel}.pdf saved to your downloads.` });
    } catch {
      toast({ title: "Error", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToServer = async (silent = false) => {
    if (!c.id) return;
    setIsSaving(true);
    try {
      const b64 = await getLRPdfBase64(c);
      
      // Convert base64 to blob
      const base64Data = b64.replace(/^data:application\/pdf;base64,/, "");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      
      const safeNum = lrLabel.replace(/[^A-Za-z0-9]/g, "");
      const fileName = `LR_${safeNum}_${Date.now()}.pdf`;
      const filePath = `lrs/${fileName}`;

      // Upload to PHP Server via storage.ts
      const { uploadFile } = await import("@/lib/storage");
      const uploadRes = await uploadFile('lr-receipts', blob, filePath, { contentType: "application/pdf" });

      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.error || "Failed to upload PDF to server");
      }

      const publicUrl = uploadRes.url;

      // Update consignment with the path
      const res = await fetch("/api/consignments/update.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, lr_pdf_path: publicUrl }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSavedPath(publicUrl);
        setShareUrl(publicUrl);
        onSaved?.(publicUrl);
        if (!silent) {
          toast({ title: "Saved!", description: "LR PDF saved to server — shareable link ready." });
        }
      } else {
        throw new Error(data.error ?? "Database update failed");
      }
    } catch (err: unknown) {
      if (!silent) {
        toast({ title: "Save Failed", description: err.message || "Failed to upload to storage", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast({ title: "Link Copied!", description: "Share this link with client or team." });
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err: unknown) {
      toast({ title: "Copy Failed", description: "Please copy the link manually", variant: "destructive" });
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`LR Receipt — ${lrLabel} | Panya Global Relocation`);
    const body = encodeURIComponent(
      `Dear ${c.customer_name},\n\nPlease find your Lorry Receipt details:\n\nLR Number: ${lrLabel}\nFrom: ${c.origin}\nTo: ${c.destination}\nService: ${c.service_type}\n\n${shareUrl ? `Download your LR PDF here:\n${shareUrl}\n\n` : ""}For tracking, visit: https://panyaglobal.in/track?type=lr&q=${lrLabel}\n\nRegards,\nPanya Global Relocation\n+91 11 41556447 | +91 8800890802`
    );
    window.open(`mailto:${c.customer_email}?subject=${subject}&body=${body}`);
  };

  const handlePrint = () => window.print();

  const today = c.created_at_formatted ?? new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#lr-print-root) { display: none !important; }
          #lr-print-root { position: fixed; inset: 0; z-index: 9999; background: white; }
          .lr-noprint { display: none !important; }
          .lr-receipt-shell { box-shadow: none !important; max-width: 100% !important; border-radius: 0 !important; }
        }
      `}</style>

      <div id="lr-print-root" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-3 overflow-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="lr-receipt-shell bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden mb-8"
        >
          {/* ── Top Action Bar ─────────────────────────────────────────── */}
          <div className="lr-noprint flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-800 text-white">
            <div className="flex items-center gap-3">
              <div className="bg-sky-500/20 p-2 rounded-lg">
                <Printer className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p className="font-bold text-sm">LR Receipt</p>
                <p className="text-xs text-slate-400 font-mono">LR No: {lrLabel}</p>
              </div>
              {isSaving && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating PDF…
                </span>
              )}
              {savedPath && !isSaving && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> PDF saved
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Download */}
              <Button size="sm" onClick={handleDownload} disabled={isDownloading}
                className="gap-2 bg-sky-600 hover:bg-sky-700 text-white border-0 h-8 text-xs">
                {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download PDF
              </Button>

              {/* Re-save / Generate */}
              <Button size="sm" variant="outline" onClick={() => handleSaveToServer(false)} disabled={isSaving}
                className="gap-2 border-slate-600 text-slate-200 hover:bg-slate-700 h-8 text-xs">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {savedPath ? "Re-save" : "Save to Server"}
              </Button>

              {/* Copy Share Link */}
              {shareUrl && (
                <Button size="sm" variant="outline" onClick={handleCopyLink}
                  className="gap-2 border-slate-600 text-slate-200 hover:bg-slate-700 h-8 text-xs">
                  {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? "Copied!" : "Copy Link"}
                </Button>
              )}

              {/* Share via Email */}
              <Button size="sm" variant="outline" onClick={handleShareEmail}
                className="gap-2 border-slate-600 text-slate-200 hover:bg-slate-700 h-8 text-xs">
                <Mail className="w-3.5 h-3.5" /> Email Client
              </Button>

              {/* Print */}
              <Button size="sm" variant="ghost" onClick={handlePrint}
                className="gap-2 text-slate-300 hover:bg-slate-700 h-8 text-xs">
                <Printer className="w-3.5 h-3.5" /> Print
              </Button>

              <Button size="sm" variant="ghost" onClick={onClose}
                className="text-slate-300 hover:bg-slate-700 h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* ── Share URL Banner ──────────────────────────────────────── */}
          <AnimatePresence>
            {shareUrl && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lr-noprint bg-green-950/80 border-b border-green-800 px-5 py-2 flex items-center gap-3 flex-wrap"
              >
                <Share2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-xs text-green-300 font-mono truncate flex-1">{shareUrl}</span>
                <button onClick={handleCopyLink} className="text-xs text-green-400 hover:text-green-200 flex items-center gap-1">
                  {isCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Receipt Body ──────────────────────────────────────────── */}
          <div ref={receiptRef} className="bg-white text-black p-6" style={{ fontFamily: "Arial, sans-serif", fontSize: "12px" }}>

            <div style={{ display: "flex", border: "1px solid #000" }}>
              {/* LEFT */}
              <div style={{ flex: 1, borderRight: "1px solid #000" }}>
                {/* CONSIGNOR */}
                <div style={{ borderBottom: "1px solid #000", padding: "8px 10px", minHeight: "90px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "11px", marginBottom: "4px" }}>CONSIGNOR</div>
                  <div style={{ borderBottom: "1px solid #999", marginBottom: "4px", paddingBottom: "4px", fontWeight: 600 }}>
                    {c.consignor_name || "___________________________"}
                  </div>
                  <div style={{ borderBottom: "1px solid #999", marginBottom: "4px", paddingBottom: "4px" }}>
                    {c.consignor_address ? c.consignor_address.split("\n")[0] : c.origin}
                  </div>
                  <div style={{ borderBottom: "1px solid #999", paddingBottom: "4px" }}>
                    {c.consignor_address?.split("\n")[1] ?? ""}
                  </div>
                </div>

                {/* CONSIGNEE */}
                <div style={{ borderBottom: "1px solid #000", padding: "8px 10px", minHeight: "110px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "11px", marginBottom: "4px" }}>CONSIGNEE</div>
                  <div style={{ borderBottom: "1px solid #999", marginBottom: "4px", paddingBottom: "4px", fontWeight: 600 }}>{c.customer_name}</div>
                  <div style={{ borderBottom: "1px solid #999", marginBottom: "4px", paddingBottom: "4px" }}>{c.destination}</div>
                  <div style={{ borderBottom: "1px solid #999", paddingBottom: "4px" }}>{c.consignee_address ?? ""}</div>
                </div>

                {/* DESCRIPTION */}
                <div style={{ borderBottom: "1px solid #000" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #000", textAlign: "center", fontWeight: "bold", fontSize: "11px", borderBottom: "1px solid #000" }}>DESCRIPTION</th>
                        <th style={{ padding: "6px 10px", textAlign: "center", fontWeight: "bold", fontSize: "11px", borderBottom: "1px solid #000", whiteSpace: "nowrap" }}>No. of Packages</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "10px", borderRight: "1px solid #000", verticalAlign: "top" }}>
                          <div style={{ textAlign: "center", lineHeight: "1.9" }}>
                            TOTAL <strong>{c.packages_count ?? "______"}</strong> {getServiceDescription(c.service_type)}<br />
                            <strong>OWNER USE ONLY</strong><br />
                            <strong>NO COMMERCIAL VALUE</strong><br />
                            <strong style={{ fontSize: "13px" }}>NOT FOR SALE</strong>
                          </div>
                          {c.description && (
                            <div style={{ marginTop: "8px", borderTop: "1px solid #ccc", paddingTop: "6px", fontSize: "11px" }}>
                              {c.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center", verticalAlign: "top" }}>
                          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px" }}>
                            {c.packages_count ?? ""}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SIGNATURES */}
                <div style={{ padding: "8px 10px", display: "flex", justifyContent: "space-between", minHeight: "50px" }}>
                  <div>Customer Sign. _______________</div>
                  <div>Prepared by _______________</div>
                </div>

                {/* BRANCHES */}
                <div style={{ padding: "4px 10px 6px", textAlign: "center", fontSize: "10px", borderTop: "1px solid #ccc", color: "#333" }}>
                  Branches: Mumbai/Delhi/Bangalore/Chennai/Hyderabad/Kolkata
                </div>
              </div>

              {/* RIGHT */}
              <div style={{ width: "200px", display: "flex", flexDirection: "column" }}>
                {/* LOGO */}
                <div style={{ padding: "8px 10px", borderBottom: "1px solid #000", textAlign: "center", background: "#fff" }}>
                  <img 
                    src={logoBlack}
                    alt="Panya Global"
                    style={{ height: "60px", width: "auto", objectFit: "contain", display: "inline-block" }}
                    onError={(e) => {
                      // fallback to text logo if image fails
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML += `<div style="font-size:20px;font-weight:900;line-height:1.1;"><span style="color:#1e90ff;">Panya</span><br/><span style="color:#1e90ff;">Gl</span><span style="color:#1a1a1a;">obal</span></div><div style="font-size:8px;color:#555;margin-top:2px;">RELOCATION SERVICES</div>`;
                    }}
                  />
                  <div style={{ fontSize: "7px", color: "#555", marginTop: "2px", fontWeight: 600, letterSpacing: "0.5px" }}>RELOCATION SERVICES</div>
                </div>

                {/* INFO ROWS */}
                {(([
                  ["DATE :", today],
                  ["GCN. NO.", lrLabel],
                  ["FROM :", c.origin],
                  ["TO :", c.destination],
                  ...(c.loaded_from_city ? [["LOADED FROM :", c.loaded_from_city]] : []),
                  ...(c.out_for_delivery_city ? [["OUT FOR DEL. :", c.out_for_delivery_city]] : []),
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} style={{ display: "flex", borderBottom: "1px solid #ccc", padding: "5px 8px", gap: "4px", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "10px", whiteSpace: "nowrap", minWidth: "64px" }}>{label}</span>
                    <span style={{ fontSize: "10px", wordBreak: "break-all" }}>{value}</span>
                  </div>
                )))}


                {/* INSURED */}
                <div style={{ borderBottom: "1px solid #000", padding: "6px 8px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "10px", textAlign: "center", marginBottom: "4px", borderBottom: "1px solid #ccc", paddingBottom: "4px" }}>
                    Consignment Insured by :
                  </div>
                  <div style={{ fontSize: "9.5px", lineHeight: "1.5" }}>
                    Panya Global Relocation<br />Under Carrier&apos;s risk scheme
                  </div>
                  <div style={{ fontSize: "9.5px", lineHeight: "1.5", marginTop: "4px" }}>
                    Owner Risk / Third Party<br />Insurance by consignor
                  </div>
                </div>

                {/* ACKNOWLEDGMENT */}
                <div style={{ flex: 1, borderBottom: "1px solid #000" }}>
                  <div style={{ fontWeight: "bold", fontSize: "10px", textAlign: "center", padding: "4px", backgroundColor: "#f0f0f0", borderBottom: "1px solid #ccc" }}>
                    ACKNOWLEDGMENT
                  </div>
                  <div style={{ padding: "4px 8px", fontSize: "9px", borderBottom: "1px solid #ccc" }}>
                    Received the goods in good condition
                  </div>
                  {["NAME", "SIGN.", "Contact No."].map(label => (
                    <div key={label} style={{ display: "flex", borderBottom: "1px solid #ccc", padding: "5px 8px", gap: "4px" }}>
                      <span style={{ fontWeight: "bold", fontSize: "9px", whiteSpace: "nowrap", minWidth: "52px" }}>{label}</span>
                      <span style={{ flex: 1, borderBottom: "1px solid #999" }}>&nbsp;</span>
                    </div>
                  ))}
                </div>

                {/* HELPLINE */}
                <div style={{ backgroundColor: "#cc0000", color: "white", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "9px", fontWeight: 600 }}>Moving ? Call</div>
                  <div style={{ fontSize: "11px", fontWeight: 900, lineHeight: 1.4 }}>+91 11 41556447</div>
                  <div style={{ fontSize: "9px", fontWeight: 700 }}>+91 8800890802</div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "9px", color: "#333", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <strong>Office Come Warehouse : 18/1, Basement, Village Samalkha, Old Delhi Gurgaon Road, New Delhi – 110037</strong><br />
                Direct Line: +91 11 41556447 &nbsp;|&nbsp; Mob: +91 8800890802, +91 8800331157 &nbsp;|&nbsp; Intl: +91 8800264232 &nbsp;|&nbsp; E-mail: info@panyaglobal.in &nbsp;|&nbsp; Web: Panyaglobal.in
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "8px", color: "#666" }}>
                <span style={{ border: "1px solid #ccc", padding: "2px 4px", borderRadius: "2px" }}>ISO 9001</span>
                <span style={{ border: "1px solid #ccc", padding: "2px 4px", borderRadius: "2px" }}>ISO 18001</span>
              </div>
            </div>

            {/* COPY TYPES */}
            <div style={{ marginTop: "8px", display: "flex", gap: "24px", fontSize: "10px", borderTop: "1px solid #ccc", paddingTop: "6px" }}>
              {["CUSTOMER COPY", "TRUCK COPY", "ACCOUNTS COPY", "RECORDS COPY"].map(label => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <input type="checkbox" style={{ width: "12px", height: "12px" }} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LRReceipt;
