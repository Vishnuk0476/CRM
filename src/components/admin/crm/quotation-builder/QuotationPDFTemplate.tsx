import React from "react";
import { QuotationForm, LineItem } from "./QuotationBuilderWizard";
import logoImg from "@/assets/logo-black.webp";

interface QuotationPDFProps {
  form: QuotationForm;
  lineItems: LineItem[];
  quotationNumber?: string;
}

export const QuotationPDFTemplate = React.forwardRef<HTMLDivElement, QuotationPDFProps>(
  ({ form, lineItems, quotationNumber = "DRAFT" }, ref) => {
    
    const renderRichText = (text?: string) => {
      if (!text) return null;
      if (text.includes('<ul') || text.includes('<ol') || text.includes('<p>') || text.includes('<br')) {
        return <div className="custom-html-content" dangerouslySetInnerHTML={{ __html: text }} />;
      }
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      return (
        <div className="custom-html-content">
          {lines.map((line, idx) => {
            if (line.endsWith(':') || lines.length === 1) {
              return <div key={idx} style={{ marginBottom: '4px', fontWeight: line.endsWith(':') ? 'bold' : 'normal' }}>{line}</div>;
            }
            
            const numMatch = line.match(/^(\d+\.)\s*/);
            const bulletChar = numMatch ? numMatch[1] : '•';
            const clean = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
            
            return (
              <div key={idx} style={{ display: 'flex', marginBottom: '2px', paddingLeft: '4px' }}>
                <span style={{ marginRight: '6px' }}>{bulletChar}</span>
                <span>{clean}</span>
              </div>
            );
          })}
        </div>
      );
    };
    
    const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    let discountAmount = form.discount_type === "percent" ? subtotal * (form.discount_value / 100) : form.discount_value;
    discountAmount = Math.min(discountAmount, subtotal);
    
    const totalInsurancePremium = (form.insurances || []).reduce((acc, ins) => {
      return acc + (ins.declared_value * (ins.percentage / 100));
    }, 0);
    
    const taxableAmount = subtotal - discountAmount + totalInsurancePremium;
    
    const d = new Date();
    const provisionalRef = `PG-QT-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-01`;
    const finalRef = quotationNumber === "DRAFT" ? provisionalRef : quotationNumber;
    
    const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Inline SVG Icons for Social Bar
    const fbIcon = <svg viewBox="0 0 24 24" width="12" height="12" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    const inIcon = <svg viewBox="0 0 24 24" width="12" height="12" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    const igIcon = <svg viewBox="0 0 24 24" width="12" height="12" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
    const xIcon = <svg viewBox="0 0 24 24" width="12" height="12" fill="#000000"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>;
    const ytIcon = <svg viewBox="0 0 24 24" width="12" height="12" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;

    const SocialBar = () => (
      <div className="pdf-header-social justify-end text-black gap-2">
         <a href="https://www.facebook.com/PanyaGlobalMovers" className="hover:opacity-80" target="_blank" rel="noreferrer noopener noreferrer">{fbIcon}</a>
         <a href="https://www.linkedin.com/company/panya-global-movers" className="hover:opacity-80" target="_blank" rel="noreferrer noopener noreferrer">{inIcon}</a>
         <a href="https://www.instagram.com/panyaglobal" className="hover:opacity-80" target="_blank" rel="noreferrer noopener noreferrer">{igIcon}</a>
         <a href="https://twitter.com/panyaglobalmovers" className="hover:opacity-80" target="_blank" rel="noreferrer noopener noreferrer">{xIcon}</a>
         <a href="https://www.youtube.com/user/panyaglobalmovers" className="hover:opacity-80" target="_blank" rel="noreferrer noopener noreferrer">{ytIcon}</a>
      </div>
    );

    return (
      <div 
        ref={ref} 
        className="font-sans mx-auto pdf-wrapper flex flex-col gap-8 items-center"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9px; }
          .pdf-table th, .pdf-table td { border: 1px solid #000; padding: 1.5px 3px; vertical-align: top; text-align: left; line-height: 1.1; }
          .pdf-table th { background-color: #e5e7eb; font-weight: bold; text-align: left; }
          .pdf-blue-header { background-color: #d9e2f3; color: #000; font-weight: bold; }
          .text-blue-custom { color: #2f5597; font-weight: bold; }
          .text-red-custom { color: #c00000; font-weight: bold; }
          .pdf-header-social { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 8px; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; padding: 2px 0; margin-bottom: 6px; }
          .pdf-page-container { background: #fff; width: 210mm; height: 297mm; padding: 10mm 15mm; box-sizing: border-box; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; display: flex; flex-direction: column; }
          .pdf-content-wrapper { flex: 1; }
          .custom-html-content ul { list-style-type: disc !important; list-style-position: inside !important; margin-left: 0.5rem !important; margin-bottom: 0.5rem !important; padding-left: 0 !important; }
          .custom-html-content ol { list-style-type: decimal !important; list-style-position: inside !important; margin-left: 0.5rem !important; margin-bottom: 0.5rem !important; padding-left: 0 !important; }
          .custom-html-content p { margin-bottom: 0.5rem !important; }
          .custom-html-content li { margin-bottom: 0.25rem !important; display: list-item !important; }
          @media print {
            body * { visibility: hidden; }
            .pdf-wrapper, .pdf-wrapper * { visibility: visible; }
            .pdf-wrapper { position: absolute; left: 0; top: 0; width: 100%; gap: 0; }
            .pdf-page-container { box-shadow: none; margin-bottom: 0; padding: 10mm 15mm; page-break-after: always; height: auto !important; min-height: 297mm; overflow: visible !important; }
          }
        `}} />

        {/* --- PAGE 1 --- */}
        <div id="pdf-page-1" className="pdf-page-container">
          
          <div className="flex justify-between items-start mb-2">
            <div className="w-56">
              <img src={logoImg} alt="Panya Global" className="w-full h-auto object-contain" loading="lazy" decoding="async" />
            </div>
            <div className="text-right text-[10px] leading-tight text-black">
              <div>Office Come Warehouse : 18/1, Basement, Village Samalkha,</div>
              <div>Old Delhi Gurgaon Road, New Delhi – 110037</div>
              <div>Phone No. +91-1141556447</div>
              <div>Mob. +91-8800446447, +91-8800331157, +91-8800112304</div>
              <div className="mt-1">Email <span className="text-blue-600 underline">info@panyaglobal.in</span></div>
              <div>Web. <span className="text-blue-600 underline">www.panyaglobal.in</span> , <span className="text-blue-600 underline">www.panyaglobalmovers.com</span></div>
            </div>
          </div>

          <SocialBar />

          <div className="text-center font-bold text-lg underline mb-2 text-black">QUOTATION</div>

          <table className="pdf-table mb-2 text-black">
            <tbody>
              <tr>
                <td style={{width: '55%', padding: 0, border: 'none'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <tbody>
                      <tr><td className="font-bold" style={{width: '100px'}}>M/s:</td><td className="font-bold">{form.client_company || form.client_name || '-'}</td></tr>
                      <tr><td className="font-bold">Accounts</td><td>{form.client_name || '-'}</td></tr>
                      <tr><td className="font-bold">Moving From:</td><td>{form.client_address || `${form.origin_city || '-'}, ${form.origin_state || '-'}`}</td></tr>
                      <tr><td className="font-bold">Delivery To:</td><td>{form.destination_city || '-'}, {form.destination_state || '-'}</td></tr>
                      <tr><td className="font-bold">Mob. No:</td><td>{form.client_phone || '-'}</td></tr>
                    </tbody>
                  </table>
                </td>
                <td style={{width: '45%', padding: 0, border: 'none', borderLeft: '1px solid #000'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <tbody>
                      <tr><td className="font-bold" style={{width: '90px', borderBottom: '1px solid #000', paddingLeft: '8px'}}>Our Ref</td><td style={{borderBottom: '1px solid #000'}}>{finalRef}</td></tr>
                      <tr><td className="font-bold" style={{borderBottom: '1px solid #000', paddingLeft: '8px'}}>Quote Date</td><td style={{borderBottom: '1px solid #000'}}>{new Date().toLocaleDateString('en-GB')}</td></tr>
                      <tr><td className="font-bold" style={{borderBottom: '1px solid #000', paddingLeft: '8px'}}>Moving Plan</td><td style={{borderBottom: '1px solid #000'}}>{form.move_date ? new Date(form.move_date).toLocaleDateString('en-GB') : 'Yet to be confirmed'}</td></tr>
                      <tr><td className="font-bold" style={{borderBottom: '1px solid #000', paddingLeft: '8px'}}>E-mail</td><td className="text-blue-600 underline" style={{borderBottom: '1px solid #000'}}>{form.client_email || '-'}</td></tr>
                      <tr><td className="font-bold" style={{borderBottom: '1px solid #000', paddingLeft: '8px'}}>Pan no</td><td className="text-blue-custom" style={{borderBottom: '1px solid #000'}}>{form.client_gst || '-'}</td></tr>
                      <tr><td className="font-bold" style={{borderBottom: '1px solid #000', paddingLeft: '8px'}}>SAC code</td><td style={{borderBottom: '1px solid #000'}}>996511</td></tr>
                      <tr><td className="font-bold" style={{paddingLeft: '8px'}}>CIN No.</td><td className="text-blue-custom">U74999DL2017PTC319048</td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-[10px] mb-1 text-black">Dear Sir/ Madam,</div>
          <div className="text-[10px] mb-1 text-black">
            <b>Sub:</b> Packing & Moving of {form.relocation_type || 'Household Relocation'} {form.bhk_type ? `(${form.bhk_type}) ` : ''}<span className="text-blue-custom">from {form.origin_city || '[Origin]'} to {form.destination_city || '[Destination]'}</span> on Door to Door Basis.
          </div>
          <div className="text-[10px] mb-2 text-justify text-black leading-tight">
            We thank you for your valued enquiry regarding packing & moving. We take this opportunity to inform you that <b className="text-blue-custom">PANYA GLOBAL An ISO 9001:2015, 14001:2015 & 18001:2015 Certification Co.</b> This is the highest quality recognition for a moving company. Having surveyed the goods to be packed & moved, we have pleasure in submitting our proposal as under.
          </div>

          <table className="pdf-table text-black">
            <thead>
              <tr>
                <th className="pdf-blue-header" style={{backgroundColor: '#d9e2f3'}}>RELOCATION CHARGES:</th>
                <th className="pdf-blue-header text-center" style={{width: '130px', backgroundColor: '#d9e2f3'}}>AMOUNT INR.</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="text-red-custom mb-0 text-[9.5px]">{item.service_name} encompass the following services:</div>
                    <div className="text-[8.5px] leading-tight" dangerouslySetInnerHTML={{__html: item.description.replace(/\n/g, '<br/>') || 'Standard relocation services as agreed upon.'}}></div>
                  </td>
                  <td className="text-right align-bottom font-bold">{fmt(item.quantity * item.unit_price)}</td>
                </tr>
              ))}
              <tr>
                <td className="text-blue-custom">If any Labor Union Charges at point of Origin / Destination</td>
                <td className="text-blue-custom text-right">As Actual</td>
              </tr>
              <tr>
                <td className="font-bold">Sub. Total</td>
                <td className="text-right font-bold">{fmt(subtotal)}</td>
              </tr>
              {discountAmount > 0 && (
                <tr>
                  <td className="text-green-700 font-bold">Discount ({form.discount_type === 'percent' ? `${form.discount_value}%` : `₹${form.discount_value}`})</td>
                  <td className="text-right font-bold text-green-700">- {fmt(discountAmount)}</td>
                </tr>
              )}
              {form.insurances && form.insurances.map((ins, idx) => {
                if (ins.declared_value <= 0 || ins.percentage <= 0) return null;
                const premium = ins.declared_value * (ins.percentage / 100);
                return (
                  <tr key={`ins-${idx}`}>
                    <td>Easy Cover Warranty for {ins.type || 'Goods'} <b>IDV {fmt(ins.declared_value)} @ {ins.percentage}%</b> Charges</td>
                    <td className="text-right font-bold">{fmt(premium)}</td>
                  </tr>
                );
              })}
              <tr>
                <td className="font-bold">TOTAL</td>
                <td className="text-right font-bold">{fmt(taxableAmount)}</td>
              </tr>
              <tr>
                <td className="font-bold">GST @ {form.gst_type}%</td>
                <td className="text-right font-bold">Additional</td>
              </tr>
            </tbody>
          </table>

          <table className="pdf-table text-black">
            <thead>
              <tr><th colSpan={2} className="text-center bg-gray-200">Moving Information</th></tr>
            </thead>
            <tbody>
              <tr>
                <td style={{width: '30%'}}>Goods Type</td>
                <td>{form.relocation_type || 'Household Goods'}</td>
              </tr>
              <tr>
                <td>Shipment Mode</td>
                <td className="text-red-custom">Via Road.</td>
              </tr>
              <tr>
                <td>Door to Door Transit Time</td>
                <td className="text-red-custom">
                  10 to 15 days depending on destination.<br/>
                  M/s Panya Global. Will not be responsible for any delays in delivery beyond its control like natural calamities, political or general strikes, accidents, Government interventions and priorities or any other such delays.
                </td>
              </tr>
            </tbody>
          </table>

          {form.scope_intro_text && (
            <table className="pdf-table text-black">
              <thead>
                <tr><th className="bg-gray-200 text-left">Scope of Services</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="text-[9.5px]">
                      {renderRichText(form.scope_intro_text)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {(form.inclusions?.length > 0 || form.exclusions?.length > 0) ? (
            <table className="pdf-table">
              <thead>
                <tr><th colSpan={2} className="text-center bg-gray-200">Scope of services Include & Exclude:</th></tr>
                <tr>
                  <th className="text-center bg-white" style={{width: '50%'}}>Include</th>
                  <th className="text-center bg-white" style={{width: '50%'}}>Exclude</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div className="text-[8.5px]">{renderRichText(form.inclusions?.join('\n'))}</div></td>
                  <td><div className="text-[8.5px]">{renderRichText(form.exclusions?.join('\n'))}</div></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="pdf-table">
              <thead>
                <tr><th colSpan={2} className="text-center bg-gray-200">Scope of services Include & Exclude:</th></tr>
                <tr>
                  <th className="text-center bg-white" style={{width: '50%'}}>Include</th>
                  <th className="text-center bg-white" style={{width: '50%'}}>Exclude</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="font-bold underline mb-1">At Origin</div>
                    <div>* Packing & Handling of household goods</div>
                    <div>* One Point Packing & Pickup</div>
                    <div>* Pickup {form.lift_origin ? 'with lift' : 'via stairs'}.</div>
                  </td>
                  <td>
                    <div className="font-bold underline mb-1">At Origin</div>
                    <div>* Wooden Crating Service</div>
                    <div>* Vehicle Halting</div>
                    <div>* Union / Society / Lift Charges would be additional basis actuals (if applicable)</div>
                    <div>* Shuttle Service, Long carry</div>
                    <div>* Handyman Services</div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

        </div>


        {/* --- PAGE 2 --- */}
        <div id="pdf-page-2" className="pdf-page-container">
          
          <div className="flex justify-between items-start mb-2">
            <div className="w-56">
              <img src={logoImg} alt="Panya Global" className="w-full h-auto object-contain" loading="lazy" decoding="async" />
            </div>
            <div className="text-right text-[10px] leading-tight text-black">
              <div>Office Come Warehouse : 18/1, Basement, Village Samalkha,</div>
              <div>Old Delhi Gurgaon Road, New Delhi – 110037</div>
              <div>Phone No. +91-1141556447</div>
              <div>Mob. +91-8800446447, +91-8800331157, +91-8800112304</div>
              <div className="mt-1">Email <span className="text-blue-600 underline">info@panyaglobal.in</span></div>
              <div>Web. <span className="text-blue-600 underline">www.panyaglobal.in</span> , <span className="text-blue-600 underline">www.panyaglobalmovers.com</span></div>
            </div>
          </div>
          
          <SocialBar />

          <div className="text-center font-bold text-lg underline mb-1 text-black">QUOTATION</div>
          <div className="text-center font-bold text-md underline mb-2 text-black">Pg. 2:</div>

          {(form.inclusions?.length > 0 || form.exclusions?.length > 0) ? null : (
            <table className="pdf-table text-black">
              <thead>
                <tr><th colSpan={2} className="text-center bg-gray-200">Scope of services Include & Exclude:</th></tr>
                <tr>
                  <th className="text-center bg-white" style={{width: '50%'}}>Include</th>
                  <th className="text-center bg-white" style={{width: '50%'}}>Exclude</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="font-bold underline mb-1">At Destination</div>
                    <div>* Door delivery with Unloading & Unwrapping of all Goods</div>
                    <div>* One Point delivery</div>
                    <div>* Delivery {form.lift_destination ? 'with lift' : 'via stairs'}.</div>
                  </td>
                  <td>
                    <div className="font-bold underline mb-1">At Destination</div>
                    <div>* Shuttle Service and Long carry</div>
                    <div>* Vehicle Halting</div>
                    <div>* Union / Society / Lift Charges would be additional basis actuals (if applicable)</div>
                    <div>* Handyman Services</div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {form.payment_terms ? (
            <table className="pdf-table text-black">
              <thead>
                <tr><th className="text-left" style={{backgroundColor: '#e5e7eb'}}>Payment Terms and Conditions:</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="text-[9.5px]">
                      {renderRichText(form.payment_terms)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="pdf-table text-black">
              <thead>
                <tr>
                  <th className="text-left" style={{width: '50%', backgroundColor: '#e5e7eb'}}>Business to Consumer Payment Terms and Conditions:</th>
                  <th className="text-left" style={{width: '50%', backgroundColor: '#e5e7eb'}}>Business to Business Payment Terms and Conditions:</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="text-blue-custom">* A 20% advance payment is required to secure the reservation.</div>
                    <div className="text-blue-custom mt-1">* Full payment (100% advance) is required upfront upon commencement of the packaging process.</div>
                    <div className="mt-1">* Payment Option - Cheque / D.D / Credit Card / NEFT / IMPS</div>
                    <div className="text-blue-custom font-bold mt-1">* All payment in favour of M/s: PANYA GLOBAL RELOCATION PVT. LTD.</div>
                  </td>
                  <td>
                    <div className="text-red-custom">* 50% Advance Along with Company Purchase Order.</div>
                    <div className="text-red-custom mt-1">* Payment is due within 7 to 45 days from the date of invoice submission.</div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          <table className="pdf-table text-black">
            <thead>
              <tr>
                <th className="text-center" style={{width: '60%', backgroundColor: '#9cc2e5'}}>Bank Account detail</th>
                <th className="text-center" style={{width: '40%', backgroundColor: '#9cc2e5'}}>UPI ID and QR Code</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{padding: 0, border: 'none'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse', height: '100%'}}>
                    <tbody>
                      <tr><td style={{width: '180px', borderBottom: '1px solid #000'}}>BENEFICIARY NAME</td><td className="text-red-custom" style={{borderBottom: '1px solid #000', borderLeft: '1px solid #000'}}>PANYA GLOBAL RELOCATION PVT. LTD.</td></tr>
                      <tr><td style={{borderBottom: '1px solid #000'}}>ACCOUNT NO.</td><td className="text-red-custom" style={{borderBottom: '1px solid #000', borderLeft: '1px solid #000'}}>336105000210</td></tr>
                      <tr><td style={{borderBottom: '1px solid #000'}}>RTGS / NEFT / IFSC CODE</td><td className="text-red-custom" style={{borderBottom: '1px solid #000', borderLeft: '1px solid #000'}}>ICIC0003361</td></tr>
                      <tr><td style={{borderBottom: '1px solid #000'}}>MICR CODE</td><td className="text-red-custom" style={{borderBottom: '1px solid #000', borderLeft: '1px solid #000'}}>110229018</td></tr>
                      <tr><td style={{borderBottom: '1px solid #000'}}>BANK NAME & BRANCH</td><td className="text-red-custom" style={{borderBottom: '1px solid #000', borderLeft: '1px solid #000'}}>ICICI BANK LTD., SUBHASH NAGAR.</td></tr>
                      <tr><td className="text-blue-custom">Credit card payment link</td><td className="text-[8.5px]" style={{borderLeft: '1px solid #000'}}><a href="https://razorpay.me/@panyaglobal" className="text-blue-600 underline block">https://razorpay.me/@panyaglobal</a><a href="https://payments.cashfree.com/forms/panyaglobal" className="text-blue-600 underline block">https://payments.cashfree.com/forms/panyaglobal</a></td></tr>
                    </tbody>
                  </table>
                </td>
                <td className="text-center align-middle relative p-1">
                  <div className="text-blue-600 text-[8.5px] text-center w-full block mb-1">panyaglobalrelocationprivatelimited.ibz@icici</div>
                  <div className="w-16 h-16 mx-auto mb-1 flex items-center justify-center">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=panyaglobalrelocationprivatelimited.ibz@icici&pn=PanyaGlobal" alt="QR Code" className="w-full h-full object-contain" loading="lazy" decoding="async" />
                  </div>
                  <div className="text-[8px] text-blue-custom text-left border-t border-black pt-1 leading-tight">Note: Bank charges are applicable on payments made by credit card (2 to 3% approximately plus 18% GST)</div>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="pdf-table text-black">
            <thead>
              <tr><th className="bg-gray-200">Carrier's Risk Terms and Conditions:</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="text-blue-custom font-bold">1. Breakage: If due to any reason there is any breakage at the time of loading, unloading and transporter, shipper would not deduct any amount from our payment and all the claim will be settled. by Insurance Co. directly.</div>
                  <div>2. If any breakage will have to make the claim within 48 hours of your shipment reaching destination location.</div>
                  <div>3. Do not get a breakage claim of less than INR 5,000.00</div>
                  <div>4. If you are breakage claim above INR 5,000.00 then INR 5,000.00 processing fees deductions.</div>
                  <div>5. Minimum premium chargeable will be INR 2,500.00</div>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="pdf-table text-black">
            <thead>
              <tr><th className="bg-gray-200">Validity</th></tr>
            </thead>
            <tbody>
              <tr><td>This proposal is valid for 30 days from the date of submission. However, this proposal does not cover any increase in rates due to Government regulations.</td></tr>
            </tbody>
          </table>

          <table className="pdf-table text-black mb-2">
            <thead>
              <tr><th className="bg-gray-200">Other Terms & Conditions</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {form.terms_and_conditions ? (
                    <div className="text-[10px]">
                      {renderRichText(form.terms_and_conditions)}
                    </div>
                  ) : (
                    <>
                      <div>1. We request you to confirm packing dates 3 working days in advance to give you our best services.</div>
                      <div>2. Once the move dates are confirmed to us, should you wish to postponement or cancel the move, please inform us 36 hours in advance else cancellation charges will be applicable.</div>
                      <div>3. All services are provided in accordance with our Business Terms & Conditions. A copy of this is available on request.</div>
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-[10px] text-justify mb-2 mt-1 text-black">
            We hope you find our rates reasonable and look forward to your valued order. Thanking you & assuring you of our professional services at all times.
          </div>

          <div className="text-[10px] text-black">
            <div>Yours Sincerely ,</div>
            <div className="text-blue-800 font-bold">For Panya Global</div>
            <div>Jatin Rai</div>
          </div>

          <div className="mt-2 text-[10px] text-black">
            <div className="font-bold mb-1">Acceptance of Proposal:</div>
            <div>I, we accept the above rates and agree with your terms & conditions.</div>
            
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex"><span className="w-40">Date of Packing Requested:</span> <span className="border-b border-gray-400 w-56 inline-block"></span></div>
              <div className="flex"><span className="w-40">Name & Signature:</span> <span className="border-b border-gray-400 w-56 inline-block"></span></div>
              <div className="flex"><span className="w-40">Date:</span> <span className="border-b border-gray-400 w-56 inline-block"></span></div>
            </div>
          </div>

          <div className="mt-auto flex justify-between items-end pb-2 pt-2 px-2">
            <div className="text-3xl text-blue-500 font-bold tracking-tight"># Relocate Smile.</div>
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-full border-[1.5px] border-blue-800 flex items-center justify-center text-[8px] text-center font-bold text-blue-800 bg-white leading-tight shadow-sm">ISO<br/>9001:2015</div>
              <div className="w-14 h-14 rounded-full border-[1.5px] border-green-600 flex items-center justify-center text-[8px] text-center font-bold text-green-600 bg-white leading-tight shadow-sm">ISO<br/>14001:2015</div>
              <div className="w-14 h-14 bg-orange-400 text-white flex items-center justify-center text-[8px] text-center font-bold p-1 rounded leading-tight shadow-sm">ISO<br/>45001<br/>CERT</div>
            </div>
          </div>
          
        </div>
        
      </div>
    );
  }
);
