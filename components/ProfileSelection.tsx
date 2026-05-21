'use client';

import React from 'react';
import { Truck, Package, ArrowRight, ShieldCheck, MapPin, Sparkles, Navigation } from 'lucide-react';
import Logo from './Logo';

interface ProfileSelectionProps {
  onSelect: (role: 'client' | 'driver') => void;
  onBack: () => void;
  onGoToLogin: () => void;
}

export default function ProfileSelection({ onSelect, onBack, onGoToLogin }: ProfileSelectionProps) {
  return (
    <div className="flex flex-col min-h-screen p-6 bg-slate-50 relative overflow-hidden" id="profile-selection-wrapper">
      {/* Visual background enhancements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-vapt-light opacity-60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-100 opacity-60 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10 py-2 border-b border-gray-100 mb-10" id="profile-header">
        <Logo showText size={38} />
        <div className="flex items-center gap-3" id="profile-header-actions">
          <button 
            onClick={onGoToLogin}
            className="text-xs font-bold text-[#093B84] hover:bg-[#093B84]/10 border border-[#093B84]/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            id="profile-header-login-btn"
          >
            Entrar (Já tenho conta)
          </button>
          <button 
            onClick={onBack}
            className="text-xs font-semibold text-vapt hover:underline uppercase tracking-wider"
            id="profile-back-to-slides"
          >
            Voltar
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full z-10 py-4" id="profile-main-body">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-extrabold text-vapt-dark tracking-tight mb-3">
            Como você deseja usar o Vapt?
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Selecione o perfil que melhor descreve suas necessidades. Você poderá alternar entre eles a qualquer momento.
          </p>
        </div>

        {/* Profile Grid Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto mb-10" id="profile-grid">
          {/* Card A: Cliente (Quero Enviar uma Carga) */}
          <button
            onClick={() => onSelect('client')}
            className="flex flex-col text-left p-8 bg-white rounded-2xl border border-gray-200 hover:border-vapt shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden cursor-pointer cursor-default"
            id="profile-card-client"
          >
            {/* Corner Decorative Blue Ring */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-vapt-light rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />
            
            <div className="p-4 rounded-xl bg-vapt-light text-vapt inline-block mb-6 z-10 relative">
              <Package className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-display font-bold text-vapt-dark group-hover:text-vapt transition-colors mb-2 z-10 relative">
              Quero Enviar uma Carga
            </h3>
            <span className="text-xs font-semibold text-vapt tracking-widest uppercase mb-4 block z-10 relative">
              CLIENTE
            </span>

            <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow z-10 relative">
              Precisa enviar volumes, encomendas comerciais ou mudanças residenciais? Conte com soluções completas.
            </p>

            {/* Core focus items requested in PDF */}
            <div className="space-y-2 mb-6 border-t border-gray-50 pt-4 z-10 relative w-full">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Facilidade e agilidade de cadastro</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Rastreio de rotas em tempo real</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Garantia de preço baixo e desconto extra</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-vapt group-hover:gap-3 transition-all mt-auto z-10 relative">
              <span>Acessar Canal Cliente</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card B: Motorista / Transportador */}
          <button
            onClick={() => onSelect('driver')}
            className="flex flex-col text-left p-8 bg-white rounded-2xl border border-gray-200 hover:border-vapt shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden cursor-pointer cursor-default"
            id="profile-card-driver"
          >
            {/* Corner Decorative Blue Ring */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />

            <div className="p-4 rounded-xl bg-blue-50 text-vapt inline-block mb-6 z-10 relative">
              <Truck className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-display font-bold text-vapt-dark group-hover:text-vapt transition-colors mb-2 z-10 relative">
              Sou Motorista / Transportador
            </h3>
            <span className="text-xs font-semibold text-vapt tracking-widest uppercase mb-4 block z-10 relative">
              PARCEIRO
            </span>

            <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow z-10 relative">
              Tem uma picape, caminhão ou carreta? Faça fretes programados e aumente seu faturamento.
            </p>

            {/* Core focus items requested in PDF */}
            <div className="space-y-2 mb-6 border-t border-gray-50 pt-4 z-10 relative w-full">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Gestão inteligente de fretes e rotas</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Preenchimento de carga ociosa</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Faturamento recorrente e ganhos extras</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-vapt group-hover:gap-3 transition-all mt-auto z-10 relative">
              <span>Cadastrar como Transportador</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Alternative direct login callout */}
        <div className="text-center mt-8 z-10 relative animate-fade-in" id="profile-alternative-login-prompt">
          <p className="text-sm text-gray-500 font-medium">
            Já se cadastrou?{' '}
            <button
              onClick={onGoToLogin}
              className="font-bold text-[#093B84] hover:underline cursor-pointer transition-colors"
              id="btn-alternative-login-trigger"
            >
              Entrar direto com E-mail e Senha
            </button>
          </p>
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="text-center py-4 text-xs font-mono text-gray-400 z-10 border-t border-gray-100 flex justify-between items-center max-w-4xl mx-auto w-full mt-auto" id="profile-footer">
        <span>© 2026 Vapt Logística S.A.</span>
        <span>Balsas - Maranhão</span>
      </div>
    </div>
  );
}
