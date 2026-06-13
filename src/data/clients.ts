// Client logo imports from local assets
import itcHotelsLogo from "@/assets/clients/itc-hotels.webp";
import vvfLogo from "@/assets/clients/vvf.webp";
import abdLogo from "@/assets/clients/abd.webp";
import maricoLogo from "@/assets/clients/marico.webp";
import apollo247Logo from "@/assets/clients/apollo247.webp";
import synopsysLogo from "@/assets/clients/synopsys.webp";
import sodexoLogo from "@/assets/clients/sodexo.webp";
import spectraLogo from "@/assets/clients/spectra.webp";
import edifecsSvg from "@/assets/clients/edifecs.svg";
import arisglobalLogo from "@/assets/clients/arisglobal.webp";
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
import delmonteSvg from "@/assets/clients/delmonte.svg";
import cholaLogo from "@/assets/clients/chola.webp";
import mahindraFinanceLogo from "@/assets/clients/mahindra-finance.webp";
import nestleSvg from "@/assets/clients/nestle.svg";
import pepsiSvg from "@/assets/clients/pepsi.svg";
import daburLogo from "@/assets/clients/dabur.webp";
import hdfcSecuritiesLogo from "@/assets/clients/hdfc-securities.webp";
import kotakSecuritiesLogo from "@/assets/clients/kotak-securities.webp";
import tataSvg from "@/assets/clients/tata.svg";
import huaweiSvg from "@/assets/clients/huawei.svg";
// New logos
import poonawallaFincorpLogo from "@/assets/clients/poonawalla-fincorp.webp";
import sbiSecuritiesLogo from "@/assets/clients/sbi-securities.webp";
import shriramLogo from "@/assets/clients/shriram.webp";
import rpSanjivGoenkaLogo from "@/assets/clients/rp-sanjiv-goenka.webp";
import cescLogo from "@/assets/clients/cesc.webp";
import esmeLogo from "@/assets/clients/esme.webp";
import bsesLogo from "@/assets/clients/bses.webp";
import diverseyLogo from "@/assets/clients/diversey.webp";

export interface Client {
  name: string;
  image: string;
  industry: string;
  caseStudy?: {
    title: string;
    description: string;
    stats: { label: string; value: string }[];
  };
}

