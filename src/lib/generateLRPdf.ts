import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoBlackUrl from "@/assets/logo-black.webp";

export interface LRData {
  lr_number?: string | null;
  awb_number?: string | null;
  consignment_number?: string;
  consignor_name?: string | null;
  consignor_address?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  consignee_address?: string | null;
  origin: string;
  destination: string;
  service_type: string;
  description?: string | null;
  packages_count?: number | null;
  estimated_delivery_formatted?: string | null;
  created_at_formatted?: string;
  notes?: string | null;
  loaded_from_city?: string | null;
  out_for_delivery_city?: string | null;
}

export async function generateLRPdf(data: LRData): Promise<jsPDF> {
  const html = buildReceiptHTML(data);
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;width:793px;background:#fff;font-family:Arial,sans-serif;font-size:12px;padding:12px;box-sizing:border-box;";
  container.innerHTML = html;
  document.body.appendChild(container);
  await new Promise((r) => setTimeout(r, 200));
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    width: 793,
  });
  document.body.removeChild(container);
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = (canvas.height * pdfW) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
  return pdf;
}

export async function downloadLRPdf(data: LRData): Promise<void> {
  const pdf = await generateLRPdf(data);
  pdf.save("LR_" + (data.lr_number ?? data.consignment_number ?? "report") + ".pdf");
}

