'use client';

import React, { useState, useEffect } from 'react';
import Onboarding from '../components/Onboarding';
import ProfileSelection from '../components/ProfileSelection';
import RegisterForm from '../components/RegisterForm';
import ClientDashboard from '../components/ClientDashboard';
import DriverDashboard from '../components/DriverDashboard';
import LoginForm from '../components/LoginForm';
import { RefreshCw, ToggleLeft, ToggleRight, Info, Award } from 'lucide-react';

export default function Home() {
  const [stage, setStage] = useState<'onboarding' | 'profile_selection' | 'login' | 'register' | 'dashboard'>('onboarding');
  const [role, setRole] = useState<'client' | 'driver'>('client');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showSimController, setShowSimController] = useState(true);

  // Safely restore session state on client mount only to prevent SSR/Hydration mismatch
  useEffect(() => {
    // Wrap state updates in setTimeout to run asynchronously after the mounting render loop is completed
    const timer = setTimeout(() => {
      try {
        const savedSession = localStorage.getItem('vapt_user_session');
        const hasCompletedOnboarding = localStorage.getItem('vapt_onboarding_done');

        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          setUserProfile(parsed);
          setRole(parsed.role || 'client');
          setStage('dashboard');
        } else if (hasCompletedOnboarding === 'true') {
          setStage('profile_selection');
        }
      } catch (e) {
        console.error('Error recovering session on mount:', e);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);


  const handleOnboardingComplete = () => {
    localStorage.setItem('vapt_onboarding_done', 'true');
    setStage('profile_selection');
  };

  const handleProfileSelect = (selectedRole: 'client' | 'driver') => {
    setRole(selectedRole);
    setStage('register');
  };

  const handleRegistrationComplete = (profileData: any) => {
    setUserProfile(profileData);
    localStorage.setItem('vapt_user_session', JSON.stringify(profileData));
    setStage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('vapt_user_session');
    setUserProfile(null);
    setStage('profile_selection');
  };

  const handleResetSimulator = () => {
    localStorage.removeItem('vapt_user_session');
    localStorage.removeItem('vapt_onboarding_done');
    
    // Clear client orders as well
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('vapt_requests_') || key.startsWith('vapt_balance_'))) {
        localStorage.removeItem(key);
      }
    }

    setUserProfile(null);
    setStage('onboarding');
  };

  const handleSwitchSimulatorRole = () => {
    const nextRole = role === 'client' ? 'driver' : 'client';
    setRole(nextRole);
    
    // Create a mock active session for the opposite role if none exists,
    // so the tester is not blocked by another registration form!
    const mockProfile = {
      role: nextRole,
      name: nextRole === 'client' ? 'Simulador Cliente' : 'Simulador Motorista',
      email: nextRole === 'client' ? 'lucas.cliente@vapt.com' : 'lucas.motorista@vapt.com',
      phone: '(48) 99933-2211',
      currentLocation: 'Balsas - MA',
      preferences: nextRole === 'client' ? ['pereciveis', 'moveis'] : null,
      driverDocs: nextRole === 'driver' ? { cnhEar: 'EAR-9283-DF', crlv: 'CRLV-9283921', rntrc: 'RNTRC-1203921' } : null,
      vehicleDetails: nextRole === 'driver' ? { type: 'Caminhão 3/4', capacityKg: 4500, volumeM3: 18 } : null,
      operatingCities: nextRole === 'driver' ? ['Balsas', 'Carolina', 'Riachão'] : null,
      createdAt: new Date().toISOString()
    };
    
    setUserProfile(mockProfile);
    localStorage.setItem('vapt_user_session', JSON.stringify(mockProfile));
    setStage('dashboard');
  };

  // Render correct view according to state
  return (
    <div className="relative min-h-screen" id="vapt-web-flow-container">
      {/* Simulation Master Controller bar (displayed exclusively for AI Studio interactive tests) */}
      {showSimController && (
        <div className="bg-[#05234F] text-white px-5 py-2.5 text-xs flex flex-wrap gap-4 items-center justify-between border-b border-white/10 z-50 relative font-mono shadow-inner select-none" id="simulator-floating-controller">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-bold text-[10px] tracking-wider uppercase text-blue-200">Painel de Teste Vapt</span>
          </div>

          <div className="flex items-center gap-3" id="sim-control-actions">
            <span className="text-[10px] text-gray-300 hidden md:inline">
              Estágio atual: <strong className="text-white uppercase">{stage}</strong>
            </span>

            {stage === 'dashboard' && (
              <button
                onClick={handleSwitchSimulatorRole}
                className="flex items-center gap-1.5 py-1 px-2 rounded bg-indigo-600 hover:bg-indigo-500 font-bold tracking-tight text-[10px] transition-all cursor-pointer"
                id="btn-switch-flow-sim"
              >
                <span>Alternar Perfil para:</span>
                <strong className="text-white uppercase underline">{role === 'client' ? 'Motorista 🚚' : 'Cliente 📦'}</strong>
              </button>
            )}

            <button
              onClick={handleResetSimulator}
              className="flex items-center gap-1 py-1 px-2 rounded bg-white/10 hover:bg-white/20 hover:text-red-300 text-[10px] font-bold transition-all cursor-pointer"
              id="btn-simulator-reset"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Zerar do Zero</span>
            </button>

            <button
              onClick={() => setShowSimController(false)}
              className="text-gray-400 hover:text-white font-bold ml-1 text-[11px]"
              title="Ocultar Painel"
              id="btn-hide-simulator"
            >
              [X]
            </button>
          </div>
        </div>
      )}

      {/* Primary Flow routing */}
      <div id="vapt-active-viewport" className="min-h-screen">
        {stage === 'onboarding' && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {stage === 'profile_selection' && (
          <ProfileSelection 
            onSelect={handleProfileSelect} 
            onBack={() => setStage('onboarding')} 
            onGoToLogin={() => setStage('login')}
          />
        )}

        {stage === 'register' && (
          <RegisterForm 
            role={role} 
            onRegisterComplete={handleRegistrationComplete}
            onBack={() => setStage('profile_selection')} 
            onGoToLogin={() => setStage('login')}
          />
        )}

        {stage === 'login' && (
          <LoginForm
            onLoginComplete={(profileData) => {
              setUserProfile(profileData);
              setRole(profileData.role || 'client');
              localStorage.setItem('vapt_user_session', JSON.stringify(profileData));
              setStage('dashboard');
            }}
            onBack={() => setStage('profile_selection')}
            onGoToRegister={() => setStage('profile_selection')}
          />
        )}

        {stage === 'dashboard' && userProfile && (
          role === 'client' ? (
            <ClientDashboard userProfile={userProfile} onLogout={handleLogout} />
          ) : (
            <DriverDashboard userProfile={userProfile} onLogout={handleLogout} />
          )
        )}
      </div>
    </div>
  );
}
