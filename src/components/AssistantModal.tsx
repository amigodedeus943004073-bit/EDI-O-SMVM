import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  X,
  Bot,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantNumber?: string;
}

export const AssistantModal: React.FC<AssistantModalProps> = ({
  isOpen,
  onClose,
  assistantNumber = '943004073',
}) => {
  const [userMsg, setUserMsg] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      sender: 'assistant',
      text: `Olá! Sou o Assistente Especialista SMVM IA. Estou disponível pelo número ${assistantNumber} para tirar dúvidas sobre edição em 4K, limpeza em massa, retoques neurais e logos. Como posso te ajudar hoje?`,
      time: 'Agora',
    },
  ]);

  if (!isOpen) return null;

  // Format phone number with whatsapp link
  // Clean phone number: remove non-digits
  const cleanPhone = assistantNumber.replace(/\D/g, '');
  // For Angola (+244) or direct tel link
  const whatsappUrl = `https://wa.me/244${cleanPhone}?text=${encodeURIComponent(
    'Olá Assistente SMVM IA! Gostaria de suporte com edição de fotos, retoques e lote.'
  )}`;
  const telUrl = `tel:${cleanPhone}`;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userMsg.trim()) return;

    const userText = userMsg.trim();
    const newLog = [
      ...chatLog,
      { sender: 'user' as const, text: userText, time: 'Agora' },
    ];
    setChatLog(newLog);
    setUserMsg('');

    // Simulate intelligent assistant response
    setTimeout(() => {
      let reply = `Compreendido! Para orientações detalhadas ou atendimento direto, você também pode me ligar ou enviar WhatsApp no número ${assistantNumber}.`;
      const lower = userText.toLowerCase();

      if (lower.includes('lote') || lower.includes('massa') || lower.includes('10')) {
        reply = `Na limpeza em massa (até 10 fotos), você pode ajustar nitidez, retoque de manchas/rugas, aplicar efeitos e estampar seu logotipo em todas as imagens com 1 clique! Fale comigo no ${assistantNumber} para mais dicas.`;
      } else if (lower.includes('logo') || lower.includes('marca')) {
        reply = `Você pode subir sua imagem de logo PNG/SVG no painel de Lote ou na barra de referências. O logo será aplicado perfeitamente em alta definição em cada foto. Dúvidas? Ligue para ${assistantNumber}!`;
      } else if (lower.includes('mancha') || lower.includes('ruga') || lower.includes('pele')) {
        reply = `Nossa IA utiliza filtragem neural bilateral que elimina marcas, espinhas e suaviza rugas mantendo a textura natural da pele em 4K. Pode falar comigo pelo ${assistantNumber} para suporte.`;
      } else if (lower.includes('contato') || lower.includes('numero') || lower.includes('telefone')) {
        reply = `Meu número de contato direto é ${assistantNumber}. Estou pronto para ajudar via WhatsApp ou ligação direta!`;
      }

      setChatLog((prev) => [
        ...prev,
        { sender: 'assistant' as const, text: reply, time: 'Agora' },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-neutral-100">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-950 via-neutral-900 to-purple-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-neutral-900 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Assistente SMVM IA
                </h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                </span>
              </div>
              <p className="text-xs text-indigo-300 font-mono flex items-center gap-1.5">
                <Phone className="w-3 h-3" />
                Número direto: <span className="font-bold text-white tracking-wide">{assistantNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Quick Action Banner */}
        <div className="p-3.5 bg-neutral-950/80 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-neutral-300">
              Atendimento oficial via telefone ou WhatsApp:
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp ({assistantNumber})</span>
            </a>

            <a
              href={telUrl}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ligar</span>
            </a>
          </div>
        </div>

        {/* Chat Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] max-h-[320px] bg-neutral-950/40">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                    : 'bg-neutral-850 border border-neutral-800 text-neutral-200 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 px-1">
                {msg.time}
              </span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={userMsg}
            onChange={(e) => setUserMsg(e.target.value)}
            placeholder={`Pergunte algo ou solicite suporte ao assistente (${assistantNumber})...`}
            className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!userMsg.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
