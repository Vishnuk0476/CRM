import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Phone } from "lucide-react";

interface FloatingChatWidgetProps {
  onOpenChatbot?: () => void;
}

const FloatingChatWidget = ({ onOpenChatbot }: FloatingChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false); // For Modal
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For Speed Dial Menu
  const [isVisible, setIsVisible] = useState(false); // Control initial render

  const agentName = "Panya Global Relocation";
  const agentRole = "Support Team";
  const agentAvatar =
    "https://imgs.search.brave.com/FWrwzu7Yk1bgAOwDMX6d12yYzf8cHGTw0ow02jdL5kw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRpYS5nZXR0eWltYWdlcy5jb20vaWQvMTMzMDI3NDU2MS92ZWN0b3IvZmVtYWxlLWF2YXRhci1pY29uLmpwZz9zPTYxMng2MTImdz0wJms9MjAmYz1ZZFFJZkFMa0xNV25YRzAtWFpFY2NoQ2pWbmFqZUg1bEdTYVBCeVFBSTB3PQ";

  const whatsappNumber = "918800890802";
  const messengerUrl = "https://m.me/yourpage";
  const emailAddress = "info@panyaglobal.com";

  // Variables for buttons
  const LANDLINE_TEL = `tel:+${whatsappNumber}`;
  const WHATSAPP_TEL = `https://wa.me/${whatsappNumber}`;

  // Delay initial render to prevent layout shift on page load
  useEffect(() => {
    // Small delay to prevent blocking initial paint
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // REMOVED: Auto-open timer that was causing performance issues
  // Old code: setTimeout(() => setIsOpen(true), 10000);
  // This was blocking the main thread and causing poor LCP

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "Hello! I would like to inquire about your relocation services.",
    );
    window.open(`${WHATSAPP_TEL}?text=${message}`, "_blank");
  };

  const handleMessenger = () => {
    window.open(messengerUrl, "_blank");
  };

  const handleEmail = () => {
    window.location.href = `mailto:${emailAddress}`;
  };

  if (!isVisible) {
    return null; // Don't render until after initial paint
  }

  return (
    <>
      {/* RIGHT SIDE: Floating Action Button Group (Speed Dial) */}
      {/* Hover group logic: Mouse enter opens menu, mouse leave closes it */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3"
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        {/* 1. Main Sky Blue Chat Button (Trigger) */}
        <motion.button
          // On click: Toggle menu (for mobile) AND Open Chat Modal
          onClick={() => {
            // Toggle menu for touch devices
            setIsMenuOpen(!isMenuOpen);
            // Open Chat Modal
            setIsOpen(true);
          }}
          className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all relative group z-20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.5,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          aria-label="Open Chat"
        >
          <MessageCircle
            className="w-9 h-9 text-white drop-shadow-md"
            strokeWidth={2.5}
          />
          <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20" />
        </motion.button>

        {/* 2. Phone Button (Secondary - Appears on Hover) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.a
              href={LANDLINE_TEL}
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-14 h-14 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-900 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Call us"
            >
              <Phone className="w-6 h-6" />
            </motion.a>
          )}
        </AnimatePresence>

        {/* 3. WhatsApp Button (Secondary - Appears on Hover) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.a
              href={`${WHATSAPP_TEL}?text=Hello! I would like to inquire about your relocation services.`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.5 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.05,
              }}
              className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-[#20bd5a] transition-colors relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Chat on WhatsApp"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 text-white fill-current"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
            </motion.a>
          )}
        </AnimatePresence>

        {/* 4. AI Chat Button (Opens AIChatbot) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.button
              onClick={() => {
                setIsMenuOpen(false);
                onOpenChatbot?.(); // THIS OPENS AI CHATBOT
              }}
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.5 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Chat with AI"
              title="Chat with AI Assistant"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 50, y: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 50, y: 50 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-48 right-6 z-50 w-[350px] md:w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 p-6 relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-5 right-5 text-white/90 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all duration-200"
                  aria-label="Close chat modal"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-4 pr-10">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-3 border-white bg-white shadow-lg overflow-hidden">
                      <img 
                        src={agentAvatar}
                        alt={agentName}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-[3px] border-white shadow-md" />
                  </div>

                  <div className="text-white">
                    <h3 className="font-bold text-xl leading-tight mb-0.5">
                      {agentName}
                    </h3>
                    <p className="text-sm text-white/95 font-medium">
                      {agentRole}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center mb-5">
                  <span className="inline-block text-xs text-gray-600 bg-gray-200/80 px-4 py-1.5 rounded-full font-medium shadow-sm">
                    {getCurrentTime()}
                  </span>
                </div>

                <div className="flex items-start gap-3.5 mb-7">
                  <div className="w-11 h-11 rounded-full border-2 border-gray-200 flex-shrink-0 shadow-sm overflow-hidden bg-white">
                    <img 
                      src={agentAvatar} 
                      alt={agentName}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async" 
                    />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-4 shadow-md flex-1 max-w-[280px]">
                    <p className="text-gray-800 text-[15px] leading-relaxed font-normal">
                      Hello 👋 How may we help you? Just send us a message now
                      to get assistance.
                    </p>
                  </div>
                </div>

                <div className="text-center mb-5">
                  <h4 className="font-bold text-gray-900 text-[17px] tracking-tight">
                    Start Chat with:
                  </h4>
                </div>

                <div className="flex justify-center items-center gap-5 pb-1">
                  <motion.button
                    onClick={handleWhatsApp}
                    className="w-[60px] h-[60px] bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all relative group"
                    whileHover={{ scale: 1.12, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    title="WhatsApp"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-8 h-8 text-white fill-current drop-shadow-sm"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-0 group-hover:opacity-25 group-hover:animate-ping" />
                  </motion.button>

                  <motion.button
                    onClick={handleMessenger}
                    className="w-[60px] h-[60px] bg-gradient-to-br from-[#00B2FF] to-[#006AFF] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all relative group"
                    whileHover={{ scale: 1.12, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    title="Messenger"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-8 h-8 text-white fill-current drop-shadow-sm"
                    >
                      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.896 1.445 5.482 3.707 7.17V22l3.46-1.897c.923.256 1.901.394 2.833.394 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm.993 12.535l-2.549-2.71-4.969 2.71 5.467-5.798 2.611 2.71 4.907-2.71-5.467 5.798z" />
                    </svg>
                    <span className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-25 group-hover:animate-ping" />
                  </motion.button>

                  <motion.button
                    onClick={handleEmail}
                    className="w-[60px] h-[60px] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all relative group"
                    whileHover={{ scale: 1.12, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    title="Email"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-8 h-8 text-white fill-current drop-shadow-sm"
                    >
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-25 group-hover:animate-ping" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatWidget;
