import { useState, useRef, useEffect } from "react";
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
    <div className="min-h-screen bg-[#F5F0E8]">
      {isHelper ? <HelperNavbar /> : <RiderNavbar />}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-8">
          {isHelper ? <HelperSidebar /> : <RiderSidebar />}

          <main className="flex-1 flex flex-col h-[calc(100vh-140px)] max-h-[800px]">
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Bot className="text-teal-600" />
                CareRide AI Assistant
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Chat with CareRide AI to find helpers, check availability, or resolve inquiries.
              </p>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
              {/* Messages Box */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
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
                          ? "bg-teal-600 text-white"
                          : msg.isError
                          ? "bg-red-100 text-red-600 border border-red-200"
                          : "bg-white border text-teal-600"
                      }`}
                    >
                      {msg.sender === "user" ? <User size={15} /> : <Bot size={15} />}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`p-4 rounded-2xl shadow-sm text-sm border leading-relaxed
                      ${
                        msg.sender === "user"
                          ? "bg-teal-600 text-white border-teal-600 rounded-tr-none"
                          : msg.isError
                          ? "bg-red-50 text-red-800 border-red-200 rounded-tl-none"
                          : "bg-white text-gray-800 border-gray-150 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}

                {/* Loading state */}
                {loading && (
                  <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                    <div className="w-8 h-8 rounded-full bg-white border text-teal-600 flex items-center justify-center shadow-sm">
                      <Bot size={15} />
                    </div>
                    <div className="bg-white text-gray-500 border border-gray-150 px-4 py-3 rounded-2xl rounded-tl-none text-sm flex items-center gap-2">
                      <Loader2 className="animate-spin text-teal-600" size={16} />
                      Thinking...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="border-t p-4 bg-white flex gap-3">
                <input
                  type="text"
                  placeholder="Ask CareRide AI (e.g. 'Who is the best helper for walking assistance?')"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className={`px-5 py-3 rounded-xl font-medium transition flex items-center gap-1.5 shadow-sm
                    ${
                      loading || !inputText.trim()
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border"
                        : "bg-teal-600 hover:bg-teal-700 text-white"
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
