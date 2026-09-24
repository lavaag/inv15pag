/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { extractYouTubeId } from '../utils/youtube';

interface BackgroundMusicPlayerProps {
  url?: string;
  isPlaying: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  volume?: number;
}

export const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({
  url,
  isPlaying,
  onPlayStateChange,
  volume = 80,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isIframeLoadedRef = useRef<boolean>(false);

  const youtubeId = extractYouTubeId(url);
  const isYouTube = Boolean(youtubeId);

  // Send command to the YouTube iframe via postMessage
  const sendYtCommand = useCallback((func: string, args: any[] = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch (e) {
      console.warn('YouTube postMessage error:', e);
    }
  }, []);

  // When switching between YouTube and standard audio, ensure any previous audio is completely stopped
  useEffect(() => {
    if (isYouTube) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      if (iframeRef.current) {
        sendYtCommand('pauseVideo');
      }
    }
  }, [isYouTube, sendYtCommand]);

  // Handle play/pause commands
  useEffect(() => {
    if (isYouTube) {
      if (isPlaying) {
        sendYtCommand('playVideo');
      } else {
        sendYtCommand('pauseVideo');
      }
    } else {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio
          .play()
          .catch((e) => console.log('Audio playback prevented or waiting for interaction:', e));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, isYouTube, sendYtCommand]);

  // Handle volume updates
  useEffect(() => {
    if (isYouTube) {
      sendYtCommand('setVolume', [volume]);
    } else if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, isYouTube, sendYtCommand]);

  // When YouTube iframe finishes loading, initialize communication and play if requested
  const handleIframeLoad = () => {
    isIframeLoadedRef.current = true;
    sendYtCommand('listening');
    sendYtCommand('setVolume', [volume]);
    if (isPlaying) {
      // Small timeout ensures YouTube player script inside the iframe is ready for postMessage commands
      setTimeout(() => {
        sendYtCommand('playVideo');
      }, 150);
    }
  };

  // Listen to postMessage events from YouTube iframe to stay in sync
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data !== 'string') return;
        const data = JSON.parse(e.data);
        if (data.event === 'onStateChange') {
          // 1: PLAYING, 2: PAUSED, 0: ENDED
          if (data.info === 1 && onPlayStateChange) {
            onPlayStateChange(true);
          } else if (data.info === 0 && isPlaying) {
            // Replay when ended
            sendYtCommand('playVideo');
          }
        }
      } catch {
        // Not a JSON message or not from YouTube, safe to ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isYouTube, isPlaying, onPlayStateChange, sendYtCommand]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (iframeRef.current) {
        sendYtCommand('pauseVideo');
      }
    };
  }, [sendYtCommand]);

  return (
    <>
      {isYouTube ? (
        <div
          className="fixed -left-[9999px] -top-[9999px] w-1 h-1 overflow-hidden pointer-events-none opacity-0 select-none"
          aria-hidden="true"
        >
          {/* Strictly ONE iframe instance.
              Note: autoplay is NOT placed dynamically in src to avoid iframe reloading when isPlaying changes.
              Playback is controlled strictly via postMessage commands. */}
          <iframe
            ref={iframeRef}
            key={youtubeId}
            onLoad={handleIframeLoad}
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&version=3&controls=0&disablekb=1&loop=1&playlist=${youtubeId}&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3`}
            title="Música de fondo"
            allow="autoplay; encrypted-media"
            className="w-1 h-1 pointer-events-none"
            tabIndex={-1}
          />
        </div>
      ) : (
        <audio
          ref={audioRef}
          src={url || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-cinematic-piano-112191.mp3'}
          loop
          preload="auto"
        />
      )}
    </>
  );
};
