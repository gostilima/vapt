'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Calculator, Package, Truck, Compass, 
  MapPin, CircleCheck, Info, AlertTriangle, RefreshCw, 
  Check, History, ArrowRight, CornerDownRight, Landmark 
} from 'lucide-react';
import Logo from './Logo';
import MapComponent, { cities, regionalHighways } from './MapComponent';

interface ClientDashboardProps {
  userProfile: any;
  onLogout: () => void;
}

interface SimulatedRequest {
  id: string;
  start: string;
  end: string;
  weight: number;
  distance: number;
  type: 'exclusive' | 'shared';
  price: number;
  status: 'Pendente' | 'Coletado' | 'Em Trânsito' | 'Entregue';
  createdAt: string;
  eta: string;
}

export default function ClientDashboard({ userProfile, onLogout }: ClientDashboardProps) {
  // Navigation states
  const [startCity, setStartCity] = useState('Balsas');
  const [endCity, setEndCity] = useState('Carolina');
  const [searchText, setSearchText] = useState('');
  const [freightType, setFreightType] = useState<'exclusive' | 'shared'>('shared');
  
  // Calculator state (user inputs)
  const [weightKg, setWeightKg] = useState<number>(150);

  // Active requests state with lazy functional initialization
  const [shippingRequests, setShippingRequests] = useState<SimulatedRequest[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedRequests = localStorage.getItem(`vapt_requests_${userProfile.email}`);
      if (savedRequests) {
        return JSON.parse(savedRequests);
      }
    } catch (e) {}
    
    // Default initial mock requests for simulation
    return [
      {
        id: 'REQ-1092',
        start: 'Balsas',
        end: 'Riachão',
        weight: 45,
        distance: 140,
        type: 'shared' as const,
        price: 216.75,
        status: 'Em Trânsito' as const,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        eta: 'Em 1 hora'
      },
      {
        id: 'REQ-1081',
        start: 'Tasso Fragoso',
        end: 'Balsas',
        weight: 1200,
        distance: 155,
        type: 'exclusive' as const,
        price: 479.00,
        status: 'Entregue' as const,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        eta: 'Entregue às 10:42'
      }
    ];
  });

  const [showCalculator, setShowCalculator] = useState(false);
  
  const [simulatedAccountBalance, setSimulatedAccountBalance] = useState<number>(() => {
    if (typeof window === 'undefined') return 500;
    try {
      const savedBalance = localStorage.getItem(`vapt_balance_${userProfile.email}`);
      if (savedBalance) return parseFloat(savedBalance);
    } catch (e) {}
    return 500;
  });

  const [successAnimation, setSuccessAnimation] = useState(false);

  // Synchronize initial storage items gracefully on mount and poll for real-time changes
  useEffect(() => {
    try {
      const savedRequests = localStorage.getItem(`vapt_requests_${userProfile.email}`);
      if (!savedRequests) {
        localStorage.setItem(`vapt_requests_${userProfile.email}`, JSON.stringify(shippingRequests));
      }
      const savedBalance = localStorage.getItem(`vapt_balance_${userProfile.email}`);
      if (!savedBalance) {
        localStorage.setItem(`vapt_balance_${userProfile.email}`, '500.00');
      }
    } catch (e) {}

    const syncRequests = () => {
      try {
        const savedRequests = localStorage.getItem(`vapt_requests_${userProfile.email}`);
        if (savedRequests) {
          setShippingRequests(JSON.parse(savedRequests));
        }
        const savedBalance = localStorage.getItem(`vapt_balance_${userProfile.email}`);
        if (savedBalance) {
          setSimulatedAccountBalance(parseFloat(savedBalance));
        }
      } catch (e) {
        console.error('Error synchronizing client requests:', e);
      }
    };

    const interval = setInterval(syncRequests, 3000); // Sync every 3 seconds for smooth real-time simulator updates
    return () => clearInterval(interval);
  }, [userProfile.email, shippingRequests]);

  // Calculate distance between cities
  const lookupDistance = (from: string, to: string): number => {
    if (from === to) return 0;
    
    // Check direct
    const direct = regionalHighways.find(
      (h) => (h.from === from && h.to === to) || (h.from === to && h.to === from)
    );
    if (direct) return direct.distance;

    // Riachão connects Balsas to Carolina
    if ((from === 'Balsas' && to === 'Carolina') || (from === 'Carolina' && to === 'Balsas')) {
      return 240; // 140 + 100
    }
    // Tasso Fragoso connects to Balsas
    if ((from === 'Tasso Fragoso' && to === 'Riachão') || (from === 'Riachão' && to === 'Tasso Fragoso')) {
      return 295; // 155 + 140
    }
    if ((from === 'Tasso Fragoso' && to === 'Carolina') || (from === 'Carolina' && to === 'Tasso Fragoso')) {
      return 395; // 155 + 140 + 100
    }

    return 180; // Reasonable default approximation
  };

  const getDistanceAmount = lookupDistance(startCity, endCity);

  // PRICING SYSTEM Formula from item 5 calculated AT RENDER TIME!
  // Preço Final = Taxa Base + (Peso * Fator Peso) + (Distância * Fator Combustível)
  const TAXA_BASE = 25.00;
  const FATOR_PESO = 0.20; // R$ 0.20 per kg
  const FATOR_COMBUSTIVEL = 1.95; // R$ 1.95 per km

  const pesoPart = weightKg * FATOR_PESO;
  const combustivelPart = getDistanceAmount * FATOR_COMBUSTIVEL;
  
  const subtotal = TAXA_BASE + pesoPart + combustivelPart;
  const discount = freightType === 'shared' ? subtotal * 0.25 : 0;
  const calculatedPrice = Math.max(subtotal - discount, 30.00); // minimum freight guarantee of 30 reais

  const breakdown = {
    taxaBase: TAXA_BASE,
    pesoCalculo: pesoPart,
    combustivelCalculo: combustivelPart,
    subtotal,
    desconto: discount,
    finalValue: calculatedPrice
  };

  // Handle route click from map
  const handleMapRouteSelection = (start: string, end: string) => {
    if (start) setStartCity(start);
    if (end) setEndCity(end);
  };

  // Quick select search filtering
  const handleSearchCommit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = cities.find(c => c.name.toLowerCase().includes(searchText.toLowerCase()));
    if (match) {
      setEndCity(match.name);
      setSearchText('');
    }
  };

  // Place shipping order simulation
  const handlePlaceOrder = () => {
    const orderCost = calculatedPrice;
    
    // Substract custom fake balance
    const updatedBalance = Math.max(0, simulatedAccountBalance - orderCost);
    setSimulatedAccountBalance(updatedBalance);
    localStorage.setItem(`vapt_balance_${userProfile.email}`, updatedBalance.toFixed(2));

    const newRequest: SimulatedRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      start: startCity,
      end: endCity,
      weight: weightKg,
      distance: getDistanceAmount,
      type: freightType,
      price: parseFloat(orderCost.toFixed(2)),
      status: 'Pendente',
      createdAt: new Date().toISOString(),
      eta: `Previsão: ${Math.round(getDistanceAmount / 60)}h ${Math.round(getDistanceAmount % 60)}min`
    };

    const updatedRequests = [newRequest, ...shippingRequests];
    setShippingRequests(updatedRequests);
    localStorage.setItem(`vapt_requests_${userProfile.email}`, JSON.stringify(updatedRequests));

    // Animate SUCCESS feedback
    setSuccessAnimation(true);
    setTimeout(() => {
      setSuccessAnimation(false);
      setShowCalculator(false);
    }, 2200);
  };

  const handleResetBalance = () => {
    setSimulatedAccountBalance(500);
    localStorage.setItem(`vapt_balance_${userProfile.email}`, '500.00');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="client-dashboard-frame">
      {/* Visual background gradient spots */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-[#093B84]/15 to-transparent pointer-events-none" />

      {/* Primary App Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4" id="client-nav-bar">
        <div className="flex items-center gap-2">
          <Logo showText size={35} />
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            Canal Cliente
          </span>
        </div>

        {/* Search bar requested in PDF */}
        <form onSubmit={handleSearchCommit} className="flex-1 max-w-md relative" id="search-box-form">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Para onde você quer enviar hoje? (ex: Carolina)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-vapt/20 shadow-inner"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 px-3 py-1.5 bg-vapt hover:bg-vapt-dark text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            style={{ backgroundColor: '#093B84' }}
            id="search-box-search-btn"
          >
            Buscar
          </button>
        </form>

        {/* Simulated Wallet & Account options */}
        <div className="flex items-center gap-4 justify-between md:justify-end" id="header-wallet-area">
          <div className="flex items-center gap-2.5 bg-vapt-light/60 px-3.5 py-1.5 rounded-xl border border-vapt/10" id="wallet-pill">
            <Landmark className="w-4 h-4 text-vapt" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-gray-400 font-bold uppercase leading-none">Saldo Simulado</span>
              <strong className="text-xs text-vapt font-extrabold font-mono">
                R$ {simulatedAccountBalance.toLocaleString('pt', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <button 
              onClick={handleResetBalance}
              title="Recarregar Saldo Simulador"
              className="text-gray-400 hover:text-vapt p-0.5 rounded hover:bg-white transition-all cursor-pointer"
              id="wallet-recharge-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2" id="client-user-badge">
            <div className="text-right">
              <div className="text-xs font-bold text-vapt-dark truncate max-w-[120px]">{userProfile.name}</div>
              <div className="text-[9px] text-gray-400">{userProfile.phone}</div>
            </div>
            <button 
              onClick={onLogout}
              className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
              id="client-logout-btn"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid lg:grid-cols-12 gap-6 relative z-10" id="client-main-grid">
        {/* Left Side: Real-Time Map component + Active Requests list */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="client-left-panel">
          
          {/* Real-time regional map */}
          <div className="h-[430px]" id="client-map-wrapper">
            <MapComponent 
              selectedStartCity={startCity} 
              selectedEndCity={endCity} 
              onSelectRoute={handleMapRouteSelection}
            />
          </div>

          {/* Active Simulating Requests */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col" id="shipping-history-card">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-vapt" />
                <h3 className="font-display font-bold text-base text-vapt-dark">
                  Mapeador de Encomendas de Simulação
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-gray-400">
                Total: {shippingRequests.length}
              </span>
            </div>

            {shippingRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-400 flex flex-col items-center justify-center gap-2" id="empty-requests">
                <Package className="w-8 h-8 opacity-40" />
                <p className="text-sm font-semibold">Nenhuma encomenda cadastrada.</p>
                <p className="text-xs">Utilize o painel de calculadora ao lado para simular o recebimento de frete.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1" id="requests-scroller">
                {shippingRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="p-4 rounded-xl border border-gray-200 bg-slate-50 hover:bg-white transition-all hover:border-vapt space-y-3"
                    id={`user-req-card-${req.id}`}
                  >
                    <div className="flex items-center justify-between" id="req-card-header">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-vapt bg-vapt-light px-2 py-0.5 rounded border border-vapt/10">
                          {req.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.type === 'exclusive' 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {req.type === 'exclusive' ? '🚚 Exclusivo' : '🤝 Conjunto'}
                        </span>
                      </div>

                      <strong className="text-sm font-mono font-extrabold text-vapt-dark">
                        R$ {req.price.toFixed(2)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs my-1" id="req-card-route">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-green-500" />
                        <strong className="text-gray-800 font-extrabold">{req.start}</strong>
                      </div>
                      <div className="h-0.5 border-t border-dashed border-gray-300 flex-1 mx-3" />
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-vapt" />
                        <strong className="text-gray-800 font-extrabold">{req.end}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/60" id="req-card-footer">
                      <div className="flex gap-4 items-center text-[10px] text-gray-500 font-semibold" id="req-specs">
                        <span>Peso: <strong className="text-gray-800">{req.weight}kg</strong></span>
                        <span>Distância: <strong className="text-gray-800">{req.distance}km</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5" id="req-status">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          req.status === 'Pendente' ? 'bg-amber-500' :
                          req.status === 'Em Trânsito' ? 'bg-vapt' : 'bg-green-500'
                        }`} />
                        <span className="text-[10px] font-bold text-gray-600 uppercase">
                          {req.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action and Budget Calculator panel */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="client-right-panel">
          
          {/* Quick Action Buttons outlined in Section 4 of PDF */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" id="quick-actions-widget">
            <h3 className="font-display font-extrabold text-xs text-vapt-dark uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
              Ações Rápidas de Frete
            </h3>

            <div className="grid grid-cols-2 gap-4" id="action-trigger-grid">
              {/* Button 1: Solicitar Novo Frete */}
              <button
                onClick={() => {
                  setFreightType('exclusive');
                  setShowCalculator(true);
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-300 group cursor-pointer ${
                  showCalculator && freightType === 'exclusive'
                    ? 'border-vapt bg-vapt-light ring-2 ring-vapt/10'
                    : 'border-blue-100 hover:border-vapt bg-slate-50 hover:bg-white'
                }`}
                id="btn-action-solicitar-exclusivo"
              >
                <div className="p-3 rounded-lg bg-vapt text-white inline-block mb-3.5">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm text-vapt-dark mb-1">
                  Solicitar Novo Frete
                </h4>
                <p className="text-[10px] text-gray-400 leading-snug">
                  Ideal para entregas urgentes com motorista e veículo 100% exclusivo.
                </p>
              </button>

              {/* Button 2: Entrar em Frete Conjunto */}
              <button
                onClick={() => {
                  setFreightType('shared');
                  setShowCalculator(true);
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-300 group cursor-pointer ${
                  showCalculator && freightType === 'shared'
                    ? 'border-vapt bg-vapt-dash ring-2 ring-vapt/10'
                    : 'border-green-100 hover:border-vapt bg-slate-50 hover:bg-white'
                }`}
                id="btn-action-entrar-conjunto"
              >
                <div className="p-3 rounded-lg bg-green-600 text-white inline-block mb-3.5">
                  <Package className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm text-vapt-dark mb-1">
                  Frete Conjunto
                </h4>
                <p className="text-[10px] text-gray-400 leading-snug">
                  Economize até 30% dividindo espaço ocioso com outras cargas da região.
                </p>
              </button>
            </div>
          </div>

          {/* Pricing Budget Calculator Box in Section 4 & 5 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden relative" id="pricing-calculator-card">
            
            {/* Success Overlay Animation on payment request processing */}
            {successAnimation && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in" id="order-success-overlay">
                <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mb-4 shadow-lg animate-bounce" id="success-icon-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-display font-extrabold text-xl text-vapt-dark mb-2">
                  Frete Solicitado!
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  A rota foi simulada e o motorista iniciará o trânsito regional em instantes.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-vapt" />
                <h3 className="font-display font-bold text-base text-vapt-dark">
                  Calculadora de Orçamento
                </h3>
              </div>
              <span className="text-[10px] font-bold text-vapt uppercase bg-vapt-light px-2.5 py-1 rounded-full">
                Cálculo Automático
              </span>
            </div>

            {/* Form selectors inside calculations */}
            <div className="space-y-4" id="calculator-inputs">
              <div className="grid grid-cols-2 gap-3" id="city-selector-grid">
                {/* Starting City */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">Ponto de Partida</label>
                  <select
                    value={startCity}
                    onChange={(e) => setStartCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                  >
                    <option value="Balsas">Balsas</option>
                    <option value="Riachão">Riachão</option>
                    <option value="Carolina">Carolina</option>
                    <option value="Tasso Fragoso">Tasso Fragoso</option>
                  </select>
                </div>

                {/* Destination City */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">Ponto de Destino</label>
                  <select
                    value={endCity}
                    onChange={(e) => setEndCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                  >
                    <option value="Balsas" disabled={startCity === "Balsas"}>Balsas</option>
                    <option value="Riachão" disabled={startCity === "Riachão"}>Riachão</option>
                    <option value="Carolina" disabled={startCity === "Carolina"}>Carolina</option>
                    <option value="Tasso Fragoso" disabled={startCity === "Tasso Fragoso"}>Tasso Fragoso</option>
                  </select>
                </div>
              </div>

              {/* Weight selection input */}
              <div className="flex flex-col gap-1.5" id="weight-slider-input">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-600">Peso do Envio (kg)</span>
                  <span className="font-mono font-extrabold text-vapt bg-vapt-light px-2 py-0.5 rounded">
                    {weightKg} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="5000"
                  step="5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value))}
                  className="w-full accessory-accent-color cursor-pointer h-2 bg-slate-100 rounded-lg outline-none"
                  style={{ accentColor: '#093B84' }}
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-bold" id="weight-ranges-text">
                  <span>Pequena (5kg)</span>
                  <span>Carga Média (1t)</span>
                  <span>Grande (5t)</span>
                </div>
              </div>

              {/* Space Allocation Toggle (Exclusive vs Shared) */}
              <div className="flex flex-col gap-1.5" id="space-allocation-toggle">
                <label className="text-xs font-bold text-gray-600">Tipo de Alocação de Espaço</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-gray-200" id="allocation-toggle-row">
                  <button
                    onClick={() => setFreightType('shared')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      freightType === 'shared'
                        ? 'bg-vapt text-white shadow'
                        : 'text-gray-500 hover:text-vapt'
                    }`}
                    style={freightType === 'shared' ? { backgroundColor: '#093B84' } : {}}
                    id="toggle-space-shared"
                  >
                    🤝 Frete Conjunto
                  </button>
                  <button
                    onClick={() => setFreightType('exclusive')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      freightType === 'exclusive'
                        ? 'bg-vapt text-white shadow'
                        : 'text-gray-500 hover:text-vapt'
                    }`}
                    style={freightType === 'exclusive' ? { backgroundColor: '#093B84' } : {}}
                    id="toggle-space-exclusive"
                  >
                    🚚 Exclusivo (Urgente)
                  </button>
                </div>
              </div>

              {/* Breakdown formula display strictly obeying PDF Section 5 instructions */}
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 text-xs space-y-2.5" id="pricing-breakdown-panel">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 border-b border-gray-200 pb-1.5">
                  <span>Fórmula Transparente</span>
                  <span className="text-vapt">Cálculo Vapt</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Distância Calculada:</span>
                  <strong className="text-vapt-dark font-mono">{getDistanceAmount} km</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Taxa Base de Serviço:</span>
                  <strong className="text-vapt-dark font-mono">
                    R$ {breakdown.taxaBase?.toFixed(2)}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Parcela Peso ({weightKg}kg * R$ 0,20):</span>
                  <strong className="text-vapt-dark font-mono">
                    R$ {breakdown.pesoCalculo?.toFixed(2)}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Combustível ({getDistanceAmount}km * R$ 1,95):</span>
                  <strong className="text-vapt-dark font-mono">
                    R$ {breakdown.combustivelCalculo?.toFixed(2)}
                  </strong>
                </div>

                {freightType === 'shared' && (
                  <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                    <span className="font-bold flex items-center gap-1">
                      🎁 Desc. Frete Conjunto (-25%):
                    </span>
                    <strong className="font-mono">
                      - R$ {breakdown.desconto?.toFixed(2)}
                    </strong>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2.5 border-t border-gray-200 mt-2 text-sm">
                  <span className="font-extrabold text-vapt-dark">Estimativa do Preço Final:</span>
                  <strong className="text-lg text-vapt font-extrabold font-mono" style={{ color: '#093B84' }}>
                    R$ {calculatedPrice.toLocaleString('pt', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              {/* Budget request check CTA inside client wallet */}
              {simulatedAccountBalance < calculatedPrice ? (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2" id="wallet-warning">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Saldo disponível insuficiente. Por favor clique no ícone recarregar carteira.</span>
                </div>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 "
                  id="btn-calculator-submit"
                >
                  <Package className="w-5 h-5" />
                  <span>Simular Solicitação de Frete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
