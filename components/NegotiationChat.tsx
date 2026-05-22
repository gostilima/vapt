'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, DollarSign, Check, Ban, MessageSquare, 
  User, Calendar, Landmark, HelpCircle, AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'client' | 'driver';
  senderName: string;
  text: string;
  timestamp: string;
  proposalPrice?: number;
  proposalStatus?: 'pending' | 'accepted' | 'declined';
}

interface NegotiationChatProps {
  offerId: string;
  currentUserRole: 'client' | 'driver';
  currentUserName: string;
  offerPrice: number;
  offerStart: string;
  offerEnd: string;
  onClose: () => void;
}

export default function NegotiationChat({
  offerId,
  currentUserRole,
  currentUserName,
  offerPrice,
  offerStart,
  offerEnd,
  onClose
}: NegotiationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showProposalInput, setShowProposalInput] = useState(false);
  const [proposalPrice, setProposalPrice] = useState<string>('');
  const [currentPriceState, setCurrentPriceState] = useState(offerPrice);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load and sync messages from localStorage
  useEffect(() => {
    const loadMessages = () => {
      try {
        const stored = localStorage.getItem(`vapt_chat_${offerId}`);
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          // Initialize empty or with a default greeting system message
          const initialMessages: ChatMessage[] = [
            {
              id: 'system-init',
              sender: currentUserRole === 'client' ? 'driver' : 'client',
              senderName: 'Vapt Sistema',
              text: `Olá! Este é o canal direto de negociação para o frete ${offerId}. Use este chat para conversar em tempo real ou enviar contrapropostas de valores!`,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }
          ];
          localStorage.setItem(`vapt_chat_${offerId}`, JSON.stringify(initialMessages));
          setMessages(initialMessages);
        }
      } catch (e) {
        console.error('Erro ao carregar mensagens do chat:', e);
      }
    };

    // Load active offer price to keep it updated in UI
    const syncCurrentPrice = () => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('vapt_requests_')) {
          try {
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            const found = list.find((x: any) => x.id === offerId);
            if (found) {
              setCurrentPriceState(found.price);
              break;
            }
          } catch (e) {}
        }
      }
    };

    loadMessages();
    syncCurrentPrice();

    // Poll every 1.5 seconds for true real-time chat feeling!
    const interval = setInterval(() => {
      loadMessages();
      syncCurrentPrice();
    }, 1500);

    return () => clearInterval(interval);
  }, [offerId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessages = (newMessages: ChatMessage[]) => {
    localStorage.setItem(`vapt_chat_${offerId}`, JSON.stringify(newMessages));
    setMessages(newMessages);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: currentUserRole,
      senderName: currentUserName,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    saveMessages([...messages, newMessage]);
    setInputText('');
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(proposalPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) return;

    const newProposal: ChatMessage = {
      id: `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: currentUserRole,
      senderName: currentUserName,
      text: `Propôs um novo valor de frete: R$ ${priceNum.toFixed(2)}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      proposalPrice: priceNum,
      proposalStatus: 'pending'
    };

    saveMessages([...messages, newProposal]);
    setProposalPrice('');
    setShowProposalInput(false);
  };

  const updateOfferPriceInStorage = (newPrice: number) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vapt_requests_')) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = list.findIndex((x: any) => x.id === offerId);
          if (idx !== -1) {
            list[idx].price = newPrice;
            localStorage.setItem(key, JSON.stringify(list));
          }
        } catch (e) {
          console.error('Erro ao atualizar preço no localStorage:', e);
        }
      }
    }
  };

  const handleProposalAction = (msgId: string, action: 'accept' | 'decline') => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === msgId && msg.proposalPrice) {
        const isAccept = action === 'accept';
        if (isAccept) {
          // Update the actual offer price in storage!
          updateOfferPriceInStorage(msg.proposalPrice);
          setCurrentPriceState(msg.proposalPrice);
        }
        
        return {
          ...msg,
          proposalStatus: isAccept ? ('accepted' as const) : ('declined' as const)
        };
      }
      return msg;
    });

    // Add a system confirmation message
    const targetProposal = messages.find(m => m.id === msgId);
    const systemMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: currentUserRole,
      senderName: 'Vapt Sistema',
      text: action === 'accept' 
        ? `${currentUserName} ACEITOU a proposta de R$ ${targetProposal?.proposalPrice?.toFixed(2)}! Novo valor do frete atualizado.` 
        : `${currentUserName} recusou a proposta de R$ ${targetProposal?.proposalPrice?.toFixed(2)}.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    saveMessages([...updatedMessages, systemMsg]);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-300" id="negotiation-chat-panel">
      {/* Chat Header */}
      <div className="bg-[#05234F] text-white px-5 py-4 flex items-center justify-between shadow-md border-b border-white/10" id="chat-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/40 rounded-xl border border-blue-400/30">
            <MessageSquare className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/20">
                {offerId}
              </span>
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                Negociação Ao Vivo
              </span>
            </div>
            <h3 className="text-xs font-bold text-gray-200 mt-1 flex items-center gap-1.5">
              <span>{offerStart}</span>
              <span className="text-gray-400 text-[10px]">➔</span>
              <span>{offerEnd}</span>
            </h3>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
          title="Fechar Chat"
          id="chat-close-btn"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Pricing Header Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between text-xs" id="chat-price-summary">
        <span className="text-gray-500 font-medium">Valor Atual do Frete:</span>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-extrabold font-mono">
          <Landmark className="w-3.5 h-3.5" />
          <span>R$ {currentPriceState.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Messages View Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50" id="chat-messages-area">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUserRole;
          const isSystem = msg.senderName === 'Vapt Sistema';
          const isProposal = !!msg.proposalPrice;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2" id={`msg-system-${msg.id}`}>
                <div className="bg-blue-50/80 text-[#093B84] text-[10.5px] px-3.5 py-2 rounded-xl border border-blue-100 max-w-[90%] text-center font-medium shadow-sm flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              id={`msg-${msg.id}`}
            >
              {/* Sender name label */}
              <span className="text-[9.5px] text-gray-400 font-bold mb-1 px-1">
                {msg.senderName} ({msg.sender === 'client' ? 'Cliente' : 'Motorista'})
              </span>

              {/* Standard text message bubble */}
              {!isProposal ? (
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${
                  isMe 
                    ? 'bg-[#093B84] text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed break-words">{msg.text}</p>
                  <span className={`text-[8.5px] block text-right mt-1.5 font-medium ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              ) : (
                /* Proposal Card Bubble */
                <div className={`max-w-[88%] rounded-2xl p-4 border shadow-md flex flex-col gap-3 transition-all ${
                  isMe
                    ? 'bg-blue-50/90 border-blue-200 text-slate-800 rounded-tr-none'
                    : 'bg-emerald-50/90 border-emerald-200 text-slate-800 rounded-tl-none'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl text-white ${isMe ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Contraproposta de Valor</span>
                      <strong className="text-base font-extrabold font-mono text-slate-900 block mt-0.5">
                        R$ {msg.proposalPrice?.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 italic bg-white/60 p-2 rounded-lg border border-slate-100">
                    "{msg.senderName} sugeriu alterar o frete regional para este novo valor de negociação."
                  </p>

                  {/* Action states or decision buttons */}
                  {msg.proposalStatus === 'pending' ? (
                    isMe ? (
                      <span className="text-[10px] text-blue-600 bg-blue-100/50 px-2.5 py-1 rounded-lg border border-blue-200 text-center font-bold">
                        ⏳ Enviado. Aguardando resposta...
                      </span>
                    ) : (
                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => handleProposalAction(msg.id, 'decline')}
                          className="flex-1 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg border border-red-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Recusar</span>
                        </button>
                        <button 
                          onClick={() => handleProposalAction(msg.id, 'accept')}
                          className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aceitar</span>
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center pt-1">
                      {msg.proposalStatus === 'accepted' ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                          <Check className="w-3.5 h-3.5" /> Proposta Aceita
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-300">
                          <Ban className="w-3.5 h-3.5" /> Proposta Recusada
                        </span>
                      )}
                    </div>
                  )}
                  
                  <span className="text-[8.5px] block text-right font-medium text-gray-400">
                    {msg.timestamp}
                  </span>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Proposal overlay/input form if triggered */}
      {showProposalInput && (
        <form onSubmit={handleSendProposal} className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col gap-2.5 animate-in slide-in-from-bottom duration-200" id="proposal-input-form">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-slate-700 flex items-center gap-1">
              💡 Nova Proposta de Valor
            </span>
            <button 
              type="button" 
              onClick={() => setShowProposalInput(false)}
              className="text-gray-400 hover:text-red-500 font-bold"
            >
              [X]
            </button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">R$</span>
              <input
                type="text"
                placeholder="Ex: 350.00"
                value={proposalPrice}
                onChange={(e) => setProposalPrice(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 focus:border-[#093B84] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#093B84]/20 shadow-inner"
                required
              />
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-[#093B84] hover:bg-[#05234F] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Enviar Proposta
            </button>
          </div>
          <span className="text-[9.5px] text-gray-400">
            A contraparte poderá aceitar ou recusar no chat. Se aceito, o valor do frete mudará imediatamente.
          </span>
        </form>
      )}

      {/* Input controls at bottom */}
      <div className="p-4 border-t border-slate-200 bg-white" id="chat-input-bar">
        <form onSubmit={handleSendMessage} className="flex gap-2" id="chat-compose-form">
          {/* Propor Novo Preço action trigger */}
          <button
            type="button"
            onClick={() => setShowProposalInput(!showProposalInput)}
            className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition-all flex-shrink-0 cursor-pointer"
            title="Propor Novo Valor de Negociação"
            id="chat-proposal-trigger-btn"
          >
            <DollarSign className="w-5 h-5" />
          </button>

          <input
            type="text"
            placeholder="Digite sua mensagem de texto..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-gray-200 focus:border-[#093B84] focus:bg-white rounded-xl text-xs font-medium focus:outline-none transition-all shadow-inner"
            id="chat-text-input"
          />

          <button
            type="submit"
            className="p-2.5 bg-[#093B84] hover:bg-[#05234F] text-white rounded-xl shadow-md transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            id="chat-send-btn"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
