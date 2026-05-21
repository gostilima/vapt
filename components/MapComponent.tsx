'use client';

import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Navigation, Info, ShieldCheck, Compass, AlertCircle } from 'lucide-react';

interface City {
  id: string;
  name: string;
  x: number; // Percent width of SVG
  y: number; // Percent height of SVG
  population: string;
  description: string;
}

interface SimulatedDriver {
  id: string;
  name: string;
  vehicle: string;
  capacityLeft: number; // in kg
  routeStart: string;
  routeEnd: string;
  progress: number; // 0 to 100
  color: string;
  coordinates: { x: number; y: number };
}

interface MapComponentProps {
  selectedStartCity: string;
  selectedEndCity: string;
  onSelectRoute: (start: string, end: string) => void;
  filteredDriversCount?: (count: number) => void;
}

export const cities: City[] = [
  { id: 'Balsas', name: 'Balsas', x: 50, y: 48, population: '100k hab.', description: 'Principal polo do agronegócio regional e sede central do Vapt' },
  { id: 'Riachão', name: 'Riachão', x: 35, y: 35, population: '20k hab.', description: 'Famoso polo turístico pelas cachoeiras e águas cristalinas' },
  { id: 'Carolina', name: 'Carolina', x: 18, y: 25, population: '24k hab.', description: 'Portal da Chapada das Mesas, fronteira com o Tocantins' },
  { id: 'Tasso Fragoso', name: 'Tasso Fragoso', x: 68, y: 78, population: '15k hab.', description: 'Grande polo produtor de grãos e soja ao sul do planalto' }
];

export const regionalHighways = [
  { from: 'Balsas', to: 'Riachão', distance: 140, label: 'BR-230' },
  { from: 'Riachão', to: 'Carolina', distance: 100, label: 'BR-230' },
  { from: 'Balsas', to: 'Tasso Fragoso', distance: 155, label: 'MA-007 / MA-006' },
  { from: 'Carolina', to: 'Tasso Fragoso', distance: 340, label: 'Rota do Oeste' },
];