export const clients: Client[] = [
  // IT & Technology
  {
    name: "Synopsys",
    image: synopsysLogo,
    industry: "IT & Technology",
    caseStudy: {
      title: "Global EDA Company Relocation",
      description: "Successfully relocated Synopsys's design center with specialized handling of sensitive semiconductor equipment and secure data room setup.",
      stats: [
        { label: "Workstations", value: "500+" },
        { label: "Data Security", value: "100%" },
        { label: "Downtime", value: "0 hrs" },
      ],
    },
  },
  {
    name: "Edifecs",
    image: edifecsSvg,
    industry: "IT & Technology",
    caseStudy: {
      title: "Healthcare IT Office Setup",
      description: "Complete office relocation for Edifecs's India development center with secure server room migration.",
      stats: [
        { label: "Servers Moved", value: "200+" },
        { label: "Employees", value: "300+" },
        { label: "Compliance", value: "HIPAA" },
      ],
    },
  },
  {
    name: "ArisGlobal",
    image: arisglobalLogo,
    industry: "IT & Technology",
  },
  {
    name: "Huawei",
    image: huaweiSvg,
    industry: "IT & Technology",
    caseStudy: {
      title: "Telecom Lab Equipment Relocation",
      description: "Specialized handling and relocation of sensitive 5G testing equipment across multiple facilities.",
      stats: [
        { label: "Lab Equipment", value: "1000+" },
        { label: "Calibration", value: "100%" },
        { label: "Cities", value: "5" },
      ],
    },
  },
  {
    name: "Spectra",
    image: spectraLogo,
    industry: "IT & Technology",
  },

  // Banking & Finance
  {
    name: "HDFC Securities",
    image: hdfcSecuritiesLogo,
    industry: "Banking & Finance",
    caseStudy: {
      title: "Financial Services Branch Network",
      description: "Relocated 25+ HDFC Securities branches across North India with complete IT infrastructure and secure document handling.",
      stats: [
        { label: "Branches", value: "25+" },
        { label: "Assets Value", value: "₹5Cr+" },
        { label: "On-Time", value: "100%" },
      ],
    },
  },
  {
    name: "ICICI Prudential",
    image: iciciPrudentialLogo,
    industry: "Banking & Finance",
    caseStudy: {
      title: "Insurance Office Consolidation",
      description: "Managed end-to-end relocation of multiple ICICI Prudential branch offices with complete documentation.",
      stats: [
        { label: "Offices", value: "15+" },
        { label: "Employees", value: "800+" },
        { label: "Documents", value: "50,000+" },
      ],
    },
  },
  {
    name: "ICICI Lombard",
    image: iciciLombardLogo,
    industry: "Banking & Finance",
  },
  {
    name: "Yes Bank",
    image: yesBankLogo,
    industry: "Banking & Finance",
  },
  {
    name: "Kotak Securities",
    image: kotakSecuritiesLogo,
    industry: "Banking & Finance",
  },
  {
    name: "Canara HSBC",
    image: canaraHsbcLogo,
    industry: "Banking & Finance",
  },
  {
    name: "Cholamandalam",
    image: cholaLogo,
    industry: "Banking & Finance",
  },
  {
    name: "Mahindra Finance",
    image: mahindraFinanceLogo,
    industry: "Banking & Finance",
  },
  {
    name: "SREI",
    image: sreiLogo,
    industry: "Banking & Finance",
  },
  {
    name: "Poonawalla Fincorp",
    image: poonawallaFincorpLogo,
    industry: "Banking & Finance",
  },
  {
    name: "SBI Securities",
    image: sbiSecuritiesLogo,
    industry: "Banking & Finance",
  },
  {
    name: "Shriram Finance",
    image: shriramLogo,
    industry: "Banking & Finance",
  },

  // FMCG
  {
    name: "Nestlé",
    image: nestleSvg,
    industry: "FMCG",
    caseStudy: {
      title: "Regional Office Expansion",
      description: "Supported Nestlé's expansion with seamless relocation of regional headquarters including sensitive food-grade equipment.",
      stats: [
        { label: "Offices", value: "8" },
        { label: "Timeline", value: "4 weeks" },
        { label: "Success", value: "100%" },
      ],
    },
  },
  {
    name: "PepsiCo",
    image: pepsiSvg,
    industry: "FMCG",
  },
  {
    name: "ITC Hotels",
    image: itcHotelsLogo,
    industry: "FMCG",
  },
  {
    name: "ITC Papers",
    image: itcPapersLogo,
    industry: "FMCG",
  },
  {
    name: "Dabur",
    image: daburLogo,
    industry: "FMCG",
    caseStudy: {
      title: "Manufacturing Unit Relocation",
      description: "Complete relocation of Dabur's manufacturing equipment and inventory to new facility with minimal production disruption.",
      stats: [
        { label: "Equipment", value: "200+" },
        { label: "Downtime", value: "48 hrs" },
        { label: "Damage", value: "0%" },
      ],
    },
  },
  {
    name: "Marico",
    image: maricoLogo,
    industry: "FMCG",
  },
  {
    name: "Del Monte",
    image: delmonteSvg,
    industry: "FMCG",
  },
  {
    name: "VVF",
    image: vvfLogo,
    industry: "FMCG",
  },
  {
    name: "Diversey",
    image: diverseyLogo,
    industry: "FMCG",
  },

  // Pharma & Healthcare
  {
    name: "Apollo 24/7",
    image: apollo247Logo,
    industry: "Pharma & Healthcare",
    caseStudy: {
      title: "Healthcare Tech Relocation",
      description: "Specialized handling of medical equipment and IT infrastructure for Apollo's digital health platform.",
      stats: [
        { label: "Equipment", value: "150+" },
        { label: "Data Centers", value: "2" },
        { label: "Compliance", value: "HIPAA" },
      ],
    },
  },
  {
    name: "Mankind Pharma",
    image: mankindLogo,
    industry: "Pharma & Healthcare",
  },
  {
    name: "ESME",
    image: esmeLogo,
    industry: "Pharma & Healthcare",
  },

  // Manufacturing & Energy
  {
    name: "Tata Power",
    image: tataPowerLogo,
    industry: "Manufacturing",
    caseStudy: {
      title: "Industrial Equipment Relocation",
      description: "Heavy machinery and industrial equipment relocation for Tata Power's new facility with specialized rigging solutions.",
      stats: [
        { label: "Heavy Machines", value: "75+" },
        { label: "Weight", value: "500T" },
        { label: "Safety", value: "100%" },
      ],
    },
  },
  {
    name: "Tata Group",
    image: tataSvg,
    industry: "Manufacturing",
  },
  {
    name: "RP-Sanjiv Goenka",
    image: rpSanjivGoenkaLogo,
    industry: "Manufacturing",
    caseStudy: {
      title: "Conglomerate Office Relocation",
      description: "Multi-location corporate office relocation for RP-Sanjiv Goenka Group companies across India.",
      stats: [
        { label: "Offices", value: "12" },
        { label: "Employees", value: "2000+" },
        { label: "Cities", value: "6" },
      ],
    },
  },
  {
    name: "CESC",
    image: cescLogo,
    industry: "Manufacturing",
  },
  {
    name: "BSES",
    image: bsesLogo,
    industry: "Manufacturing",
  },

  // Hospitality & Services
  {
    name: "Club Mahindra",
    image: clubMahindraLogo,
    industry: "Hospitality",
    caseStudy: {
      title: "Resort Furniture & Equipment Move",
      description: "Complete interior and equipment relocation for multiple Club Mahindra resort renovations.",
      stats: [
        { label: "Resorts", value: "8" },
        { label: "Items", value: "10,000+" },
        { label: "Damage", value: "0%" },
      ],
    },
  },
  {
    name: "Sodexo",
    image: sodexoLogo,
    industry: "Hospitality",
  },
  {
    name: "Greystar",
    image: greystarLogo,
    industry: "Hospitality",
  },
  {
    name: "Amara Hotels",
    image: amaraLogo,
    industry: "Hospitality",
  },
  {
    name: "Vendiman",
    image: vendimanLogo,
    industry: "Hospitality",
  },

  // Retail
  {
    name: "Shoppers Stop",
    image: shoppersStopLogo,
    industry: "Retail",
    caseStudy: {
      title: "Retail Store Relocation",
      description: "Complete store fit-out and inventory relocation for Shoppers Stop's new flagship locations.",
      stats: [
        { label: "Stores", value: "5" },
        { label: "SKUs Moved", value: "50,000+" },
        { label: "On-Time", value: "100%" },
      ],
    },
  },
  {
    name: "ABD Group",
    image: abdLogo,
    industry: "Retail",
  },

  // Education & Research
  {
    name: "IIHS",
    image: iihsLogo,
    industry: "Education",
    caseStudy: {
      title: "Research Institute Relocation",
      description: "Specialized relocation of IIHS research labs and archival materials with climate-controlled transport.",
      stats: [
        { label: "Archives", value: "5,000+" },
        { label: "Lab Equipment", value: "200+" },
        { label: "Preservation", value: "100%" },
      ],
    },
  },
  {
    name: "Innovation India",
    image: innovationIndiaLogo,
    industry: "Education",
  },

  // Government
  {
    name: "Delhi High Court",
    image: highCourtDelhiLogo,
    industry: "Government",
    caseStudy: {
      title: "Judicial Records Migration",
      description: "Secure handling and relocation of sensitive court records and archival documents with complete chain of custody.",
      stats: [
        { label: "Records", value: "100,000+" },
        { label: "Security", value: "100%" },
        { label: "Compliance", value: "Gov" },
      ],
    },
  },
];

