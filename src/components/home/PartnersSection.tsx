// Import uploaded logos
import daburLogo from "@/assets/clients/dabur.webp";
import hdfcSecurities from "@/assets/clients/hdfc-securities.webp";
import tataLogo from "@/assets/clients/tata.svg";
import nestleLogo from "@/assets/clients/nestle.svg";
import huaweiLogo from "@/assets/clients/huawei.svg";
import pepsiLogo from "@/assets/clients/pepsi.svg";
import itcHotelsLogo from "@/assets/clients/itc-hotels.webp";
import vvfLogo from "@/assets/clients/vvf.webp";
import abdLogo from "@/assets/clients/abd.webp";
import maricoLogo from "@/assets/clients/marico.webp";
import apollo247Logo from "@/assets/clients/apollo247.webp";
import synopsysLogo from "@/assets/clients/synopsys.webp";
import sodexoLogo from "@/assets/clients/sodexo.webp";
import spectraLogo from "@/assets/clients/spectra.webp";
import edifecsLogo from "@/assets/clients/edifecs.svg";
import arisglobalLogo from "@/assets/clients/arisglobal.webp";
import kotakLogo from "@/assets/clients/kotak-securities.webp";
import iciciPrudentialLogo from "@/assets/clients/icici-prudential.webp";
import clubMahindraLogo from "@/assets/clients/club-mahindra.webp";
import amaraLogo from "@/assets/clients/amara.webp";
import innovationIndiaLogo from "@/assets/clients/innovation-india.webp";
import highCourtDelhiLogo from "@/assets/clients/high-court-delhi.webp";
import iihsLogo from "@/assets/clients/iihs.webp";
import greystarLogo from "@/assets/clients/greystar.webp";
import tataPowerLogo from "@/assets/clients/tata-power.webp";
import yesBankLogo from "@/assets/clients/yes-bank.webp";
import itcPapersLogo from "@/assets/clients/itc-papers.webp";
import vendimanLogo from "@/assets/clients/vendiman.webp";
import shoppersStopLogo from "@/assets/clients/shoppers-stop.webp";
import canaraHsbcLogo from "@/assets/clients/canara-hsbc.webp";
import iciciLombardLogo from "@/assets/clients/icici-lombard.webp";
import mankindLogo from "@/assets/clients/mankind.webp";
import sreiLogo from "@/assets/clients/srei.webp";
import delmonteLogo from "@/assets/clients/delmonte.svg";
import cholaLogo from "@/assets/clients/chola.webp";
import mahindraFinanceLogo from "@/assets/clients/mahindra-finance.webp";
import cescLogo from "@/assets/clients/cesc.webp";
import bsesLogo from "@/assets/clients/bses.webp";
import ifcciLogo from "@/assets/clients/Ifcci.webp";

const clients = [
  { name: "IFCCI", src: ifcciLogo },
  { name: "Dabur", src: daburLogo },
  { name: "ITC Hotels", src: itcHotelsLogo },
  { name: "VVF", src: vvfLogo },
  { name: "ABD", src: abdLogo },
  { name: "Marico", src: maricoLogo },
  { name: "Nestle", src: nestleLogo },
  { name: "Apollo 24|7", src: apollo247Logo },
  { name: "Pepsi", src: pepsiLogo },
  { name: "ITC Papers", src: itcPapersLogo },
  { name: "Synopsys", src: synopsysLogo },
  { name: "Sodexo", src: sodexoLogo },
  { name: "Spectra", src: spectraLogo },
  { name: "Huawei", src: huaweiLogo },
  { name: "Edifecs", src: edifecsLogo },
  { name: "ArisGlobal", src: arisglobalLogo },
  { name: "Amara", src: amaraLogo },
  { name: "Innovation India", src: innovationIndiaLogo },
  { name: "HDFC Securities", src: hdfcSecurities },
  { name: "Tata", src: tataLogo },
  { name: "Kotak Securities", src: kotakLogo },
  { name: "ICICI Prudential", src: iciciPrudentialLogo },
  { name: "Yes Bank", src: yesBankLogo },
  { name: "Tata Power", src: tataPowerLogo },
  { name: "ICICI Lombard", src: iciciLombardLogo },
  { name: "Canara HSBC", src: canaraHsbcLogo },
  { name: "Chola", src: cholaLogo },
  { name: "Mahindra Finance", src: mahindraFinanceLogo },
  { name: "SREI", src: sreiLogo },
  { name: "Club Mahindra", src: clubMahindraLogo },
  { name: "High Court of Delhi", src: highCourtDelhiLogo },
  { name: "IIHS", src: iihsLogo },
  { name: "Greystar", src: greystarLogo },
  { name: "Shoppers Stop", src: shoppersStopLogo },
  { name: "Vendiman", src: vendimanLogo },
  { name: "Del Monte", src: delmonteLogo },
  { name: "Mankind", src: mankindLogo },
  { name: "CESC Limited", src: cescLogo },
  { name: "BSES", src: bsesLogo },
];

const logo = (c: typeof clients[number], i: number) => (
  <div
    key={i}
    className="flex-shrink-0 w-32 h-20 md:w-40 md:h-24 bg-background rounded-xl border border-border p-4 flex items-center justify-center hover:border-secondary/40 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300"
  >
    <img
      src={c.src}
      alt={c.name}
      width={120}
      height={60}
      className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
      loading="lazy"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  </div>
);

const PartnersSection = () => {
  const row1 = [...clients, ...clients];
  const row2 = [...clients.slice().reverse(), ...clients.slice().reverse()];

  return (
    <section className="py-12 md:py-16 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <div className="animate-fade-in text-center">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            Trusted By Industry Leaders
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
            Our Corporate Partners & Clients
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Proudly serving Fortune 500 companies, MNCs, and leading Indian enterprises with world-class relocation
            solutions.
          </p>
        </div>
      </div>

      <div className="relative mb-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-muted/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-muted/80 to-transparent z-10 pointer-events-none" />
        <div className="flex items-center gap-8 animate-scroll-left">
          {row1.map((c, i) => logo(c, i))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-muted/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-muted/80 to-transparent z-10 pointer-events-none" />
        <div className="flex items-center gap-8 animate-scroll-right">
          {row2.map((c, i) => logo(c, i))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
