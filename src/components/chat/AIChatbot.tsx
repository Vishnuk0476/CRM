import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Trash2,
  Mic,
  MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Use local PHP API instead of Supabase
const CHAT_API_URL = "/api/ai-chat.php";
const SESSION_KEY = "panya_chat_session";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_REPLIES = [
  {
    label: "Get a Quote",
    message: "I'd like to get a quote for my relocation",
  },
  { label: "Track Shipment", message: "How can I track my shipment?" },
  { label: "Our Services", message: "What services do you offer?" },
  { label: "Contact Info", message: "What are your contact details?" },
];

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Namaste! 🙏 I'm Robin, your Panya Global Relocation assistant. I can help you with quotes, shipment tracking, services info, and any relocation queries. How can I assist you today?",
};

// Notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    // Create a pleasant chime sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Two-tone chime
    oscillator1.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    oscillator2.frequency.setValueAtTime(1108.73, audioContext.currentTime); // C#6

    oscillator1.type = "sine";
    oscillator2.type = "sine";

    // Quick fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.15,
      audioContext.currentTime + 0.05,
    );
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.3);
    oscillator2.stop(audioContext.currentTime + 0.3);
  } catch (error: unknown) {
// console.log removed by production cleanup
  }
};

// Animated typing dots component
const TypingIndicator = () => (
  <div className="flex gap-1 items-center px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-primary rounded-full"
        animate={{
          y: [0, -6, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

interface AIChatbotProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const AIChatbot = ({ forceOpen, onClose }: AIChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);

  // Sync with forceOpen prop
  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  // Handle close with callback
  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  // Get or create session ID
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }, []);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      const sessionId = getSessionId();
      setIsLoadingHistory(true);

      try {
        const formData = new FormData();
        formData.append("action", "history");
        formData.append("session_id", sessionId);

        const response = await fetch(CHAT_API_URL, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success && result.messages && result.messages.length > 0) {
          const historyMessages: Message[] = result.messages.map(
            (m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })
          );
          setMessages([WELCOME_MESSAGE, ...historyMessages]);
        }
      } catch (error: unknown) {
        console.error("Error loading chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [getSessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const clearHistory = async () => {
    const sessionId = getSessionId();

    try {
      const formData = new FormData();
      formData.append("action", "clear");
      formData.append("session_id", sessionId);

      await fetch(CHAT_API_URL, {
        method: "POST",
        body: formData,
      });

      setMessages([WELCOME_MESSAGE]);
    } catch (error: unknown) {
      console.error("Error clearing history:", error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const sessionId = getSessionId();
      const formData = new FormData();
      formData.append("action", "chat");
      formData.append("message", text);
      formData.append("session_id", sessionId);

      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: result.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        playNotificationSound();
      } else {
        throw new Error(result.error || "Failed to get response");
      }
    } catch (error: unknown) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "I apologize, but I'm having trouble responding right now. Please try again or contact us directly at +91 8800446447.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (message: string) => {
    sendMessage(message);
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-IN";

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("");
          setInput(transcript);
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Voice input not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error: unknown) {
        console.error("Error starting speech recognition:", error);
      }
    }
  }, [isListening]);

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[95vw] h-[550px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-[calc(100vw-3rem)]"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Robin - AI Assistant</h3>
                  <p className="text-xs opacity-80">Panya Global • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearHistory}
                  className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                  title="Clear chat history"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <ScrollArea className="p-4">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center h-full">
                    <TypingIndicator />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-end gap-2 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] md:max-w-[75%] px-4 py-2 rounded-2xl ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-accent-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Animated Typing Indicator */}
                    {isLoading &&
                      messages[messages.length - 1]?.role === "user" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2 justify-start"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                          <div className="bg-muted rounded-2xl rounded-bl-md">
                            <TypingIndicator />
                          </div>
                        </motion.div>
                      )}

                    {/* Quick Replies */}
                    {messages.length === 1 && !isLoading && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {QUICK_REPLIES.map((qr, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => handleQuickReply(qr.message)}
                            className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
                          >
                            {qr.label}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isListening ? "Listening..." : "Type or speak..."
                  }
                  className={`flex-1 ${
                    isListening
                      ? "border-primary ring-2 ring-primary/20"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "default" : "outline"}
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={isListening ? "animate-pulse" : ""}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Add type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}
