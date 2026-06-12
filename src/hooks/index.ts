'use client';

import { useEffect, useCallback, useRef } from 'react';

interface UseTapDetectionOptions {
  taps: number;
  timeWindow: number;
  onTrigger: () => void;
}

export function useTapDetection({ taps, timeWindow, onTrigger }: UseTapDetectionOptions) {
  const tapTimestamps = useRef<number[]>([]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    tapTimestamps.current = tapTimestamps.current.filter((t) => now - t < timeWindow);
    tapTimestamps.current.push(now);

    if (tapTimestamps.current.length >= taps) {
      tapTimestamps.current = [];
      onTrigger();
    }
  }, [taps, timeWindow, onTrigger]);

  return handleTap;
}

export function useMediaRecorder() {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async (onDataAvailable: (blob: Blob) => void) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    mediaRecorder.current = recorder;
    chunks.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      onDataAvailable(blob);
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();
    return recorder;
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
  }, []);

  return { startRecording, stopRecording, mediaRecorder };
}

export function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
