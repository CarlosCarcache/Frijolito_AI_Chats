import React, { useState, useRef, useEffect } from "react";

interface Message {
  sender: "user" | "gemini";
  text: string;
  timestamp: Date;
}

const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "gemini",
      text: "¡Hola! Soy tu asistente de Gemini AI en este entorno Astro + Deno. ¿En qué te puedo ayudar hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://localhost:8000/api/chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    
    // Add user message
    const userMessage: Message = {
      sender: "user",
      text: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Connect to Deno backend
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error en el servidor: ${response.statusText}`);
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          sender: "gemini",
          text: data.response || "No recibí una respuesta válida de Gemini.",
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "gemini",
          text: `⚠️ Error de conexión: No se pudo conectar al servidor de Deno en ${apiUrl}. Asegúrate de que el servidor esté corriendo. Detalle: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header Info */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 mb-2">
          Gemini AI Playground
        </h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Ecosistema moderno e interactivo desarrollado con Astro, React, Tailwind CSS v4 y un backend seguro en Deno.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4 text-white">
          <h3 className="font-semibold text-lg border-b border-white/10 pb-2">Configuración</h3>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              API Endpoint (Deno)
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="http://localhost:8000/api/chat"
            />
          </div>
          <div className="text-xs text-gray-400 mt-2 flex flex-col gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Astro: `http://localhost:4321`
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Deno: `http://localhost:8000`
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">Ideas para probar</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => selectQuickPrompt("Explícame qué es Deno y sus diferencias clave con Node.js en 3 puntos.")}
                className="text-[11px] text-left text-gray-300 hover:text-violet-400 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-500/30 rounded-lg p-2 transition-all duration-200"
              >
                ¿Qué es Deno?
              </button>
              <button
                onClick={() => selectQuickPrompt("Escribe una función de TypeScript para generar respuestas HTTPS seguras.")}
                className="text-[11px] text-left text-gray-300 hover:text-violet-400 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-500/30 rounded-lg p-2 transition-all duration-200"
              >
                TypeScript & HTTPS
              </button>
              <button
                onClick={() => selectQuickPrompt("Crea una adivinanza divertida y explícame la respuesta.")}
                className="text-[11px] text-left text-gray-300 hover:text-violet-400 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-500/30 rounded-lg p-2 transition-all duration-200"
              >
                Adivinanza divertida
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[550px] shadow-2xl relative">
          
          {/* Top chat bar */}
          <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-md shadow-violet-500/20">
                G
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Gemini AI Assistant</h3>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Conectado
                </span>
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                    msg.sender === "user"
                      ? "bg-violet-600 text-white rounded-tr-none font-medium"
                      : "bg-white/10 text-gray-100 border border-white/10 rounded-tl-none font-normal"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      msg.sender === "user" ? "text-violet-200" : "text-gray-400"
                    } text-right`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-gray-100 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2 shadow-lg">
                  <span className="text-gray-400 text-xs">Gemini está pensando</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-300"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-white/5 border-t border-white/10 flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? "Espera a que Gemini responda..." : "Escribe tu pregunta para Gemini..."}
              className="flex-1 bg-black/30 border border-white/10 hover:border-white/20 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold rounded-xl px-5 py-3 text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 transition-all duration-200 shadow-md shadow-violet-500/10 cursor-pointer disabled:cursor-not-allowed"
            >
              Enviar
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
