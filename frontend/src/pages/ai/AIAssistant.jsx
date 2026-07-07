import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  Mic,
  MicOff,
  Globe,
  Volume2,
  VolumeX,
  Square,
  Play
} from "lucide-react";

import RiderNavbar from "../../components/dashboard/RiderNavbar";
import RiderSidebar from "../../components/dashboard/RiderSidebar";
import LoadingScreen from "../../components/common/LoadingScreen";
import HelperNavbar from "../../components/dashboard/HelperNavbar";
import HelperSidebar from "../../components/dashboard/HelperSidebar";
import api from "../../services/api";
import { getCurrentUser } from "../../services/authService";

export default function AIAssistant() {
  const user = getCurrentUser();
  const messagesEndRef = useRef(null);
  const isHelper = user?.role === "helper";

  const [messages, setMessages] = useState([
    {
      text: "Hello! I am your CareRide AI Assistant. How can I help you today? You can ask me to list available helpers, count helpers, or recommend the best helper for a particular skill.",
      sender: "ai",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Web Speech API States
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState("");
  const [recognitionError, setRecognitionError] = useState("");

  // Text-to-Speech States
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState(null);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeechIndex(null);
    }
  };

  const speakMessage = (text, index = null) => {
    if (!window.speechSynthesis) return;
    
    stopSpeaking();
    
    const isMalayalam = /[\u0D00-\u0D7F]/.test(text);
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = isMalayalam ? "ml-IN" : "en-IN";
    utterance.rate = 1.0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (index !== null) setActiveSpeechIndex(index);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechIndex(null);
    };
    
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsSpeaking(false);
      setActiveSpeechIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking when unmounting
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setInputText(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError("Microphone access is required for voice input.");
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Sync language selection
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = voiceLang;
    }
  }, [voiceLang]);

  const toggleListening = () => {
    setRecognitionError("");
    if (!recognitionRef.current) {
      setRecognitionError("Voice recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setInputText("");
      } catch (err) {
        console.error("Error starting recognition", err);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText("");
    setError("");

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    stopSpeaking();

    // Add user message
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setLoading(true);

    // AI Response Language Routing
    const routingInstruction = "[You are the CareRide AI Assistant. You must detect the user's language and reply in the EXACT SAME LANGUAGE. If the user types in English, reply in English. If the user types in Manglish (Malayalam written in English alphabet), reply in Manglish. If the user types in Malayalam script, reply in Malayalam script.] \n\n";
    const payloadMessage = routingInstruction + userMessage;

    try {
      const response = await api.post("/ai/chat/", { message: payloadMessage });
      const reply = response.data.reply || "I am sorry, I couldn't generate a response.";
      
      setMessages((prev) => {
        const newMessages = [...prev, { text: reply, sender: "ai" }];
        if (!isMuted) {
          // Play speech for the latest message
          speakMessage(reply, newMessages.length - 1);
        }
        return newMessages;
      });
    } catch (err) {
      console.error(err);
      setError("AI assistant encountered an error. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I am having trouble connecting to the servers right now. Please try again later.",
          sender: "ai",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cr-bg to-cr-surface">
      {isHelper ? <HelperNavbar /> : <RiderNavbar />}

      <div className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 py-8 lg:py-12">
        <div className="flex gap-8">
          {isHelper ? <HelperSidebar /> : <RiderSidebar />}

          <main className="flex-1 flex flex-col h-[calc(100vh-140px)] max-h-[800px]">
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-cr-primary flex items-center gap-2">
                <Bot className="text-cr-secondary" />
                CareRide AI Assistant
              </h1>
              <p className="text-cr-accent text-sm mt-1">
                Chat with CareRide AI to find helpers, check availability, or resolve inquiries.
              </p>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-cr-card rounded-[32px] border border-cr-border shadow-xl flex flex-col overflow-hidden">
              {/* Messages Box */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-cr-bg/50">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 max-w-[80%] ${
                      msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                      ${
                        msg.sender === "user"
                          ? "bg-cr-secondary text-white"
                          : msg.isError
                          ? "bg-red-100 text-red-600 border border-red-200"
                          : "bg-cr-card border text-cr-secondary"
                      }`}
                    >
                      {msg.sender === "user" ? <User size={15} /> : <Bot size={15} />}
                    </div>

                    {/* Chat Bubble */}
                    <div className="flex flex-col gap-1">
                      <div
                        className={`p-4 rounded-2xl shadow-sm text-sm border leading-relaxed
                        ${
                          msg.sender === "user"
                            ? "bg-cr-secondary text-white border-cr-secondary rounded-tr-none"
                            : msg.isError
                            ? "bg-red-50 text-red-800 border-red-200 rounded-tl-none"
                            : "bg-cr-card text-cr-primary border-gray-150 rounded-tl-none"
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      
                      {msg.sender === "ai" && !msg.isError && (
                        <div className="flex justify-start mt-1">
                          <button
                            onClick={() => {
                              if (isSpeaking && activeSpeechIndex === index) {
                                stopSpeaking();
                              } else {
                                speakMessage(msg.text, index);
                              }
                            }}
                            disabled={loading}
                            className={`p-1.5 rounded-full flex items-center justify-center transition-colors
                              ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-cr-surface text-cr-accent hover:text-cr-primary"}`}
                            title={isSpeaking && activeSpeechIndex === index ? "Stop speaking" : "Read aloud"}
                          >
                            {isSpeaking && activeSpeechIndex === index ? (
                              <Square size={14} fill="currentColor" />
                            ) : (
                              <Volume2 size={14} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading state */}
                {loading && (
                  <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                    <div className="w-8 h-8 rounded-full bg-cr-card border text-cr-secondary flex items-center justify-center shadow-sm">
                      <Bot size={15} />
                    </div>
                    <div className="bg-cr-card p-4 border border-gray-150 rounded-2xl rounded-tl-none flex items-center justify-center">
                      <motion.svg
                        className="w-[32px] h-[32px] md:w-[44px] md:h-[44px] drop-shadow-sm blur-[0.2px]"
                        viewBox="0 0 50 50"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                      >
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          fill="none"
                          strokeWidth="2.5"
                          className="stroke-[rgba(26,63,117,0.15)] dark:stroke-[rgba(221,234,245,0.18)]"
                        />
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          fill="none"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeDasharray="35 150"
                          className="stroke-[#1A3F75] dark:stroke-[#DDEAF5]"
                        />
                      </motion.svg>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Error Message for Speech API */}
              {recognitionError && (
                <div className="px-6 pt-3 text-sm text-red-500 font-medium">
                  {recognitionError}
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="border-t p-4 bg-cr-card flex flex-col sm:flex-row gap-3 items-center">
                
                {/* Voice Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isMuted && isSpeaking) stopSpeaking();
                      setIsMuted(!isMuted);
                    }}
                    className="p-2.5 rounded-xl border border-cr-border bg-cr-surface text-cr-accent hover:bg-gray-50 transition-colors h-[48px] flex items-center justify-center flex-shrink-0"
                    title={isMuted ? "Unmute Auto-Read" : "Mute Auto-Read"}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>

                  <div className="relative flex items-center bg-cr-surface border border-cr-border rounded-xl px-2 py-2 h-[48px] flex-1 sm:flex-none">
                    <Globe size={16} className="text-cr-accent mr-1 flex-shrink-0" />
                    <select
                      value={voiceLang}
                      onChange={(e) => setVoiceLang(e.target.value)}
                      className="bg-transparent text-sm font-medium text-cr-text-primary focus:outline-none cursor-pointer w-full appearance-none"
                    >
                      <option value="">Auto Detect</option>
                      <option value="en-US">English 🇺🇸</option>
                      <option value="ml-IN">Malayalam 🇮🇳</option>
                    </select>
                  </div>

                  <div className="relative flex items-center justify-center w-[40px] h-[40px] flex-shrink-0">
                    {isListening && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: "rgba(169,199,227,0.35)", boxShadow: "0 0 12px rgba(169,199,227,0.5)" }}
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <motion.button
                      type="button"
                      onClick={toggleListening}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative z-10 w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#1A3F75] text-white shadow-sm transition-colors"
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </motion.button>
                  </div>
                </div>

                {/* Text Input */}
                <input
                  type="text"
                  placeholder={isListening ? "🎤 Listening..." : "Ask CareRide AI (e.g. 'Who is the best helper for walking assistance?')"}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                  className="w-full flex-1 px-4 py-3 min-h-[48px] border border-cr-surface rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cr-secondary bg-white"
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className={`w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 flex-shrink-0
                    ${
                      loading || !inputText.trim()
                        ? "bg-cr-bg text-gray-400 cursor-not-allowed border border-cr-border"
                        : "group bg-cr-primary hover:bg-cr-primary-hover text-white shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)]"
                    }`}
                >
                  <Send size={16} />
                  Send
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
