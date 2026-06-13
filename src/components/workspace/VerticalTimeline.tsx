import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeadphonesIcon, ClipboardList, Server, Package, Truck, Building, FileCheck, CheckCircle2 } from "lucide-react";

const processSteps = [
  {
    step: 1,
    title: "Initial Consultation",
    description:
      "We assess your workspace, understand your requirements, and create a customized relocation plan tailored to your business needs.",
    icon: HeadphonesIcon,
    duration: "1-2 Days",
    color: "from-blue-500 to-blue-600",
  },
  {
    step: 2,
    title: "Site Survey & Planning",
    description:
      "Detailed survey of both locations, comprehensive inventory assessment, and meticulous logistics planning.",
    icon: ClipboardList,
    duration: "2-3 Days",
    color: "from-purple-500 to-purple-600",
  },
  {
    step: 3,
    title: "IT Infrastructure Audit",
    description:
      "Complete audit of IT assets, network infrastructure, and data migration requirements with our certified technicians.",
    icon: Server,
    duration: "1-2 Days",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    step: 4,
    title: "Packing & Labeling",
    description:
      "Professional packing with our detailed labeling system ensures organized, efficient unpacking at your new location.",
    icon: Package,
    duration: "2-5 Days",
    color: "from-pink-500 to-pink-600",
  },
  {
    step: 5,
    title: "Secure Transportation",
    description:
      "GPS-tracked vehicles, climate control for sensitive equipment, and real-time updates throughout the journey.",
    icon: Truck,
    duration: "1-2 Days",
    color: "from-orange-500 to-orange-600",
  },
  {
    step: 6,
    title: "Unpacking & Setup",
    description:
      "Systematic unpacking, furniture assembly, IT setup, and workspace configuration exactly as you planned.",
    icon: Building,
    duration: "2-4 Days",
    color: "from-teal-500 to-teal-600",
  },
  {
    step: 7,
    title: "Quality Verification",
    description: "Complete walkthrough, equipment testing, functionality checks, and client sign-off for satisfaction.",
    icon: FileCheck,
    duration: "1 Day",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    step: 8,
    title: "Post-Move Support",
    description: "30-day support period for any adjustments, issues, or additional requirements that may arise.",
    icon: CheckCircle2,
    duration: "30 Days",
    color: "from-green-500 to-green-600",
  },
];

const HorizontalTimeline = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % processSteps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleStepClick = (index) => {
    setActiveStep(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            className="text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Our Process
          </motion.h1>
          <motion.p
            className="text-xl text-blue-400 font-semibold mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            8-Step Relocation Journey
          </motion.p>
          <motion.p
            className="text-gray-400 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            A proven process that ensures your workspace relocation is smooth, efficient, and stress-free.
          </motion.p>
        </div>

        {/* Horizontal Timeline */}
        <div className="mb-12 overflow-x-auto pb-8" ref={containerRef}>
          <div className="relative min-w-max px-8">
            {/* Horizontal Line */}
            <div className="absolute top-12 left-0 right-0 h-1 bg-slate-700" />

            {/* Active Progress Line */}
            <motion.div
              className="absolute top-12 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{
                width: `${((activeStep + 1) / processSteps.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Timeline Steps */}
            <div className="flex justify-between items-start relative" style={{ minWidth: "1400px" }}>
              {processSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className="flex flex-col items-center relative"
                    style={{ width: "160px" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Step Circle */}
                    <motion.div
                      className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                        activeStep === index
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50"
                          : index < activeStep
                            ? "bg-gradient-to-br from-green-500 to-green-600"
                            : "bg-slate-700"
                      }`}
                      animate={{
                        scale: activeStep === index ? 1.1 : 1,
                      }}
                    >
                      {index < activeStep ? (
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      ) : (
                        <IconComponent className="w-12 h-12 text-white" />
                      )}
                    </motion.div>

                    {/* Step Number Badge */}
                    <div
                      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        activeStep === index ? "bg-blue-500 text-white" : "bg-slate-600 text-gray-300"
                      }`}
                    >
                      {step.step}
                    </div>

                    {/* Step Info */}
                    <div className="text-center">
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          activeStep === index ? "text-blue-400" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.duration}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700"
          >
            {/* Background Glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${processSteps[activeStep].color} opacity-5 rounded-2xl`}
            />

            <div className="relative z-10">
              {/* Step Badge */}
              <div className="flex items-center gap-4 mb-6">
                {(() => {
                  const IconComponent = processSteps[activeStep].icon;
                  return (
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${processSteps[activeStep].color} flex items-center justify-center`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  );
                })()}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Step {processSteps[activeStep].step} of 8</div>
                  <h3 className="text-2xl font-bold text-white">{processSteps[activeStep].title}</h3>
                </div>
              </div>

              {/* Duration Badge */}
              <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 text-sm font-semibold mb-4">
                Duration: {processSteps[activeStep].duration}
              </div>

              {/* Description */}
              <p className="text-gray-300 text-lg leading-relaxed mb-6">{processSteps[activeStep].description}</p>

              {/* Progress Indicator */}
              <div className="flex gap-2 mb-4">
                {processSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1 flex-1 rounded-full ${index <= activeStep ? "bg-blue-500" : "bg-slate-700"}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>

              {/* Auto-play indicator */}
              <div className="text-center text-sm text-gray-500 mt-4">
                {isAutoPlaying ? "Auto-playing" : "Paused - Click a step to resume"}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HorizontalTimeline;