export default function MapComponent({ selectedStartCity, selectedEndCity, onSelectRoute, filteredDriversCount }: MapComponentProps) {
  const [activeTab, setActiveTab] = useState<'map' | 'routes'>('map');
  const [selectedPin, setSelectedPin] = useState<any>(null);
  
  // Simulated moving drivers
  const [drivers, setDrivers] = useState<SimulatedDriver[]>([
    {
      id: 'drv-1',
      name: 'Reginaldo Silva',
      vehicle: 'Caminhão 3/4',
      capacityLeft: 1800,
      routeStart: 'Balsas',
      routeEnd: 'Carolina',
      progress: 42,
      color: '#093B84',
      coordinates: { x: 0, y: 0 }
    },
    {
      id: 'drv-2',
      name: 'Carlos Oliveira',
      vehicle: 'Caminhão Truck',
      capacityLeft: 6200,
      routeStart: 'Tasso Fragoso',
      routeEnd: 'Balsas',
      progress: 68,
      color: '#10B981',
      coordinates: { x: 0, y: 0 }
    },
    {
      id: 'drv-3',
      name: 'Mariano Santos',
      vehicle: 'Fiat Strada',
      capacityLeft: 250,
      routeStart: 'Balsas',
      routeEnd: 'Riachão',
      progress: 15,
      color: '#F59E0B',
      coordinates: { x: 0, y: 0 }
    },
    {
      id: 'drv-4',
      name: 'Vitória Transportes',
      vehicle: 'Bitrem (Carreta)',
      capacityLeft: 18500,
      routeStart: 'Carolina',
      routeEnd: 'Balsas',
      progress: 82,
      color: '#8B5CF6',
      coordinates: { x: 0, y: 0 }
    }
  ]);

  // Handle movements animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) => {
          let updatedProgress = driver.progress + 0.6;
          if (updatedProgress > 100) {
            updatedProgress = 0; // Loop travel
          }
          return {
            ...driver,
            progress: updatedProgress
          };
        })
      );
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Calculate coordinates based on highway nodes
  const getDriverCoordinates = (driver: SimulatedDriver) => {
    const startNode = cities.find((c) => c.name === driver.routeStart);
    const endNode = cities.find((c) => c.name === driver.routeEnd);

    if (!startNode || !endNode) return { x: 50, y: 50 };

    // Linear interpolation
    const factor = driver.progress / 100;
    const x = startNode.x + (endNode.x - startNode.x) * factor;
    const y = startNode.y + (endNode.y - startNode.y) * factor;

    return { x, y };
  };

  // Render connections lines paths
  const renderConnections = () => {
    return regionalHighways.map((highway, index) => {
      const startNode = cities.find((c) => c.name === highway.from);
      const endNode = cities.find((c) => c.name === highway.to);

      if (!startNode || !endNode) return null;

      // Color active highway path selectively
      const isRouteActive = 
        (selectedStartCity === highway.from && selectedEndCity === highway.to) ||
        (selectedStartCity === highway.to && selectedEndCity === highway.from);

      return (
        <g key={index} id={`highway-group-${index}`}>
          {/* Glowing active route line or standard connection */}
          <line
            x1={`${startNode.x}%`}
            y1={`${startNode.y}%`}
            x2={`${endNode.x}%`}
            y2={`${endNode.y}%`}
            stroke={isRouteActive ? '#093B84' : '#94A3B8'}
            strokeWidth={isRouteActive ? 5 : 2}
            strokeDasharray={isRouteActive ? 'none' : '4 4'}
            className={`${isRouteActive ? 'animate-pulse' : ''} transition-all duration-300`}
            opacity={isRouteActive ? 0.9 : 0.4}
            id={`highway-line-${index}`}
          />
          {/* Distance Text Overlay Badge */}
          <foreignObject
            x={`${(startNode.x + endNode.x) / 2 - 22}%`}
            y={`${(startNode.y + endNode.y) / 2 - 8}%`}
            width="50"
            height="22"
            className="overflow-visible"
            id={`highway-badge-${index}`}
          >
            <div className={`px-1.5 py-0.5 rounded border text-[9px] font-mono text-center shadow-sm select-none ${
              isRouteActive 
                ? 'bg-vapt text-white border-vapt font-extrabold scale-110' 
                : 'bg-white text-gray-400 border-gray-200'
            }`}>
              {highway.distance}km
            </div>
          </foreignObject>
        </g>
      );
    });
  };

  // Filter drivers on active route or surrounding areas
  const getDisplayDrivers = () => {
    if (!selectedStartCity && !selectedEndCity) return drivers;
    
    return drivers.filter(d => {
      if (selectedStartCity && selectedEndCity) {
        return (d.routeStart === selectedStartCity && d.routeEnd === selectedEndCity) ||
               (d.routeStart === selectedEndCity && d.routeEnd === selectedStartCity);
      }
      if (selectedStartCity) {
        return d.routeStart === selectedStartCity || d.routeEnd === selectedStartCity;
      }
      return true;
    });
  };

  const filtered = getDisplayDrivers();

  // Send filtered count up
  useEffect(() => {
    if (filteredDriversCount) {
      filteredDriversCount(filtered.length);
    }
  }, [filtered.length, filteredDriversCount]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full" id="map-widget-container">
      {/* Map Interactive Tabs bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-slate-50" id="map-tabs-header">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-vapt" />
          <span className="font-display font-extrabold text-sm text-vapt-dark uppercase tracking-wider">
            Monitoramento de Rotas
          </span>
        </div>

        <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 text-xs" id="map-toggle-btns">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1 font-semibold rounded-md transition-all ${
              activeTab === 'map' ? 'bg-vapt text-white shadow-sm' : 'text-gray-500 hover:text-vapt'
            }`}
            style={activeTab === 'map' ? { backgroundColor: '#093B84' } : {}}
            id="map-tab-visual"
          >
            Mapa Sul Maranhão
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 py-1 font-semibold rounded-md transition-all ${
              activeTab === 'routes' ? 'bg-vapt text-white shadow-sm' : 'text-gray-500 hover:text-vapt'
            }`}
            style={activeTab === 'routes' ? { backgroundColor: '#093B84' } : {}}
            id="map-tab-routes"
          >
            Rotas Ativas ({filtered.length})
          </button>
        </div>
      </div>

      {activeTab === 'map' ? (
        /* Visual SVG region screen */
        <div className="relative flex-1 bg-slate-100 min-h-[350px] overflow-hidden" id="visual-map-screen">
          {/* Compass grid gridlines representing technical logistics design */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-30 pointer-events-none">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="border-b border-r border-gray-200" />
            ))}
          </div>

          <svg className="w-full h-full min-h-[350px]" id="maranhao-map-svg">
            {/* Background Maranhão Rivers and geographic contours (Simulated abstract paths) */}
            <path 
              d="M -10,30 C 30,25 45,55 58,110 M 70,-10 C 65,40 85,80 110,105" 
              stroke="#E2E8F0" 
              strokeWidth="12" 
              fill="none" 
              opacity="0.8" 
              id="river-beds"
            />

            {/* Render Connection lines */}
            {renderConnections()}

            {/* Drivers Markers with custom position interp */}
            {filtered.map((driver) => {
              const pos = getDriverCoordinates(driver);
              return (
                <g 
                  key={driver.id} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedPin({ type: 'driver', data: driver })}
                  id={`marker-driver-g-${driver.id}`}
                >
                  {/* Glowing background ring */}
                  <circle
                    cx={`${pos.x}%`}
                    cy={`${pos.y}%`}
                    r="12"
                    fill={driver.color}
                    className="animate-ping opacity-25"
                    style={{ fill: driver.color }}
                  />
                  {/* Outer circle pin outline */}
                  <circle
                    cx={`${pos.x}%`}
                    cy={`${pos.y}%`}
                    r="8"
                    fill="white"
                    stroke={driver.color}
                    strokeWidth="3.5"
                    style={{ stroke: driver.color }}
                    className="shadow-sm group-hover:scale-125 transition-transform"
                    id={`circle-d-${driver.id}`}
                  />
                  {/* Tiny cargo vehicle icon overlay */}
                  <foreignObject
                    x={`${pos.x - 5}%`}
                    y={`${pos.y - 5}%`}
                    width="12"
                    height="12"
                    className="pointer-events-none"
                  >
                    <Truck className="w-3 h-3 text-vapt font-bold" style={{ color: driver.color, width: '10px', height: '10px' }} />
                  </foreignObject>
                </g>
              );
            })}

            {/* Cities Node Circles */}
            {cities.map((city) => {
              const isStart = city.name === selectedStartCity;
              const isEnd = city.name === selectedEndCity;
              const isSelected = isStart || isEnd;

              return (
                <g 
                  key={city.id} 
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedPin({ type: 'city', data: city });
                    if (!selectedStartCity) {
                      onSelectRoute(city.name, '');
                    } else if (selectedStartCity && !selectedEndCity && selectedStartCity !== city.name) {
                      onSelectRoute(selectedStartCity, city.name);
                    } else {
                      onSelectRoute(city.name, '');
                    }
                  }}
                  id={`marker-city-g-${city.id}`}
                >
                  {/* Selection pulse indicator */}
                  {isSelected && (
                    <circle
                      cx={`${city.x}%`}
                      cy={`${city.y}%`}
                      r="18"
                      className="animate-pulse"
                      fill={isStart ? '#10B981' : '#093B84'}
                      opacity="0.25"
                    />
                  )}

                  {/* Standard outer circle */}
                  <circle
                    cx={`${city.x}%`}
                    cy={`${city.y}%`}
                    r="7.5"
                    fill={isSelected ? (isStart ? '#10B981' : '#093B84') : 'white'}
                    stroke={isSelected ? 'white' : '#093B84'}
                    strokeWidth="3.5"
                    className="transition-transform group-hover:scale-115 shadow"
                    id={`circle-c-${city.id}`}
                  />

                  {/* City Label Badge overlay */}
                  <foreignObject
                    x={`${city.x - 17}%`}
                    y={`${city.y + 4.5}%`}
                    width="80"
                    height="35"
                    className="overflow-visible"
                    id={`city-lbl-${city.id}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold text-center transition-all select-none border shadow-inner ${
                        isSelected 
                          ? 'bg-vapt-dark text-white border-vapt-dark scale-105' 
                          : 'bg-white text-vapt-dark border-gray-200 hover:bg-vapt-light'
                      }`}>
                        {city.name}
                      </span>
                      {isSelected && (
                        <span className="text-[8px] font-bold text-gray-400 bg-white/85 px-1 rounded mt-0.5">
                          {isStart ? 'Origem 🏁' : 'Destino 🎯'}
                        </span>
                      )}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* Map Overlay helper panel */}
          <div className="absolute bottom-3 left-3 bg-white/95 border border-gray-200 px-3 py-2.5 rounded-xl shadow-md text-[10px] space-y-1.5 backdrop-blur-sm z-10" id="map-legend">
            <span className="font-bold text-vapt-dark block mb-1">Legenda Operacional</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="text-gray-600">Origem Selecionada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#093B84]" />
              <span className="text-gray-600">Destino Selecionado / Motorista</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#093B84]" />
              <span className="text-gray-600">Cidade Base</span>
            </div>
            <p className="text-[8px] text-gray-400 pt-1 border-t border-gray-100 italic">
              * Clique em duas cidades para gerar trajeto.
            </p>
          </div>

          {/* Right/Bottom active popup drawer on SVG item selection */}
          {selectedPin && (
            <div className="absolute bottom-3 right-3 left-3 md:left-auto md:w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-bottom-2 z-20" id="map-drawer">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display font-extrabold text-vapt-dark text-sm">
                    {selectedPin.type === 'city' ? `Cidade: ${selectedPin.data.name}` : `Motorista Vapt: ${selectedPin.data.name}`}
                  </h4>
                  <span className="text-[9px] font-mono font-bold tracking-wider text-vapt uppercase">
                    {selectedPin.type === 'city' ? selectedPin.data.population : selectedPin.data.vehicle}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="p-1 rounded bg-slate-100 text-gray-500 text-xs font-bold hover:bg-slate-200"
                  id="close-map-drawer"
                >
                  X
                </button>
              </div>

              <div className="mt-2.5 border-t border-gray-100 pt-2.5 text-xs text-gray-500" id="map-drawer-content">
                {selectedPin.type === 'city' ? (
                  <p className="leading-relaxed">{selectedPin.data.description}</p>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Percurso:</span>
                      <strong className="text-vapt-dark">{selectedPin.data.routeStart} ➔ {selectedPin.data.routeEnd}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Progresso da Viagem:</span>
                      <strong className="text-vapt-dark">{Math.round(selectedPin.data.progress)}% concluído</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Espaço de Carga Disponível:</span>
                      <strong className="text-green-600">{selectedPin.data.capacityLeft} kg</strong>
                    </div>
                    <p className="text-[10px] bg-vapt-light p-1.5 rounded text-vapt mt-2">
                      💡 Aceita <strong>Frete Conjunto</strong> com desconto de 25% no quilômetro rodado!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List Routes tab */
        <div className="flex-1 bg-white p-5 space-y-3 min-h-[350px] overflow-y-auto" id="list-routes-tab">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400 space-y-2 flex flex-col items-center justify-center h-full" id="no-filtered-routes">
              <AlertCircle className="w-8 h-8 opacity-40" />
              <p className="text-sm font-semibold">Nenhuma viagem ativa encontrada para este filtro.</p>
              <p className="text-[11px] text-gray-400">Selecione outras rotas no mapa ou limpe sua pesquisa.</p>
            </div>
          ) : (
            <div className="space-y-3" id="routes-mapped-container">
              <span className="text-[11px] font-bold text-gray-400 block uppercase mb-4">Viagens Ativas Simulando Agora ({filtered.length})</span>
              {filtered.map((drv) => (
                <div 
                  key={drv.id}
                  className="p-4 bg-slate-50 border border-gray-200 rounded-xl hover:border-vapt transition-all flex justify-between items-center"
                  id={`route-card-${drv.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: drv.color }} />
                      <strong className="text-xs text-vapt-dark font-display">{drv.name}</strong>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <span>{drv.routeStart}</span>
                      <span className="font-bold">➔</span>
                      <span>{drv.routeEnd}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5 inline-block font-mono">
                      {drv.vehicle}
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-gray-400 block">Capacidade livre:</span>
                    <strong className="text-xs text-green-600 block">{drv.capacityLeft} kg</strong>
                    <div className="w-20 bg-gray-200 h-1 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-vapt h-full rounded-full" style={{ width: `${drv.progress}%`, backgroundColor: '#093B84' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
