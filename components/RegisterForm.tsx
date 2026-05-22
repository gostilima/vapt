'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, User, Phone, Mail, FileText, Compass, 
  Layers, CheckCircle, Award, Briefcase, ChevronRight, MapPin 
} from 'lucide-react';
import Logo from './Logo';

interface RegisterFormProps {
  role: 'client' | 'driver';
  onRegisterComplete: (data: any) => void;
  onBack: () => void;
  onGoToLogin?: () => void;
}

export default function RegisterForm({ role, onRegisterComplete, onBack, onGoToLogin }: RegisterFormProps) {
  // Common states
  const [basicData, setBasicData] = useState({
    nameOrCnpj: '',
    email: '',
    phone: '',
    currentLocation: 'Balsas - MA',
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Client Preferences state
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  // Driver Documentation state
  const [driverDoc, setDriverDoc] = useState({
    cnhEar: '',
    crlv: '',
    rntrc: '',
  });

  // Driver Vehicle details state
  const [vehicleType, setVehicleType] = useState('Caminhão 3/4');
  const [vehicleCapacity, setVehicleCapacity] = useState('4500'); // in kg
  const [vehicleVolume, setVehicleVolume] = useState('18'); // in m³

  // Driver Operational Cities state
  const [selectedCities, setSelectedCities] = useState<string[]>(['Balsas']);

  const clientPrefsOptions = [
    { id: 'pereciveis', label: 'Produtos Perecíveis', emoji: '🍎' },
    { id: 'eletronicos', label: 'Eletrônicos', emoji: '💻' },
    { id: 'documentos', label: 'Documentos confidenciais', emoji: '📄' },
    { id: 'moveis', label: 'Móveis e Mudanças', emoji: '📦' }
  ];

  const vehicleOptions = [
    { name: 'Carro de Passeio', cap: '400', vol: '1' },
    { name: 'Fiat Strada (Picape)', cap: '700', vol: '3' },
    { name: 'Caminhão 3/4 (Leve)', cap: '4500', vol: '18' },
    { name: 'Truck (Pesado)', cap: '14000', vol: '45' },
    { name: 'Bitrem (Carreta)', cap: '36000', vol: '110' },
  ];

  const cnearOptions = [
    { id: 'Balsas', label: 'Balsas' },
    { id: 'Riachão', label: 'Riachão' },
    { id: 'Carolina', label: 'Carolina' },
    { id: 'Tasso Fragoso', label: 'Tasso Fragoso' },
    { id: 'São Raimundo das Mangabeiras', label: 'S. R. Mangabeiras' },
    { id: 'Imperatriz', label: 'Imperatriz' },
  ];

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    setErrorMsg('');
    
    // Check if geolocation works
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock coordinates lookup, in Balsas / Maranhao region
          setBasicData(prev => ({ ...prev, currentLocation: 'Balsas, MA (Localização GPS Ativa)' }));
          setDetectingLocation(false);
        },
        () => {
          // If denied, fallback to default
          setTimeout(() => {
            setBasicData(prev => ({ ...prev, currentLocation: 'Balsas, MA (Padrão Centro)' }));
            setDetectingLocation(false);
          }, 800);
        }
      );
    } else {
      setTimeout(() => {
        setBasicData(prev => ({ ...prev, currentLocation: 'Balsas, MA' }));
        setDetectingLocation(false);
      }, 500);
    }
  };

  const togglePreference = (prefId: string) => {
    if (selectedPreferences.includes(prefId)) {
      setSelectedPreferences(prev => prev.filter(p => p !== prefId));
    } else {
      setSelectedPreferences(prev => [...prev, prefId]);
    }
  };

  const toggleCity = (cityId: string) => {
    if (selectedCities.includes(cityId)) {
      if (selectedCities.length === 1) return; // Keep at least one
      setSelectedCities(prev => prev.filter(c => c !== cityId));
    } else {
      setSelectedCities(prev => [...prev, cityId]);
    }
  };

  const handleVehicleChange = (type: string) => {
    setVehicleType(type);
    const matched = vehicleOptions.find(v => v.name.includes(type));
    if (matched) {
      setVehicleCapacity(matched.cap);
      setVehicleVolume(matched.vol);
    }
  };

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!basicData.nameOrCnpj.trim()) {
      setErrorMsg('Por favor, informe seu Nome Completo ou CNPJ.');
      return;
    }
    if (!basicData.email.trim() || !basicData.email.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail válido.');
      return;
    }
    if (!basicData.phone.trim()) {
      setErrorMsg('O número de telefone é obrigatório para notificações de frete.');
      return;
    }

    if (role === 'driver') {
      if (!driverDoc.cnhEar.trim()) {
        setErrorMsg('Informe o número ou registro da sua CNH (com EAR ativa).');
        return;
      }
      if (!driverDoc.crlv.trim()) {
        setErrorMsg('Informe o CRLV do veículo para aprovação de segurança.');
        return;
      }
    }

    // Prepare profile dataset
    const payload = {
      role,
      name: basicData.nameOrCnpj,
      email: basicData.email,
      phone: basicData.phone,
      currentLocation: basicData.currentLocation,
      preferences: role === 'client' ? selectedPreferences : null,
      driverDocs: role === 'driver' ? { ...driverDoc } : null,
      vehicleDetails: role === 'driver' ? {
        type: vehicleType,
        capacityKg: parseInt(vehicleCapacity),
        volumeM3: parseInt(vehicleVolume)
      } : null,
      operatingCities: role === 'driver' ? selectedCities : null,
      createdAt: new Date().toISOString(),
      balance: role === 'driver' ? 0 : 500, // Client starts with R$500 fake credit for tests!
    };

    onRegisterComplete(payload);
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-slate-50 relative overflow-hidden" id="register-wrapper">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-vapt-light opacity-60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-100 opacity-60 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10 py-2 border-b border-gray-100 mb-8" id="register-header">
        <Logo showText size={38} />
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-vapt font-semibold transition-colors duration-200"
          id="register-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Form Card Grid */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full z-10 py-2" id="register-form-container">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-8" id="form-card">
          <div className="mb-6">
            <span className="text-xs font-bold tracking-widest text-vapt bg-vapt-light px-3 py-1 rounded-full uppercase">
              Cadastro {role === 'client' ? 'Cliente' : 'Motorista / Transportador'}
            </span>
            <h2 className="text-2xl font-display font-bold text-vapt-dark mt-3">
              Preencha os dados do {role === 'client' ? 'seu perfil' : 'seu veículo e rotas'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Todos os seus dados de simulação ficam salvos localmente no seu navegador de forma segura.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-xl border border-red-100 flex items-center gap-2" id="form-error-panel">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmission} className="space-y-6" id="registration-main-form">
            {/* Section 1: Dados Básicos (Client & Driver) */}
            <div className="space-y-4" id="form-section-basic">
              <h3 className="text-sm font-bold text-vapt-dark border-b border-gray-100 pb-2 uppercase tracking-wide">
                1. Informações Básicas
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Name / CNPJ Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nameOrCnpj" className="text-xs font-bold text-gray-700">
                    {role === 'client' ? 'Nome Completo ou Razão Social (CNPJ)' : 'Nome Completo'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="nameOrCnpj"
                      placeholder={role === 'client' ? 'Ex: Lucas ou Metalúrgica Balsas S/A' : 'Ex: José Carlos de Souza'}
                      value={basicData.nameOrCnpj}
                      onChange={(e) => setBasicData(p => ({ ...p, nameOrCnpj: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                    />
                  </div>
                </div>

                {/* E-mail Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-gray-700">E-mail para Notificações</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      placeholder="Ex: joao@email.com"
                      value={basicData.email}
                      onChange={(e) => setBasicData(p => ({ ...p, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs font-bold text-gray-700">Telefone Celular (WhatsApp)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      placeholder="Ex: (99) 98122-3456"
                      value={basicData.phone}
                      onChange={(e) => setBasicData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                    />
                  </div>
                </div>

                {/* Current Location Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="currentLocation" className="text-xs font-bold text-gray-700">Localização/Cidade de Cadastro</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        id="currentLocation"
                        placeholder="Cidade de base"
                        value={basicData.currentLocation}
                        onChange={(e) => setBasicData(p => ({ ...p, currentLocation: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      className="px-3.5 bg-vapt-light hover:bg-vapt hover:text-white text-vapt font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 border border-vapt/20 disabled:opacity-50 cursor-pointer"
                      id="form-detect-gps"
                    >
                      <Compass className={`w-4 h-4 ${detectingLocation ? 'animate-spin' : ''}`} />
                      <span>{detectingLocation ? 'Buscando...' : 'GPS'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 (CLIENT): Preferences Checklist */}
            {role === 'client' && (
              <div className="space-y-4" id="form-section-client-pref">
                <h3 className="text-sm font-bold text-vapt-dark border-b border-gray-100 pb-2 uppercase tracking-wide">
                  2. Suas Preferências de Carga
                </h3>
                <p className="text-xs text-gray-500">
                  Selecione as categorias de carga que você costuma enviar com mais frequência:
                </p>

                <div className="grid grid-cols-2 gap-3" id="client-preferences-list">
                  {clientPrefsOptions.map((opt) => {
                    const active = selectedPreferences.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => togglePreference(opt.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold transition-all text-left cursor-pointer ${
                          active 
                            ? 'border-vapt bg-vapt-light text-vapt shadow-sm' 
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-slate-50'
                        }`}
                        id={`pref-chip-${opt.id}`}
                      >
                        <span className="text-lg">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 2 (DRIVER): Documentation & Cargo info */}
            {role === 'driver' && (
              <div className="space-y-6" id="form-section-driver-doc">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-vapt-dark border-b border-gray-100 pb-2 uppercase tracking-wide">
                    2. Documentação Regulamentada
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* CNH EAR Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="cnhEar" className="text-xs font-bold text-gray-700">Nº CNH (com EAR)</label>
                      <div className="relative">
                        <Award className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          id="cnhEar"
                          placeholder="Ex: 123456789-00"
                          value={driverDoc.cnhEar}
                          onChange={(e) => setDriverDoc(p => ({ ...p, cnhEar: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* CRLV Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="crlv" className="text-xs font-bold text-gray-700">CRLV do Veículo</label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          id="crlv"
                          placeholder="Ex: 9876543210-9"
                          value={driverDoc.crlv}
                          onChange={(e) => setDriverDoc(p => ({ ...p, crlv: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* RNTRC Input (Optional) */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="rntrc" className="text-xs font-bold text-gray-700">RNTRC <span className="text-gray-400 font-normal">(Opcional)</span></label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          id="rntrc"
                          placeholder="Ex: ANTT-123456"
                          value={driverDoc.rntrc}
                          onChange={(e) => setDriverDoc(p => ({ ...p, rntrc: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Section 3: Vehicle capabilities */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-vapt-dark border-b border-gray-100 pb-2 uppercase tracking-wide">
                    3. Detalhes de Transporte do Veículo
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Vehicle Type selector */}
                    <div className="flex flex-col gap-1.5 md:col-span-1">
                      <label className="text-xs font-bold text-gray-700">Tipo de Veículo</label>
                      <select
                        value={vehicleType}
                        onChange={(e) => handleVehicleChange(e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm focus:outline-none transition-all"
                      >
                        <option value="Carro de Passeio">Carro de Passeio</option>
                        <option value="Fiat Strada">Fiat Strada (Picape)</option>
                        <option value="Caminhão 3/4">Caminhão 3/4</option>
                        <option value="Truck">Caminhão Truck</option>
                        <option value="Bitrem">Bitrem (Carreta)</option>
                      </select>
                    </div>

                    {/* Vehicle Capacity input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="capacity" className="text-xs font-bold text-gray-700">Capacidade de Carga (kg)</label>
                      <input
                        type="number"
                        id="capacity"
                        value={vehicleCapacity}
                        onChange={(e) => setVehicleCapacity(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                      />
                    </div>

                    {/* Vehicle Volume capacity input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="volume" className="text-xs font-bold text-gray-700">Volume Máximo (m³)</label>
                      <input
                        type="number"
                        id="volume"
                        value={vehicleVolume}
                        onChange={(e) => setVehicleVolume(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Driver Section 4: Operational Cities */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-vapt-dark border-b border-gray-100 pb-2 uppercase tracking-wide">
                    4. Atuação: Cidades que costuma percorrer
                  </h3>
                  <p className="text-xs text-gray-500">
                    Selecione as cidades do Sul do Maranhão onde opera ou passa com frequência (selecione pelo menos uma):
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-gray-200">
                    {cnearOptions.map((opt) => {
                      const active = selectedCities.includes(opt.id);
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => toggleCity(opt.id)}
                          className={`py-3.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                            active 
                              ? 'bg-vapt text-white shadow-sm' 
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                          id={`city-chip-${opt.id}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-vapt hover:bg-vapt-dark text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer mt-8"
              style={{ backgroundColor: '#093B84' }}
              id="registration-submit-btn"
            >
              <span>Concluir Cadastro</span>
              <CheckCircle className="w-5 h-5" />
            </button>
          </form>

          {onGoToLogin && (
            <div className="text-center mt-6 text-xs text-gray-500 border-t border-gray-100 pt-5" id="register-switch-action">
              <span>Já possui uma conta ativa? </span>
              <button
                type="button"
                onClick={onGoToLogin}
                className="font-bold text-[#093B84] hover:underline cursor-pointer"
                id="btn-register-switch-to-login"
              >
                Acessar Login de Entrada
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
