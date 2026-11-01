import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Minus,
  ChevronUp,
  ChevronDown,
  Bot,
  AlertCircle,
  Cpu
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const DEFAULT_MODELS = [
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', gen: 'Gen 4 (Next-Gen)' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', gen: 'Gen 3.1 (Flagship Pro)' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', gen: 'Gen 3.8 (Ultra Flash)' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', gen: 'Gen 3.5 (Stylist Flash)' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', gen: 'Gen 2.5 (Pro)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', gen: 'Gen 2.5 (Flash)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', gen: 'Gen 1.5 (Pro)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', gen: 'Gen 1.5 (Flash)' },
  { id: 'gemini-pro', name: 'Gemini 1.0 Pro', gen: 'Gen 1.0 (1st Version)' }
];

const QUICK_PROMPTS = [
  '✨ Suggest a luxury minimalist outfit for dinner',
  '🧥 What are your best jackets & outerwear?',
  '📏 How does AURA sizing & fit work?',
  '📦 What is your exchange & return policy?'
];

let messageIdSequence = 0;
function createChatMessage(role, text, modelLabel = null) {
  messageIdSequence += 1;
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    id: `msg-${messageIdSequence}-${role}`,
    role,
    text,
    modelLabel,
    timestamp: timeFormatted
  };
}

const INITIAL_MESSAGE = {
  id: 'init-1',
  role: 'model',
  text: 'Welcome to AURA. I am your personal AI Fashion Stylist & Concierge.\n\nPowered by Google Gemini (from Gemini 1.0 to Gemini 4 Argon). How can I curate your wardrobe today?',
  modelLabel: 'Gemini 4 Argon',
  timestamp: '12:00'
};

