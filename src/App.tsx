/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EntrySplash } from './components/EntrySplash';
import { DigitalInvitationCard } from './components/DigitalInvitationCard';
import { AudioPlayerButton } from './components/AudioPlayerButton';
import { ConfirmedGuestsModal } from './components/ConfirmedGuestsModal';
import { ConfirmedPage } from './components/ConfirmedPage';
import { AdminPanel } from './components/AdminPanel';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { getConfirmedGuests, DEFAULT_CONFIG } from './services/api';
import { RsvpRecord, DietarySummary, AppConfig } from './types';

export default function App() {
  // Route detector: supports path (/admin), hash (#/admin), and query params (?admin, ?page=admin)
  const detectRoute = (): 'invitation' | 'confirmados' | 'admin' => {
    if (typeof window === 'undefined') return 'invitation';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    if (path.includes('admin') || hash.includes('admin') || search.includes('admin')) {
      return 'admin';
    }
    if (path.includes('confirmados') || hash.includes('confirmados') || search.includes('confirmados')) {
      return 'confirmados';
    }
    return 'invitation';
  };

  const [currentRoute, setCurrentRoute] = useState<'invitation' | 'confirmados' | 'admin'>(detectRoute);

  // Splash screen state: starts visible until user clicks "INGRESAR"
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [isConfirmedModalOpen, setIsConfirmedModalOpen] = useState<boolean>(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Data state
  const [records, setRecords] = useState<RsvpRecord[]>([]);
  const [summary, setSummary] = useState<DietarySummary>({
    tradicional: 0,
    celiaco: 0,
    vegetariano: 0,
    vegano: 0,
    diabetico: 0,
    hipertenso: 0,
    lactosa: 0,
    otraAlergia: 0,
    total: 0,
  });
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  // Music track (customizable via /admin)
  const audioUrl = config.musicaUrl || DEFAULT_CONFIG.musicaUrl || '';

  const loadData = useCallback(async () => {
    try {
      const data = await getConfirmedGuests();
      setRecords(data.records);
      setSummary(data.summary);
      if (data.config) {
        setConfig((prev) => ({ ...prev, ...data.config }));
      }
    } catch (e) {
      console.warn('Error loading data:', e);
    }
  }, []);

  useEffect(() => {
    document.title = 'MIS XV SOFIA';
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Sync route on popstate and hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(detectRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (route: 'invitation' | 'confirmados' | 'admin') => {
    setCurrentRoute(route);
    const targetUrl = route === 'admin' ? '/admin' : route === 'confirmados' ? '/confirmados' : '/';
    try {
      window.history.pushState({}, '', targetUrl);
    } catch {
      window.location.hash =
        route === 'admin' ? '#/admin' : route === 'confirmados' ? '#/confirmados' : '#/';
    }
  };

  // Handle entry: unlocks invitation and starts music
  const handleEnter = () => {
    setHasEntered(true);
    setIsPlaying(true);
  };

  const toggleAudio = () => {
    setIsPlaying((prev) => !prev);
  };

  // SCREEN: /admin Dashboard
  if (currentRoute === 'admin') {
    return (
      <AdminPanel
        config={config}
        onConfigSaved={(updatedConfig) => {
          setConfig(updatedConfig);
        }}
        onBackToInvitation={() => navigateTo('invitation')}
        onGoToConfirmados={() => navigateTo('confirmados')}
      />
    );
  }

  // SCREEN: /confirmados Dashboard
  if (currentRoute === 'confirmados') {
    return (
      <ConfirmedPage
        records={records}
        summary={summary}
        config={config}
        onRefresh={loadData}
        onBackToInvitation={() => navigateTo('invitation')}
        onGoToAdmin={() => navigateTo('admin')}
      />
    );
  }

  // SCREEN: Main Digital Invitation
  return (
    <div className="min-h-screen bg-[#f4eff3] flex flex-col items-center justify-start text-[#2b2b2b] select-none p-0 md:px-4 md:py-6">
      {/* Background audio/YouTube player */}
      <BackgroundMusicPlayer
        url={config.musicaUrl || audioUrl}
        isPlaying={isPlaying && hasEntered}
        onPlayStateChange={setIsPlaying}
      />

      {/* Screen 1: Splash Screen with INGRESAR button (BOTONINGRESAR.png) */}
      {!hasEntered && <EntrySplash onEnter={handleEnter} config={config} />}

      {/* Screen 2: Digital Invitation Card (Images 1, 3, 4, 5, 6, 7) */}
      <DigitalInvitationCard
        records={records}
        summary={summary}
        config={config}
        onOpenConfirmedModal={() => navigateTo('confirmados')}
        onNavigate={navigateTo}
        onRefreshData={loadData}
      />

      {/* Floating Circular Audio Button (Images 1, 3, 4, 7) */}
      {hasEntered && (
        <AudioPlayerButton isPlaying={isPlaying} onToggle={toggleAudio} />
      )}

      {/* Modal: Real-time Google Sheets & Excel Confirmed Guests with Catering Diet Breakdown */}
      {isConfirmedModalOpen && (
        <ConfirmedGuestsModal
          isOpen={isConfirmedModalOpen}
          onClose={() => setIsConfirmedModalOpen(false)}
          records={records}
          summary={summary}
          config={config}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