export async function getLRPdfBase64(data: LRData): Promise<string> {
  const pdf = await generateLRPdf(data);
  return pdf.output("datauristring");
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function infoRow(label: string, value: string): string {
  return (
    '<div style="display:flex;border-bottom:1px solid #ccc;padding:5px 8px;gap:4px;align-items:center;">' +
    '<span style="font-weight:bold;font-size:10px;white-space:nowrap;min-width:64px;">' + label + "</span>" +
    '<span style="font-size:10px;word-break:break-all;">' + value + "</span>" +
    "</div>"
  );
}

function ackRow(label: string): string {
  return (
    '<div style="display:flex;border-bottom:1px solid #ccc;padding:5px 8px;gap:4px;">' +
    '<span style="font-weight:bold;font-size:9px;white-space:nowrap;min-width:52px;">' + label + "</span>" +
    '<span style="flex:1;border-bottom:1px solid #999;">&nbsp;</span>' +
    "</div>"
  );
}

function copyLabel(label: string): string {
  return '<label style="display:flex;align-items:center;gap:5px;"><input type="checkbox"/> ' + label + "</label>";
}

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

// ── HTML Receipt Template ─────────────────────────────────────────────────────

function buildReceiptHTML(c: LRData): string {
  const today = c.created_at_formatted ?? new Date().toLocaleDateString("en-IN");
  const lrNo = c.lr_number ?? c.consignment_number ?? "—";
  const addr1 = c.consignor_address ? c.consignor_address.split("\n")[0] : c.origin;
  const addr2 = c.consignor_address ? (c.consignor_address.split("\n")[1] ?? "") : "";
  const pkgCount = c.packages_count ?? "______";

  // Build info rows safely (no nested template literals)
  let infoRows = "";
  infoRows += infoRow("DATE :", today);
  infoRows += infoRow("GCN. NO.", lrNo);
  infoRows += infoRow("FROM :", c.origin);
  infoRows += infoRow("TO :", c.destination);
  if (c.loaded_from_city) infoRows += infoRow("LOADED FROM :", c.loaded_from_city);
  if (c.out_for_delivery_city) infoRows += infoRow("OUT FOR DEL. :", c.out_for_delivery_city);

  const descText = getServiceDescription(c.service_type);

  const descriptionExtra = c.description
    ? '<div style="margin-top:8px;border-top:1px solid #ccc;padding-top:6px;font-size:11px;">' + c.description + "</div>"
    : "";

  return `
<div style="border:1px solid #000;display:flex;font-family:Arial,sans-serif;font-size:12px;color:#000;background:#fff;">

  <!-- LEFT COLUMN -->
  <div style="flex:1;border-right:1px solid #000;">

    <!-- CONSIGNOR -->
    <div style="border-bottom:1px solid #000;padding:8px 10px;min-height:90px;">
      <div style="font-weight:bold;font-size:11px;margin-bottom:4px;">CONSIGNOR</div>
      <div style="border-bottom:1px solid #999;margin-bottom:4px;padding-bottom:4px;font-weight:600;">${c.consignor_name || "___________________________"}</div>
      <div style="border-bottom:1px solid #999;margin-bottom:4px;padding-bottom:4px;">${addr1}</div>
      <div style="border-bottom:1px solid #999;padding-bottom:4px;">${addr2}</div>
    </div>

    <!-- CONSIGNEE -->
    <div style="border-bottom:1px solid #000;padding:8px 10px;min-height:90px;">
      <div style="font-weight:bold;font-size:11px;margin-bottom:4px;">CONSIGNEE</div>
      <div style="border-bottom:1px solid #999;margin-bottom:4px;padding-bottom:4px;font-weight:600;">${c.customer_name}</div>
      <div style="border-bottom:1px solid #999;margin-bottom:4px;padding-bottom:4px;">${c.destination}</div>
      <div style="border-bottom:1px solid #999;padding-bottom:4px;">${c.consignee_address || ""}</div>
    </div>

    <!-- DESCRIPTION TABLE -->
    <div style="border-bottom:1px solid #000;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:6px 10px;border-right:1px solid #000;text-align:center;font-weight:bold;font-size:11px;border-bottom:1px solid #000;">DESCRIPTION</th>
            <th style="padding:6px 10px;text-align:center;font-weight:bold;font-size:11px;border-bottom:1px solid #000;white-space:nowrap;">No. of Packages</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:10px;border-right:1px solid #000;vertical-align:top;min-height:90px;">
              <div style="text-align:center;line-height:1.9;">
                TOTAL <strong>${pkgCount}</strong> ${descText}<br/>
                <strong>OWNER USE ONLY</strong><br/>
                <strong>NO COMMERCIAL VALUE</strong><br/>
                <strong style="font-size:13px;">NOT FOR SALE</strong>
              </div>
              ${descriptionExtra}
            </td>
            <td style="padding:10px;text-align:center;vertical-align:top;">
              <div style="font-size:18px;font-weight:bold;margin-top:10px;">${c.packages_count ?? ""}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- SIGNATURES -->
    <div style="padding:8px 10px;display:flex;justify-content:space-between;align-items:flex-end;min-height:50px;">
      <div>Customer Sign. _______________</div>
      <div style="text-align:right;">Prepared by _______________</div>
    </div>

    <!-- BRANCHES -->
    <div style="padding:4px 10px 6px;text-align:center;font-size:10px;border-top:1px solid #ccc;color:#333;">
      Branches: Mumbai / Delhi / Bangalore / Chennai / Hyderabad / Kolkata
    </div>
  </div>

  <!-- RIGHT COLUMN -->
  <div style="width:200px;display:flex;flex-direction:column;">

    <!-- LOGO -->
    <div style="padding:8px 10px;border-bottom:1px solid #000;text-align:center;background:#fff;">
      <img src="${logoBlackUrl}" alt="Panya Global" style="height:55px;width:auto;object-fit:contain;display:inline-block;"/>
      <div style="font-size:7px;color:#555;margin-top:2px;font-weight:600;letter-spacing:0.5px;">RELOCATION SERVICES</div>
    </div>

    <!-- INFO ROWS -->
    <div style="border-bottom:1px solid #000;">
      ${infoRows}
    </div>

    <!-- INSURED BY -->
    <div style="border-bottom:1px solid #000;padding:6px 8px;">
      <div style="font-weight:bold;font-size:10px;text-align:center;margin-bottom:4px;border-bottom:1px solid #ccc;padding-bottom:4px;">Consignment Insured by :</div>
      <div style="font-size:9.5px;line-height:1.5;">Panya Global Relocation<br/>Under Carrier's risk scheme</div>
      <div style="font-size:9.5px;line-height:1.5;margin-top:4px;">Owner Risk / Third Party<br/>Insurance by consignor</div>
    </div>

    <!-- ACKNOWLEDGMENT -->
    <div style="flex:1;border-bottom:1px solid #000;">
      <div style="font-weight:bold;font-size:10px;text-align:center;padding:4px;background:#f0f0f0;border-bottom:1px solid #ccc;">ACKNOWLEDGMENT</div>
      <div style="padding:4px 8px;font-size:9px;border-bottom:1px solid #ccc;">Received the goods in good condition</div>
      ${ackRow("NAME")}
      ${ackRow("SIGN.")}
      ${ackRow("Contact No.")}
    </div>

    <!-- HELPLINE -->
    <div style="background:#cc0000;color:white;padding:8px;text-align:center;">
      <div style="font-size:9px;font-weight:600;">Moving ? Call</div>
      <div style="font-size:12px;font-weight:900;line-height:1.4;">+91 11 41556447</div>
      <div style="font-size:9px;font-weight:700;">+91 8800890802</div>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div style="display:flex;justify-content:space-between;margin-top:6px;font-size:9px;color:#333;flex-wrap:wrap;gap:8px;">
  <div>
    <div style="font-weight:bold;margin-bottom:2px;">Office Come Warehouse : 18/1, Basement, Village Samalkha, Old Delhi Gurgaon Road, New Delhi - 110037</div>
    <div>Direct Line: +91 11 41556447 &nbsp;|&nbsp; Mob: +91 8800890802, +91 8800331157 &nbsp;|&nbsp; Intl: +91 8800264232 &nbsp;|&nbsp; E-mail: info@panyaglobal.in &nbsp;|&nbsp; Web: Panyaglobal.in</div>
  </div>
  <div style="display:flex;align-items:center;gap:4px;font-size:8px;color:#666;">
    <span style="border:1px solid #ccc;padding:2px 4px;border-radius:2px;">ISO 9001</span>
    <span style="border:1px solid #ccc;padding:2px 4px;border-radius:2px;">ISO 18001</span>
  </div>
</div>

<!-- COPY TYPES -->
<div style="margin-top:8px;display:flex;gap:24px;font-size:10px;border-top:1px solid #ccc;padding-top:6px;">
  ${copyLabel("CUSTOMER COPY")}
  ${copyLabel("TRUCK COPY")}
  ${copyLabel("ACCOUNTS COPY")}
  ${copyLabel("RECORDS COPY")}
</div>
`;
}