export const getClientsByIndustry = (industry: string): Client[] => {
  if (industry === "all") return clients;
  
  const industryMap: Record<string, string> = {
    it: "IT & Technology",
    banking: "Banking & Finance",
    fmcg: "FMCG",
    pharma: "Pharma & Healthcare",
    manufacturing: "Manufacturing",
    hospitality: "Hospitality",
    retail: "Retail",
    education: "Education",
    government: "Government",
  };

  return clients.filter(client => client.industry === industryMap[industry]);
};

export const industries = [
  { id: "all", label: "All Industries", count: clients.length },
  { id: "it", label: "IT & Technology", count: clients.filter(c => c.industry === "IT & Technology").length },
  { id: "banking", label: "Banking & Finance", count: clients.filter(c => c.industry === "Banking & Finance").length },
  { id: "fmcg", label: "FMCG", count: clients.filter(c => c.industry === "FMCG").length },
  { id: "pharma", label: "Pharma & Healthcare", count: clients.filter(c => c.industry === "Pharma & Healthcare").length },
  { id: "manufacturing", label: "Manufacturing", count: clients.filter(c => c.industry === "Manufacturing").length },
  { id: "hospitality", label: "Hospitality", count: clients.filter(c => c.industry === "Hospitality").length },
  { id: "retail", label: "Retail", count: clients.filter(c => c.industry === "Retail").length },
  { id: "education", label: "Education", count: clients.filter(c => c.industry === "Education").length },
  { id: "government", label: "Government", count: clients.filter(c => c.industry === "Government").length },
];
