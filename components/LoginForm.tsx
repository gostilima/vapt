'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, Lock, Mail, CheckCircle, Smartphone, 
  MapPin, User, ShieldCheck, Eye, EyeOff 
} from 'lucide-react';
import Logo from './Logo';

interface LoginFormProps {
  onLoginComplete: (data: any) => void;
  onBack: () => void;
  onGoToRegister: () => void;
}

export default function LoginForm({ onLoginComplete, onBack, onGoToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'driver'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field Validation
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail válido.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMsg('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    setIsLoading(true);

    // Simulate login delay
    setTimeout(() => {
      // Derive a friendly user name from the email
      const emailPrefix = email.split('@')[0];
      const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

      // Construct a fully valid mock user profile corresponding to the selected role
      // to ensure both dashboards render correctly without crashes
      const payload = {
        role,
        name: displayName,
        email: email.toLowerCase().trim(),
        phone: '(99) 98124-9021',
        currentLocation: 'Balsas - MA',
        preferences: role === 'client' ? ['pereciveis', 'moveis'] : null,
        driverDocs: role === 'driver' ? {
          cnhEar: 'EAR-7183-MA',
          crlv: 'CRLV-5912401',
          rntrc: 'RNTRC-8812930'
        } : null,
        vehicleDetails: role === 'driver' ? {
          type: 'Caminhão 3/4',
          capacityKg: 4500,
          volumeM3: 18
        } : null,
        operatingCities: role === 'driver' ? ['Balsas', 'Carolina', 'Riachão'] : null,
        createdAt: new Date().toISOString(),
        balance: role === 'driver' ? 0 : 500, // Starts client with 500 fake balance for tests
      };

      setIsLoading(false);
      onLoginComplete(payload);
    }, 600);
  };

  const handleFillDemo = (type: 'client' | 'driver') => {
    setRole(type);
    setEmail(type === 'client' ? 'lucas.cliente@vapt.com' : 'lucas.motorista@vapt.com');
    setPassword('senha123');
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-slate-50 relative overflow-hidden" id="login-form-wrapper">
      {/* Visual background ambient gradients */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-vapt-light opacity-60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-100 opacity-60 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10 py-2 border-b border-gray-100 mb-8" id="login-header">
        <Logo showText size={38} />
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-vapt font-semibold transition-colors duration-200 cursor-pointer"
          id="login-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full z-10 py-2" id="login-form-container">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-8" id="login-card">
          <div className="mb-6">
            <span className="text-xs font-bold tracking-widest text-vapt bg-vapt-light px-3 py-1 rounded-full uppercase" id="login-badge">
              Login Livre
            </span>
            <h2 className="text-2xl font-display font-bold text-vapt-dark mt-3" id="login-title">
              Bem-vindo ao Vapt Logística
            </h2>
            <p className="text-xs text-gray-500 mt-1" id="login-subtitle">
              Entre instantaneamente usando <strong>qualquer e-mail e senha</strong> de sua escolha!
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-xl border border-red-100 flex items-center gap-2" id="login-error-panel">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" id="login-main-form">
            {/* Segmented control for choosing Role */}
            <div className="space-y-2" id="login-role-selection">
              <label className="text-xs font-bold text-gray-700 block">Tipo de Perfil</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    role === 'client' 
                      ? 'bg-vapt text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200/50'
                  }`}
                  style={role === 'client' ? { backgroundColor: '#093B84' } : {}}
                  id="tab-login-client"
                >
                  📦 Entrar como Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setRole('driver')}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    role === 'driver' 
                      ? 'bg-vapt text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200/50'
                  }`}
                  style={role === 'driver' ? { backgroundColor: '#093B84' } : {}}
                  id="tab-login-driver"
                >
                  🚚 Entrar como Transportador
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5" id="login-email-group">
              <label htmlFor="login-email" className="text-xs font-bold text-gray-700">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="login-email"
                  placeholder="Ex: seu-nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5" id="login-password-group">
              <label htmlFor="login-password" className="text-xs font-bold text-gray-700">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="Mínimo 4 caracteres (qualquer uma)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 focus:border-vapt focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-vapt cursor-pointer"
                  id="toggle-visible-pass"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75"
              style={{ backgroundColor: '#093B84' }}
              id="login-submit-btn"
            >
              <span>{isLoading ? 'Autenticando...' : 'Acessar Conta'}</span>
              <CheckCircle className="w-5 h-5" />
            </button>
          </form>

          {/* Quick options to use filled accounts for faster demonstration */}
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3" id="login-demobuttons">
            <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase">Preenchimento Rápido (Demonstração):</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('client')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-vapt-dark transition-all cursor-pointer"
                id="btn-demo-fill-client"
              >
                Preencher Cliente 📦
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('driver')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-vapt-dark transition-all cursor-pointer"
                id="btn-demo-fill-driver"
              >
                Preencher Motorista 🚚
              </button>
            </div>
          </div>

          {/* Link to go to register */}
          <div className="text-center mt-6 text-xs text-gray-500" id="login-switch-action">
            <span>Ainda não tem cadastro? </span>
            <button
              onClick={onGoToRegister}
              className="font-bold text-vapt hover:underline outline-none cursor-pointer"
              style={{ color: '#093B84' }}
              id="btn-switch-to-register"
            >
              Criar nova conta
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs font-mono text-gray-400 z-10 border-t border-gray-100 flex justify-between items-center max-w-lg mx-auto w-full mt-auto" id="login-footer">
        <span>© 2026 Vapt Logística S.A.</span>
        <span>Acesso Livre de Testes</span>
      </div>
    </div>
  );
}
