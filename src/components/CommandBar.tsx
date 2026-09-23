import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Terminal, 
  History, 
  CheckCircle2, 
  Camera, 
  Sun, 
  RotateCcw,
  Wand2,
  X
} from 'lucide-react';
import { AICommand } from '../types';

interface CommandBarProps {
  onExecuteCommand: (commandText: string) => Promise<boolean> | boolean;
  isProcessing?: boolean;
  history?: AICommand[];
  lastFeedback?: string | null;
  onClearFeedback?: () => void;
  onOpenAssistant?: () => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  onExecuteCommand,
  isProcessing = false,
  history = [],
  lastFeedback = null,
  onClearFeedback,
  onOpenAssistant,
}) => {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onExecuteCommand(input.trim());
    setInput('');
  };

  const quickCommands = [
    { label: '✨ Remover Manchas & Rugas', cmd: 'remover manchas e rugas automaticamente com qualidade 4K' },
    { label: '⚡ Auto Retoque Facial', cmd: 'suavizar pele, remover imperfeições e clarear olhos' },
    { label: '📸 Calibração Canon L', cmd: 'calibração canon com cores quentes e nitidez 85mm' },
    { label: '🌟 4K Ultra-HD Máster', cmd: 'ativar qualidade 4k ultra-hd' },
    { label: '☀️ Golden Hour', cmd: 'golden hour com iluminação dourada e calor acolhedor' },
    { label: '🎬 Cinema 35mm Grão', cmd: 'grão analógico de filme 35mm e contraste suave' },
    { label: '🖤 Leica Monochrom', cmd: 'preto e branco leica de alto contraste e grão' },
    { label: '🌟 Inserir Marca SMVM', cmd: 'inserir marca smvm no canto' },
    { label: '🌫️ Remover Névoa', cmd: 'tirar nevoa e aumentar clareza dehaze' },
    { label: '🔄 Restaurar Original', cmd: 'resetar tudo para o original' },
  ];

  return (
    <div className="w-full bg-neutral-900/95 backdrop-blur-md border-b border-blue-500/20 px-3 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto space-y-2">
        {/* Command Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3 flex items-center gap-1.5 text-blue-400 pointer-events-none">
              <Terminal className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400/90 hidden sm:inline">
                SMVM IA
              </span>
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite um comando para alterar a imagem (ex: 'calibração canon 85mm', 'pele aveludada e dentes brancos', 'visual cinema 35mm')..."
              disabled={isProcessing}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500/80 rounded-xl pl-24 sm:pl-28 pr-10 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-all shadow-inner"
            />

            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="absolute right-3 text-neutral-500 hover:text-neutral-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {isProcessing ? (
              <>
                <Wand2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Executando...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Executar Comando</span>
              </>
            )}
          </button>

          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              title="Histórico de Comandos"
              className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                showHistory ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <History className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Feedback Alert Bar */}
        {lastFeedback && (
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-200 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="font-medium">{lastFeedback}</span>
            </div>
            {onClearFeedback && (
              <button
                type="button"
                onClick={onClearFeedback}
                className="text-blue-400 hover:text-blue-200 p-0.5 ml-2"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Quick Command Suggestions Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
          {onOpenAssistant && (
            <button
              type="button"
              onClick={onOpenAssistant}
              className="px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/50 hover:bg-indigo-900 text-indigo-200 hover:text-white whitespace-nowrap transition-all shrink-0 flex items-center gap-1 font-semibold"
            >
              <span>📞 Assistente: 943004073</span>
            </button>
          )}
          <span className="text-neutral-500 text-[10px] uppercase font-bold shrink-0 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Sugestões:
          </span>
          {quickCommands.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isProcessing}
              onClick={() => onExecuteCommand(item.cmd)}
              className="px-2.5 py-1 rounded-full bg-neutral-950 border border-neutral-800 hover:border-blue-500/50 hover:bg-neutral-850 text-neutral-300 hover:text-white whitespace-nowrap transition-all shrink-0"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* History Dropdown */}
        {showHistory && history.length > 0 && (
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 shadow-xl space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-800 text-[11px] text-neutral-400 font-semibold">
              <span>Últimos Comandos Executados</span>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                Fechar
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-850 group cursor-pointer"
                  onClick={() => {
                    onExecuteCommand(h.text);
                    setShowHistory(false);
                  }}
                >
                  <span className="text-neutral-200 group-hover:text-blue-300 font-mono text-[11px]">
                    "{h.text}"
                  </span>
                  <span className="text-[10px] text-neutral-500">Reaplicar</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
