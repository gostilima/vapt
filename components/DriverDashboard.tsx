'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, ClipboardList, TrendingUp, MapPin, 
  CircleCheck, Hourglass, Calendar, Navigation, 
  RefreshCw, Info, AlertCircle, Plus, ChevronRight, Fuel,
  ArrowRight, MessageSquare
} from 'lucide-react';
import Logo from './Logo';
import NegotiationChat from './NegotiationChat';

interface DriverDashboardProps {
  userProfile: any;
  onLogout: () => void;
}

interface SimulatedOffer {
  id: string;
  clientName: string;
  start: string;
  end: string;
  weight: number;
  distance: number;
  price: number;
  type: 'exclusive' | 'shared';
  status: 'Pendente' | 'Coletado' | 'Em Trânsito' | 'Entregue';
}

interface ProgrammedTravel {
  id: string;
  start: string;
  end: string;
  date: string;
  status: 'Programado' | 'Em Andamento' | 'Concluído';
  occupiedWeight: number;
  maxWeight: number;
}

export default function DriverDashboard({ userProfile, onLogout }: DriverDashboardProps) {
  const [activeChatOfferId, setActiveChatOfferId] = useState<string | null>(null);

  const vehicleDetails = userProfile.vehicleDetails || {
    type: 'Caminhão 3/4',
    capacityKg: 4500,
    volumeM3: 18
  };

  const operatingCities = userProfile.operatingCities || ['Balsas', 'Carolina'];

  const [activeOffers, setActiveOffers] = useState<SimulatedOffer[]>([]);
  
  // Lazy-initialize scheduled travels state to comply with ESLint
  const [scheduledTravels, setScheduledTravels] = useState<ProgrammedTravel[]>(() => {
    return [
      {
        id: 'TRV-401',
        start: 'Balsas',
        end: 'Carolina',
        date: 'Amanhã - 07:30',
        status: 'Programado',
        occupiedWeight: 450,
        maxWeight: vehicleDetails.capacityKg
      },
      {
        id: 'TRV-309',
        start: 'Riachão',
        end: 'Balsas',
        date: 'Hoje - 15:00',
        status: 'Concluído',
        occupiedWeight: 2200,
        maxWeight: vehicleDetails.capacityKg
      }
    ];
  });
  
  const [earnings, setEarnings] = useState<number>(1280.00);
  
  // Scheduled Travel Form
  const [showAddTravel, setShowAddTravel] = useState(false);
  const [travelStart, setTravelStart] = useState('Balsas');
  const [travelEnd, setTravelEnd] = useState('Carolina');
  const [travelTime, setTravelTime] = useState('Hoje - Próximos instantes');


  // Load matching offers from user profile and client shipments
  useEffect(() => {
    const syncWithClientShipments = () => {
      let mergedOffers: SimulatedOffer[] = [];
      let userOffersFound = false;
      
      // Look for any keys containing "vapt_requests_" in localStorage, ignoring the fallback key
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('vapt_requests_') && key !== 'vapt_requests_default') {
          try {
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            if (list.length > 0) {
              userOffersFound = true;
            }
            mergedOffers = [...mergedOffers, ...list];
          } catch (e) {
            console.error('Error synchronizing driver offers', e);
          }
        }
      }

      // If no user offers exist, load/initialize the regional default offers
      if (!userOffersFound) {
        try {
          const savedDefault = localStorage.getItem('vapt_requests_default');
          if (savedDefault) {
            mergedOffers = JSON.parse(savedDefault);
          } else {
            mergedOffers = [
              {
                id: 'REQ-2342',
                clientName: 'Fazenda Rio Grande',
                start: 'Balsas',
                end: 'Tasso Fragoso',
                weight: 3400,
                distance: 155,
                price: 780.00,
                type: 'exclusive',
                status: 'Pendente'
              },
              {
                id: 'REQ-1209',
                clientName: 'Armazém Carolina',
                start: 'Riachão',
                end: 'Carolina',
                weight: 350,
                distance: 100,
                price: 180.50,
                type: 'shared',
                status: 'Pendente'
              }
            ];
            localStorage.setItem('vapt_requests_default', JSON.stringify(mergedOffers));
          }
        } catch (e) {}
      }
      setActiveOffers(mergedOffers.filter(off => off.status !== 'Entregue'));
    };

    syncWithClientShipments();
    const interval = setInterval(syncWithClientShipments, 4000); // Poll for new client bookings

    return () => clearInterval(interval);
  }, []);


  // Accept dynamic collect of regional client offering
  const handleAcceptOffer = (offerId: string, clientName?: string) => {
    // Find the client owner of the offer by scanning localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vapt_requests_')) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = list.findIndex((x: any) => x.id === offerId);
          if (idx !== -1) {
            // Found it! Progress status from Pendente to Coletado -> Em Trânsito -> Entregue
            const currentStatus = list[idx].status;
            let nextStatus: 'Pendente' | 'Coletado' | 'Em Trânsito' | 'Entregue' = 'Coletado';
            
            if (currentStatus === 'Pendente') nextStatus = 'Coletado';
            else if (currentStatus === 'Coletado') nextStatus = 'Em Trânsito';
            else if (currentStatus === 'Em Trânsito') {
              nextStatus = 'Entregue';
              // Add simulated commission earnings
              setEarnings(prev => prev + list[idx].price);
            }

            list[idx].status = nextStatus;
            localStorage.setItem(key, JSON.stringify(list));
            break;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Refresh driver active offer state (filtering out delivered offers immediately)
    setActiveOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        const nextMap: Record<string, 'Pendente' | 'Coletado' | 'Em Trânsito' | 'Entregue'> = {
          'Pendente': 'Coletado',
          'Coletado': 'Em Trânsito',
          'Em Trânsito': 'Entregue'
        };
        return { ...o, status: nextMap[o.status] || 'Entregue' };
      }
      return o;
    }).filter(o => o.status !== 'Entregue'));
  };

  // Add new Scheduled travel
  const handleAddTravel = (e: React.FormEvent) => {
    e.preventDefault();
    if (travelStart === travelEnd) return;

    const newTravel: ProgrammedTravel = {
      id: `TRV-${Math.floor(100 + Math.random() * 900)}`,
      start: travelStart,
      end: travelEnd,
      date: travelTime,
      status: 'Programado',
      occupiedWeight: 0,
      maxWeight: vehicleDetails.capacityKg
    };

    setScheduledTravels([newTravel, ...scheduledTravels]);
    setShowAddTravel(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="driver-dashboard-frame">
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

      {/* Driver top header stats layout */}
      <header className="bg-[#05234F] text-white px-6 py-5 sticky top-0 z-40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md" id="driver-nav-bar">
        <div className="flex items-center gap-2">
          <Logo showText size={35} />
          <span className="text-[10px] font-bold text-white bg-blue-600/50 px-2.5 py-0.5 rounded-full border border-blue-400">
            Parceiro Transportador
          </span>
        </div>

        {/* Driver fast credentials brief */}
        <div className="flex items-center gap-6 justify-between md:justify-end" id="driver-brief-indicators">
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-gray-300 font-bold uppercase leading-none">Faturamento Total</span>
            <strong className="text-base text-green-400 font-extrabold font-mono pt-1">
              R$ {earnings.toLocaleString('pt', { minimumFractionDigits: 2 })}
            </strong>
          </div>

          <div className="flex items-center gap-2.5 border-l border-white/20 pl-6" id="driver-identity">
            <div className="text-right">
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">{userProfile.name}</div>
              <div className="text-[9.5px] text-blue-200">{vehicleDetails.type}</div>
            </div>
            <button 
              onClick={onLogout}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all border border-white/15 cursor-pointer"
              id="driver-logout-btn"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Core Grid contents */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid lg:grid-cols-12 gap-6 relative z-10" id="driver-main-grid">
        
        {/* Left Side: Vehicle Profile & Scheduled Travels */}
        <div className="lg:col-span-4 space-y-6" id="driver-limits-sidebar">
          
          {/* Card 1: Ficha do Veículo */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" id="driver-vehicle-caps-card">
            <h3 className="font-display font-bold text-sm text-vapt-dark uppercase border-b border-gray-100 pb-3 block tracking-wide mb-4">
              Ficha do Parceiro & Veículo
            </h3>
            
            <div className="space-y-4" id="driver-vehicle-list">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Canal Ativo:</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                  ● Operando em Balsas
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl" id="sidebar-vehicle-brief">
                <div className="p-2.5 bg-blue-100 text-vapt rounded-lg">
                  <Truck className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <strong className="text-xs text-vapt-dark block">{vehicleDetails.type}</strong>
                  <span className="text-[10px] text-gray-400">Capacidade: {vehicleDetails.capacityKg}kg / {vehicleDetails.volumeM3}m³</span>
                </div>
              </div>

              {/* Operating locations */}
              <div className="space-y-1.5" id="operating-cities-block">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Zona de Atuação do Parceiro:</span>
                <div className="flex flex-wrap gap-1.5">
                  {operatingCities.map((city: string) => (
                    <span 
                      key={city}
                      className="px-2 py-1 bg-vapt-light hover:bg-vapt hover:text-white text-vapt font-bold rounded-lg text-[10px] transition-colors border border-vapt/10"
                    >
                      📍 {city}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400 leading-relaxed" id="driver-ear-helper">
                <Fuel className="w-4 h-4 text-vapt" />
                <span>CNH EAR e CRLV do veículo aprovados pela equipe Vapt Balsas.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Fretes Programados list, item 4 of PDF */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col" id="programmed-travels-card">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-vapt" />
                <h3 className="font-display font-bold text-sm text-vapt-dark">
                  Fretes Programados
                </h3>
              </div>
              <button
                onClick={() => setShowAddTravel(!showAddTravel)}
                className="p-1 rounded-lg bg-vapt hover:bg-vapt-dark text-white shadow-sm transition-all flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: '#093B84' }}
                id="btn-add-travel"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Travel Form Overlay if shown */}
            {showAddTravel && (
              <form onSubmit={handleAddTravel} className="p-3 bg-slate-50 rounded-xl border border-gray-200 mb-4 space-y-3.5 animate-in slide-in-from-top-3" id="add-travel-form">
                <span className="text-[10px] font-bold text-vapt block">Programar Nova Viagem</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-bold">Origem</label>
                    <select 
                      value={travelStart} 
                      onChange={(e) => setTravelStart(e.target.value)}
                      className="p-2 border border-gray-200 bg-white rounded-lg text-xs"
                    >
                      <option value="Balsas">Balsas</option>
                      <option value="Riachão">Riachão</option>
                      <option value="Carolina">Carolina</option>
                      <option value="Tasso Fragoso">Tasso Fragoso</option>
                      <option value="São Raimundo das Mangabeiras">São Raimundo das Mangabeiras</option>
                      <option value="Imperatriz">Imperatriz</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-bold">Destino</label>
                    <select 
                      value={travelEnd} 
                      onChange={(e) => setTravelEnd(e.target.value)}
                      className="p-2 border border-gray-200 bg-white rounded-lg text-xs"
                    >
                      <option value="Balsas" disabled={travelStart === "Balsas"}>Balsas</option>
                      <option value="Riachão" disabled={travelStart === "Riachão"}>Riachão</option>
                      <option value="Carolina" disabled={travelStart === "Carolina"}>Carolina</option>
                      <option value="Tasso Fragoso" disabled={travelStart === "Tasso Fragoso"}>Tasso Fragoso</option>
                      <option value="São Raimundo das Mangabeiras" disabled={travelStart === "São Raimundo das Mangabeiras"}>São Raimundo das Mangabeiras</option>
                      <option value="Imperatriz" disabled={travelStart === "Imperatriz"}>Imperatriz</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-bold">Data e Horário</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Hoje, às 18:30" 
                    value={travelTime} 
                    onChange={(e) => setTravelTime(e.target.value)}
                    className="p-2 border border-gray-200 bg-white rounded-lg text-xs"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddTravel(false)}
                    className="flex-1 py-1.5 px-3 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-1.5 px-3 bg-vapt text-white rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: '#093B84' }}
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            )}

            {/* Programmed travels scroller list */}
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto" id="driver-travels-scroller">
              {scheduledTravels.map((travel) => (
                <div 
                  key={travel.id}
                  className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-2 relative"
                  id={`travel-${travel.id}`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold text-gray-400">{travel.id}</span>
                    <span className={`px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      travel.status === 'Programado' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                      travel.status === 'Em Andamento' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      'bg-green-50 text-green-600 border border-green-200'
                    }`}>
                      {travel.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-vapt-dark" id="travel-route-display">
                    <span>{travel.start}</span>
                    <span className="text-gray-400 font-normal">➔</span>
                    <span>{travel.end}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold" id="travel-meta">
                    <span className="flex items-center gap-1 font-mono">
                      📅 {travel.date}
                    </span>
                    <span>Peso Alocado: <strong>{travel.occupiedWeight}kg</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Live Client Shipping requests to collect & process */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col h-full" id="offers-board">
          
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3" id="offers-board-header">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-vapt" />
              <h3 className="font-display font-bold text-base text-vapt-dark">
                Painel Regional de Ofertas de Encomendas
              </h3>
            </div>
            
            <div className="flex items-center gap-2 text-xs" id="offers-counter">
              <span className="text-gray-400 font-bold">Monitorando Ativas:</span>
              <strong className="text-vapt font-extrabold font-mono text-sm bg-vapt-light px-2 py-0.5 rounded">
                {activeOffers.length}
              </strong>
            </div>
          </div>

          {activeOffers.length === 0 ? (
            <div className="text-center py-16 text-gray-400 flex flex-col items-center justify-center gap-3" id="empty-offers">
              <AlertCircle className="w-10 h-10 opacity-30 animate-bounce" />
              <p className="text-base font-semibold text-vapt-dark">Fila de espera de coletas vazia no momento.</p>
              <p className="text-xs max-w-sm mx-auto leading-relaxed">
                Quando clientes do app reservarem fretes para Balsas, Carolina, Riachão ou Tasso Fragoso, eles serão exibidos aqui instantaneamente para coleta.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4" id="offers-cards-grid">
              {activeOffers.map((off) => {
                const isPendente = off.status === 'Pendente';
                const isColetado = off.status === 'Coletado';
                const isEmTransito = off.status === 'Em Trânsito';

                let btnLabel = 'Confirmar Coleta';
                let btnColorClass = 'bg-vapt hover:bg-vapt-dark text-white';
                if (isColetado) {
                  btnLabel = 'Iniciar Trânsito (Rota)';
                  btnColorClass = 'bg-indigo-600 hover:bg-indigo-700 text-white';
                } else if (isEmTransito) {
                  btnLabel = 'Simular Finalização (Entregue)';
                  btnColorClass = 'bg-green-600 hover:bg-green-700 text-white';
                }

                return (
                  <div 
                    key={off.id}
                    className="p-5 rounded-2xl border border-gray-200 hover:border-vapt transition-all bg-slate-50 flex flex-col h-full relative"
                    id={`offer-card-${off.id}`}
                  >
                    {/* Corner badge indicating Shared or Exclusive */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize bg-white text-gray-600">
                      {off.type === 'exclusive' ? '🚚 Exclusivo' : '🤝 Conjunto'}
                    </div>

                    <div className="space-y-4 flex-grow">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-vapt bg-vapt-light px-1.5 py-0.5 rounded">
                          {off.id}
                        </span>
                        <h4 className="text-xs text-gray-400 font-semibold mt-1">Cliente Solicitante:</h4>
                        <strong className="text-sm font-display text-vapt-dark font-extrabold">{off.clientName || 'Cliente Vapt'}</strong>
                      </div>

                      {/* Route specs */}
                      <div className="flex items-center justify-between border-t border-b border-gray-200/60 py-2 text-xs">
                        <div className="text-left">
                          <span className="text-[9px] text-gray-400 block uppercase font-bold">Origem</span>
                          <strong className="text-vapt-dark">{off.start}</strong>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />
                        <div className="text-right">
                          <span className="text-[9px] text-gray-400 block uppercase font-bold">Destino</span>
                          <strong className="text-vapt-dark">{off.end}</strong>
                        </div>
                      </div>

                      {/* Spec numbers */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 font-semibold" id="offer-numerical-specs">
                        <div>
                          <span>Peso Total:</span>
                          <strong className="text-vapt-dark ml-1 block">{off.weight} kg</strong>
                        </div>
                        <div>
                          <span>Remuneração Livre:</span>
                          <strong className="text-green-600 ml-1 block">R$ {off.price.toLocaleString('pt', { minimumFractionDigits: 2 })}</strong>
                        </div>
                      </div>

                      {/* Timeline/State badge indicator */}
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-200 text-[11px]" id="offer-progress-state">
                        <span className="text-gray-400">Etapa Atual:</span>
                        <strong className="text-vapt font-bold uppercase">
                          🚗 {off.status}
                        </strong>
                      </div>
                    </div>

                    {/* Action Step trigger button */}
                    <div className="flex gap-2 mt-5">
                      <button
                        onClick={() => setActiveChatOfferId(off.id)}
                        className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-vapt hover:text-vapt-dark border border-blue-200 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1"
                        title="Conversar com o Cliente"
                        id={`btn-chat-driver-${off.id}`}
                      >
                        <MessageSquare className="w-4 h-4 animate-pulse" />
                        <span>Chat</span>
                      </button>

                      <button
                        onClick={() => handleAcceptOffer(off.id, off.clientName)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 ${btnColorClass}`}
                        id={`offer-action-btn-${off.id}`}
                      >
                        <span>{btnLabel}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Real-time Negotiation Chat Panel */}
      {activeChatOfferId && (() => {
        const activeOff = activeOffers.find(o => o.id === activeChatOfferId);
        if (!activeOff) return null;
        return (
          <NegotiationChat
            offerId={activeChatOfferId}
            currentUserRole="driver"
            currentUserName={userProfile.name}
            offerPrice={activeOff.price}
            offerStart={activeOff.start}
            offerEnd={activeOff.end}
            onClose={() => setActiveChatOfferId(null)}
          />
        );
      })()}
    </div>
  );
}
