import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

import { buildSynthesizeUrl, SpeechSynthesisUnavailableError } from '@/lib/speech-synthesis';
import { supabase } from '@/lib/supabase';

export type UseRoleplayTtsResult = {
  /** Index into the chat's messages array of the bubble currently playing/loading, or null if none. */
  playingIndex: number | null;
  isLoading: boolean;
  play: (index: number, text: string) => Promise<void>;
  stop: () => void;
};

/**
 * One shared player for the whole chat screen (not one per bubble) - only
 * one AI reply plays at a time, and re-creating a native player per bubble
 * would leak resources for a long conversation.
 */
export function useRoleplayTts(languageCode: string | null): UseRoleplayTtsResult {
  const player = useAudioPlayer(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Guards against a stale session lookup (from an earlier tap) resolving
  // after a newer one and clobbering the bubble the user actually wants
  // playing now.
  const requestIdRef = useRef(0);

  // Without this, iOS silences playback whenever the hardware mute switch
  // is on - use-cloud-dictation.ts sets this too, but only when the user
  // actually records something first; a session that goes straight to
  // tapping a reply's speaker icon never hits that path.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    player.pause();
    setPlayingIndex(null);
    setIsLoading(false);
  }, [player]);

  const play = useCallback(
    async (index: number, text: string) => {
      if (!languageCode) return;
      if (playingIndex === index) {
        stop();
        return;
      }

      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setPlayingIndex(index);
      try {
        const url = buildSynthesizeUrl(text, languageCode);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session || requestId !== requestIdRef.current) return;

        player.replace({ uri: url, headers: { Authorization: `Bearer ${session.access_token}` } });
        player.play();
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        // SpeechSynthesisUnavailableError (missing config) and any other
        // failure (network, auth) both just mean "couldn't play this one" -
        // there's no retry affordance on a per-bubble speaker icon, so both
        // collapse to the same "stop trying" state.
        if (!(error instanceof SpeechSynthesisUnavailableError)) console.warn('TTS playback failed', error);
        setPlayingIndex(null);
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    },
    [languageCode, playingIndex, stop, player]
  );

  // Subscribed via the player's own event, not useAudioPlayerStatus - the
  // latter would require an effect that calls setPlayingIndex synchronously
  // off a status *value* changing (flagged by the set-state-in-effect lint
  // rule), whereas this only calls it from inside an async event callback,
  // which is the legitimate "subscribe to an external system" case.
  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (updatedStatus) => {
      if (updatedStatus.didJustFinish) setPlayingIndex(null);
    });
    return () => subscription.remove();
  }, [player]);

  return { playingIndex, isLoading, play, stop };
}