export default function AiStylistChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-4-argon');
  const [modelsList, setModelsList] = useState(DEFAULT_MODELS);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch available models from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ai/models`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.models)) {
          const mapped = data.models.map(m => ({
            id: m.id,
            name: m.name,
            gen: m.generation
          }));
          setModelsList(mapped);
          if (data.activeModel) {
            setSelectedModel(data.activeModel);
          }
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_MODELS
      });
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(prev => {
      const next = !prev;
      if (!next) setUnreadCount(0);
      return next;
    });
  };

  const handleSendMessage = async (textToSend) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || isLoading) return;

    setErrorBanner('');
    const userMsg = createChatMessage('user', message);

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'init-1')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsg.text,
          history: historyPayload,
          model: selectedModel
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.code === 'API_KEY_NOT_CONFIGURED') {
          setErrorBanner('Gemini API key backend .env file mein set nahi hai.');
          setMessages(prev => [
            ...prev,
            createChatMessage(
              'model',
              '⚠️ **Gemini API Key Required**\n\nGoogle Gemini API key backend ki `.env` file mein set nahi hai.\n\nBackend `.env` file open karein aur `GEMINI_API_KEY=your_key` add karein, phir backend restart karein.'
            )
          ]);
        } else {
          setErrorBanner(data.message || 'Error communicating with AI Stylist.');
          setMessages(prev => [
            ...prev,
            createChatMessage(
              'model',
              `⚠️ Maaf kijiye: ${data.message || 'Please try again.'}`
            )
          ]);
        }
        return;
      }

      const activeModelObj = modelsList.find(m => m.id === data.modelUsed) || {
        name: data.modelUsed || selectedModel
      };

      const botReply = createChatMessage('model', data.reply, activeModelObj.name);

      setMessages(prev => [...prev, botReply]);

      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setErrorBanner('Backend server se connect nahi ho saka. Ensure backend port 5001 is running.');
      setMessages(prev => [
        ...prev,
        createChatMessage(
          'model',
          '⚠️ Backend server se connect nahi ho saka. Barah-e-karam check karein ke backend (Port 5001) chal raha hai.'
        )
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setErrorBanner('');
  };

  // Helper to render basic markdown bold and bullet lists
  const renderFormattedText = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-neutral-300 my-0.5">
            {renderedParts.slice(1)}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="my-0.5 leading-relaxed text-neutral-300">
          {renderedParts}
        </p>
      );
    });
  };

  const currentModelObj = modelsList.find(m => m.id === selectedModel) || {
    name: 'Gemini 4 Argon',
    gen: 'Gen 4 (Next-Gen)'
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <aside
          aria-label="AURA AI Stylist Trigger"
          className="fixed z-50 select-none pointer-events-auto"
          style={{
            bottom: 'max(1.25rem, calc(1rem + env(safe-area-inset-bottom, 0px)))',
            right: 'max(1.25rem, calc(1rem + env(safe-area-inset-right, 0px)))'
          }}
        >
          <button
            onClick={handleOpenChat}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-neutral-900/95 text-white border border-neutral-700/80 shadow-[0_12px_35px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-neutral-800 hover:border-neutral-600 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400"
            title="Open AURA AI Stylist"
            aria-label="Open AURA AI Stylist"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>

            <Sparkles className="w-4 h-4 text-amber-300 transition-transform duration-300 group-hover:rotate-12" />
            <span className="text-xs uppercase tracking-wider font-medium text-neutral-200">
              AURA Stylist
            </span>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-neutral-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                {unreadCount}
              </span>
            )}
          </button>
        </aside>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <section
          aria-label="AURA AI Fashion Stylist Concierge"
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-neutral-950 border border-neutral-800 text-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl ${
            isMinimized
              ? 'w-72 h-14 rounded-2xl'
              : 'w-[94vw] sm:w-105 h-150 max-h-[85vh] rounded-3xl'
          } overflow-hidden`}
          style={{
            bottom: 'max(1.25rem, calc(1rem + env(safe-area-inset-bottom, 0px)))',
            right: 'max(1.25rem, calc(1rem + env(safe-area-inset-right, 0px)))'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-neutral-800/80 backdrop-blur-md select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-300 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold tracking-wide uppercase text-white">
                    AURA Stylist
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                {!isMinimized && (
                  <span className="text-[10px] text-neutral-400">
                    AI Concierge • Gemini 1.0 to 4 Argon
                  </span>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1 text-neutral-400">
              {!isMinimized && (
                <button
                  onClick={handleResetChat}
                  className="p-1.5 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors cursor-pointer"
                  title="Reset Conversation"
                  aria-label="Reset Conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleToggleMinimize}
                className="p-1.5 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
                aria-label={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors cursor-pointer"
                title="Close Chat"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Switcher Bar (Gemini 1.0 to Gemini 4 Argon) */}
          {!isMinimized && (
            <div className="relative px-3.5 py-1.5 bg-neutral-900/60 border-b border-neutral-800/60 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Cpu className="w-3 h-3 text-amber-400/80" />
                <span className="text-[10px] uppercase tracking-wider font-medium text-neutral-400">
                  Model Engine:
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-800/90 hover:bg-neutral-700/90 border border-neutral-700/70 text-neutral-200 text-[10px] font-medium transition-all cursor-pointer"
                >
                  <span className="truncate max-w-35">{currentModelObj.name}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options */}
                {showModelPicker && (
                  <div className="absolute right-0 top-6 mt-1 w-60 max-h-56 overflow-y-auto bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 p-1 divide-y divide-neutral-800">
                    <div className="px-2 py-1 text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
                      Select Generation (v1.0 to v4)
                    </div>
                    <div className="py-1">
                      {modelsList.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedModel(m.id);
                            setShowModelPicker(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] flex flex-col transition-colors cursor-pointer ${
                            selectedModel === m.id
                              ? 'bg-amber-400/10 text-amber-300 font-semibold'
                              : 'text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{m.name}</span>
                            {selectedModel === m.id && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            )}
                          </div>
                          <span className="text-[9px] text-neutral-400 font-normal">{m.gen}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Body & Messages */}
          {!isMinimized && (
            <>
              {errorBanner && (
                <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-950/40 border-b border-amber-900/40 text-amber-300 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{errorBanner}</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 text-xs">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {isUser ? (
                          <span className="text-[10px] text-neutral-400">You</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Bot className="w-3 h-3 text-amber-300/80" />
                            <span className="text-[10px] text-neutral-400">
                              AURA Concierge {msg.modelLabel ? `• ${msg.modelLabel}` : ''}
                            </span>
                          </div>
                        )}
                        <span className="text-[9px] text-neutral-400">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                          isUser
                            ? 'bg-neutral-100 text-neutral-900 font-medium rounded-tr-xs'
                            : 'bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-tl-xs'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        ) : (
                          <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Thinking / Loading indicator */}
                {isLoading && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1 mb-1 px-1">
                      <Bot className="w-3 h-3 text-amber-300/80" />
                      <span className="text-[10px] text-neutral-400">
                        {currentModelObj.name} is thinking...
                      </span>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2">
                      <span className="text-[11px] text-neutral-400">Curating luxury styling advice</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              {messages.length <= 1 && (
                <div className="px-3 pb-2 pt-1 border-t border-neutral-900/80">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5 px-1 font-semibold">
                    Suggested Inquiries:
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(prompt.replace(/^[^\w\s]+/, '').trim())}
                        className="text-left text-[11px] px-2.5 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800/80 transition-all cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <div className="p-3 bg-neutral-900/95 border-t border-neutral-800/80">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about styling, outfits, sizing..."
                    disabled={isLoading}
                    className="flex-1 bg-neutral-950 text-white placeholder-neutral-500 text-xs px-3.5 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-neutral-500 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-neutral-100 text-neutral-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-neutral-100 transition-all cursor-pointer shadow-sm"
                    title="Send message"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-[9px] text-neutral-400 tracking-wide">
                    Google Gemini Ecosystem (v1.0 – v4.0 Argon)
                  </span>
                  <span className="text-[9px] text-neutral-400">
                    Press Enter ↵ to send
                  </span>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
