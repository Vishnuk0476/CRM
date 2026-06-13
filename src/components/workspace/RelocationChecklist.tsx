import { motion } from "framer-motion";
import { FileDown, CheckSquare, Calendar, Users, Server, Package, Truck, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const checklistSections = [
  {
    title: "8-12 Weeks Before",
    icon: Calendar,
    items: [
      "Form a relocation committee",
      "Set budget and timeline",
      "Hire professional movers",
      "Notify employees about the move",
      "Review current lease obligations",
      "Plan new office layout",
    ],
  },
  {
    title: "6-8 Weeks Before",
    icon: ClipboardCheck,
    items: [
      "Conduct IT infrastructure audit",
      "Create detailed inventory list",
      "Order new furniture if needed",
      "Update business address with vendors",
      "Arrange utility transfers",
      "Plan employee communication strategy",
    ],
  },
  {
    title: "4-6 Weeks Before",
    icon: Users,
    items: [
      "Assign packing responsibilities",
      "Label all equipment and boxes",
      "Back up all critical data",
      "Coordinate with IT team",
      "Schedule elevator/loading dock access",
      "Arrange temporary storage if needed",
    ],
  },
  {
    title: "2-4 Weeks Before",
    icon: Package,
    items: [
      "Begin packing non-essential items",
      "Confirm moving schedule",
      "Distribute packing supplies",
      "Update website and marketing materials",
      "Notify clients and partners",
      "Arrange cleaning services",
    ],
  },
  {
    title: "1 Week Before",
    icon: Server,
    items: [
      "Final data backup",
      "Pack personal workstations",
      "Label all cables and connections",
      "Prepare move-day essentials box",
      "Confirm security arrangements",
      "Final walkthrough of new space",
    ],
  },
  {
    title: "Move Day & After",
    icon: Truck,
    items: [
      "Supervise loading and unloading",
      "Verify all items against inventory",
      "Set up critical IT infrastructure",
      "Test all systems and equipment",
      "Conduct new office orientation",
      "Celebrate the successful move!",
    ],
  },
];

const RelocationChecklist = () => {
  const generatePDF = () => {
    // Create printable content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Workspace Relocation Checklist - Panya Global</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #0f4c75; }
          .header h1 { font-size: 28px; color: #0f4c75; margin-bottom: 10px; }
          .header p { color: #666; font-size: 14px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section-title { background: linear-gradient(135deg, #0f4c75, #1a1a2e); color: white; padding: 12px 20px; border-radius: 8px; font-size: 16px; font-weight: 600; margin-bottom: 15px; }
          .checklist { list-style: none; }
          .checklist li { padding: 10px 0; padding-left: 35px; position: relative; border-bottom: 1px dashed #e0e0e0; }
          .checklist li:last-child { border-bottom: none; }
          .checklist li::before { content: '☐'; position: absolute; left: 0; font-size: 18px; color: #0f4c75; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; font-size: 12px; color: #666; }
          .footer strong { color: #0f4c75; }
          .tips { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; }
          .tips h3 { color: #0f4c75; margin-bottom: 10px; font-size: 14px; }
          .tips ul { list-style: disc; padding-left: 20px; font-size: 12px; }
          @media print { body { padding: 20px; } .section { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏢 Workspace Relocation Checklist</h1>
          <p>Your Complete Guide to a Successful Office Move</p>
          <p style="margin-top: 5px; font-size: 12px; color: #999;">Provided by Panya Global Relocation | www.panyaglobal.in</p>
        </div>
        
        ${checklistSections
          .map(
            (section) => `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <ul class="checklist">
              ${section.items.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>
        `,
          )
          .join("")}
        
        <div class="tips">
          <h3>💡 Pro Tips for a Smooth Move</h3>
          <ul>
            <li>Start planning at least 3 months in advance for large offices</li>
            <li>Keep a master inventory list and update it regularly</li>
            <li>Assign a dedicated move coordinator from your team</li>
            <li>Communicate frequently with employees about the timeline</li>
            <li>Have IT test all systems before the first business day</li>
          </ul>
        </div>
        
        <div class="footer">
          <p><strong>Need Professional Help?</strong></p>
          <p>Contact Panya Global Relocation: +91 11 4155 6447| info@panyaglobal.in</p>
          <p style="margin-top: 10px;">© ${new Date().getFullYear()} Panya Global Relocation. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <Card className="border-border/50 bg-card shadow-lg">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-primary" />
          </div>
          Relocation Checklist
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Download our comprehensive checklist to ensure nothing is missed during your workspace move.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {/* Preview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {checklistSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-muted/50 border border-border/50"
            >
              <section.icon className="w-6 h-6 text-secondary mb-2" />
              <h4 className="text-sm font-semibold text-foreground mb-1">{section.title}</h4>
              <p className="text-xs text-muted-foreground">{section.items.length} items</p>
            </motion.div>
          ))}
        </div>

        {/* What's Included */}
        <div className="bg-muted/30 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground mb-3">What's Included:</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-secondary" />
              Complete timeline checklist
            </li>
            <li className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-secondary" />
              IT infrastructure audit guide
            </li>
            <li className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-secondary" />
              Employee communication tips
            </li>
            <li className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-secondary" />
              Move day essentials
            </li>
            <li className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-secondary" />
              Post-move verification steps
            </li>
            <li className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-secondary" />
              Pro tips from experts
            </li>
          </ul>
        </div>

        {/* Download Button */}
        <Button onClick={generatePDF} className="w-full" size="lg">
          <FileDown className="w-5 h-5 mr-2" />
          Download Free Checklist (PDF)
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-3">No email required. Instant download.</p>
      </CardContent>
    </Card>
  );
};

export default RelocationChecklist;
