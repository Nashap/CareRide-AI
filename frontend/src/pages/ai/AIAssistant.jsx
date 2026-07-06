import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  AlertCircle
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText("");
    setError("");

    // Add user message
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setLoading(true);

    try {
      const response = await api.post("/ai/chat/", { message: userMessage });
      const reply = response.data.reply || "I am sorry, I couldn't generate a response.";
      
      setMessages((prev) => [...prev, { text: reply, sender: "ai" }]);
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

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="border-t p-4 bg-cr-card flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Ask CareRide AI (e.g. 'Who is the best helper for walking assistance?')"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                  className="w-full flex-1 px-4 py-3 min-h-[52px] border border-cr-surface rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cr-secondary"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className={`w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2
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
