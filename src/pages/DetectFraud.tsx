import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Search, CheckCircle, XCircle, AlertTriangle, Phone, Mail, User, FileText, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";

const fraudIndicators = [
  "Extremely low quotes compared to market rates",
  "Demanding large cash payments upfront",
  "No physical office address or visit",
  "Unprofessional or no branded vehicles",
  "No proper documentation or contract",
  "Threatening to hold goods hostage",
  "No insurance coverage offered",
  "Unverified or fake reviews",
];

const DetectFraud = () => {
  const { toast } = useToast();
  const [verifyData, setVerifyData] = useState({
    companyName: "",
    registrationNo: "",
    phoneNumber: "",
  });
  const [reportData, setReportData] = useState({
    name: "",
    email: "",
    phone: "",
    fraudCompany: "",
    description: "",
  });
  const [verificationResult, setVerificationResult] = useState<{
    status: "verified" | "unverified" | "suspicious" | null;
    message: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<"verify" | "report">("verify");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    // Simulate verification
    setTimeout(() => {
      const randomResult = Math.random();
      if (verifyData.companyName.toLowerCase().includes("panya")) {
        setVerificationResult({
          status: "verified",
          message: "This is an authorized Panya Global Relocation company. You are safe to proceed.",
        });
      } else if (randomResult > 0.5) {
        setVerificationResult({
          status: "suspicious",
          message: "We couldn't verify this company. Please contact us directly before proceeding.",
        });
      } else {
        setVerificationResult({
          status: "unverified",
          message: "This company is not in our verified database. Exercise caution.",
        });
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Report Submitted",
      description: "Thank you for helping us fight fraud. Our team will investigate and contact you.",
    });
    setReportData({
      name: "",
      email: "",
      phone: "",
      fraudCompany: "",
      description: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-destructive/20 rounded-full px-4 py-2 mb-6">
                <ShieldAlert className="w-4 h-4 text-destructive" />
                <span className="text-primary-foreground text-sm font-medium">Fraud Protection</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                Detect <span className="text-secondary">Fraud</span>
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Protect yourself from moving scams. Verify companies and report fraudulent activities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Warning Indicators */}
        <section className="py-12 bg-destructive/5 border-y border-destructive/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-xl font-bold text-foreground mb-6 text-center">
                <AlertTriangle className="w-5 h-5 inline mr-2 text-destructive" />
                Warning Signs of Moving Fraud
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {fraudIndicators.map((indicator, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 p-4 bg-card rounded-lg border border-border"
                  >
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{indicator}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {/* Tab Buttons */}
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => setActiveTab("verify")}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                    activeTab === "verify"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Search className="w-5 h-5 inline mr-2" />
                  Verify Company
                </button>
                <button
                  onClick={() => setActiveTab("report")}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                    activeTab === "report"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ShieldAlert className="w-5 h-5 inline mr-2" />
                  Report Fraud
                </button>
              </div>

              {/* Verify Tab */}
              {activeTab === "verify" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border"
                >
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                    Verify a Moving Company
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Enter the company details to check if they are legitimate
                  </p>

                  <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
                        <Building2 className="w-4 h-4 inline mr-2" />
                        Company Name *
                      </label>
                      <Input
                        id="companyName"
                        value={verifyData.companyName}
                        onChange={(e) => setVerifyData({ ...verifyData, companyName: e.target.value })}
                        placeholder="Enter company name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="registrationNo" className="block text-sm font-medium text-foreground mb-2">
                          <FileText className="w-4 h-4 inline mr-2" />
                          Registration / GST No.
                        </label>
                        <Input
                          id="registrationNo"
                          value={verifyData.registrationNo}
                          onChange={(e) => setVerifyData({ ...verifyData, registrationNo: e.target.value })}
                          placeholder="e.g., 07AAACP1234C1Z5"
                        />
                      </div>
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </label>
                        <Input
                          id="phoneNumber"
                          value={verifyData.phoneNumber}
                          onChange={(e) => setVerifyData({ ...verifyData, phoneNumber: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isVerifying || !verifyData.companyName}>
                      {isVerifying ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Verify Company
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Verification Result */}
                  {verificationResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`mt-8 p-6 rounded-xl border-2 ${
                        verificationResult.status === "verified"
                          ? "bg-secondary/10 border-secondary"
                          : verificationResult.status === "suspicious"
                          ? "bg-accent/10 border-accent"
                          : "bg-destructive/10 border-destructive"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {verificationResult.status === "verified" ? (
                          <CheckCircle className="w-8 h-8 text-secondary flex-shrink-0" />
                        ) : verificationResult.status === "suspicious" ? (
                          <AlertTriangle className="w-8 h-8 text-accent flex-shrink-0" />
                        ) : (
                          <XCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                        )}
                        <div>
                          <h3 className={`font-semibold text-lg ${
                            verificationResult.status === "verified"
                              ? "text-secondary"
                              : verificationResult.status === "suspicious"
                              ? "text-accent"
                              : "text-destructive"
                          }`}>
                            {verificationResult.status === "verified" ? "Verified Company" : 
                             verificationResult.status === "suspicious" ? "Suspicious" : "Not Verified"}
                          </h3>
                          <p className="text-foreground mt-1">{verificationResult.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Report Tab */}
              {activeTab === "report" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-8 shadow-lg border border-border"
                >
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                    Report Fraudulent Activity
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Help us protect others by reporting scams and fraudulent movers
                  </p>

                  <form onSubmit={handleReport} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="reportName" className="block text-sm font-medium text-foreground mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Your Name *
                        </label>
                        <Input
                          id="reportName"
                          value={reportData.name}
                          onChange={(e) => setReportData({ ...reportData, name: e.target.value })}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="reportPhone" className="block text-sm font-medium text-foreground mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number *
                        </label>
                        <Input
                          id="reportPhone"
                          value={reportData.phone}
                          onChange={(e) => setReportData({ ...reportData, phone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reportEmail" className="block text-sm font-medium text-foreground mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address *
                      </label>
                      <Input
                        id="reportEmail"
                        type="email"
                        value={reportData.email}
                        onChange={(e) => setReportData({ ...reportData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="fraudCompany" className="block text-sm font-medium text-foreground mb-2">
                        <Building2 className="w-4 h-4 inline mr-2" />
                        Fraudulent Company Name *
                      </label>
                      <Input
                        id="fraudCompany"
                        value={reportData.fraudCompany}
                        onChange={(e) => setReportData({ ...reportData, fraudCompany: e.target.value })}
                        placeholder="Name of the fraudulent company"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Describe the Fraud *
                      </label>
                      <Textarea
                        id="description"
                        value={reportData.description}
                        onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                        placeholder="Please provide details about what happened..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" variant="destructive" className="w-full">
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Submit Report
                    </Button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                Need Immediate Help?
              </h2>
              <p className="text-muted-foreground mb-6">
                If you believe you're a victim of moving fraud, contact us immediately.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="tel:+918800446447">
                  <Button variant="outline" className="gap-2">
                    <Phone className="w-4 h-4" />
                    +91 8800446447
                  </Button>
                </a>
                <a href="mailto:support@panyaglobalmovers.com">
                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    support@panyaglobalmovers.com
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default DetectFraud;
