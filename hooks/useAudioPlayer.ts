import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';

// --- Base64 and Audio Decoding Helpers ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length; // Mono audio
  const buffer = ctx.createBuffer(1, frameCount, 24000); // 1 channel, 24kHz sample rate for TTS
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

export const useAudioPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        // Initialize AudioContext on mount and clean up
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
        }
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const stop = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const play = useCallback(async (text: string) => {
        stop(); // Stop any currently playing audio
        if (!text.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const audioContext = audioContextRef.current;
            if (!audioContext) {
                throw new Error("Audio context is not available.");
            }
            // Ensure context is running
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const base64Audio = await generateSpeech(text);
            const decodedAudio = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedAudio, audioContext);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            
            source.onended = () => {
                setIsPlaying(false);
                sourceRef.current = null;
            };

            source.start();
            sourceRef.current = source;
            setIsPlaying(true);

        } catch (err) {
            console.error("Audio playback error:", err);
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(message);
            setIsPlaying(false);
        } finally {
            setIsLoading(false);
        }
    }, [stop]);

    return { isPlaying, isLoading, error, play, stop };
};
