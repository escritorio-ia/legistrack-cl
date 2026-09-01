import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2, 
  Trash2, 
  Copy, 
  Check, 
  HelpCircle,
  BookOpen,
  Scale,
  Clock,
  ChevronDown
} from "lucide-react";
import { CopilotMessage } from "../types";

interface CopilotoLegislativoProps {
  contextoBoletin?: string;
  contextoComision?: string;
}

export default function CopilotoLegislativo({ contextoBoletin, contextoComision }: CopilotoLegislativoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: `👋 ¡Hola! Soy el **Copiloto Legislativo** de LegisTrack CL.

Puedo ayudarte a resolver dudas sobre la tramitación de proyectos de ley, quórums constitucionales, citaciones de comisiones o explicar normas técnicas en lenguaje ciudadano.

${contextoBoletin ? `📌 Actualmente estás consultando el **Boletín ${contextoBoletin}**.` : ""}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sugerencias: [
        "¿Qué quórum constitucional se requiere para aprobar este proyecto?",
        "¿Cuáles son los plazos según la urgencia vigente?",
        "Explícame este boletín en lenguaje ciudadano"
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copiloto/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: query,
          contextoBoletin,
          contextoComision,
          historial: messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      const data = await res.json();
      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.respuesta || "No se pudo generar respuesta.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sugerencias: data.sugerencias || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "⚠️ No fue posible conectar con el servicio de IA en este momento. Por favor reintenta en unos instantes.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "msg-reset",
        role: "assistant",
        content: "Historial de conversación reiniciado. ¿En qué puedo orientarte ahora?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sugerencias: [
          "¿Cómo se aprueba una reforma constitucional?",
          "¿Qué diferencia hay entre moción y mensaje?",
          "¿Qué hace una comisión mixta?"
        ]
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm font-semibold"
          id="copiloto-float-btn"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <span>Copiloto IA</span>
          {contextoBoletin && (
            <span className="hidden sm:inline-block text-2xs px-2 py-0.5 bg-white/20 rounded-full font-mono">
              {contextoBoletin}
            </span>
          )}
        </button>
      )}

      {/* Chat Window / Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  Copiloto Legislativo
                  <span className="text-2xs font-normal px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">IA Activa</span>
                </h3>
                <p className="text-2xs text-slate-300 truncate max-w-[220px]">
                  {contextoBoletin ? `Contexto: Boletín ${contextoBoletin}` : "Asistente parlamentario oficial"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Limpiar chat"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-xs shadow-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                </div>

                <div className="flex items-center gap-2 mt-1 px-1 text-2xs text-slate-400">
                  <span>{m.timestamp}</span>
                  {m.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-slate-600 transition-colors flex items-center gap-0.5"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Suggestions Chips */}
                {m.sugerencias && m.sugerencias.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                    {m.sugerencias.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-left px-2.5 py-1 text-2xs bg-white hover:bg-blue-50 text-blue-700 font-medium rounded-lg border border-blue-200 transition-all shadow-2xs"
                      >
                        💡 {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl max-w-[70%]">
                <Bot className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-xs text-slate-500 animate-pulse font-medium">Analizando antecedentes legislativos…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Pregunta sobre quórums, trámites o leyes…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
