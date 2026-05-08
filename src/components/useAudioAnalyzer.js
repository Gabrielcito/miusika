import { useState, useEffect, useRef, useCallback } from "react";

export const useAudioAnalyzer = (audioFile) => {
    const [analyserNode, setAnalyserNode] = useState(null);
    const [bufferLength, setBufferLength] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);
    const contextRef = useRef(null);

    useEffect(() => {
        if (!audioFile) {
            setAnalyserNode(null);
            setBufferLength(0);
            setIsPlaying(false);
            setDuration(0);
            setCurrentTime(0);
            return;
        }

        const context = new AudioContext();
        contextRef.current = context;

        const audio = new Audio(audioFile);
        audio.volume = 0.5;
        audio.crossOrigin = "anonymous";
        audioRef.current = audio;

        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        setBufferLength(analyser.frequencyBinCount);
        setAnalyserNode(analyser);

        const source = context.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(context.destination);

        const onMeta = () => setDuration(audio.duration);
        const onTime = () => setCurrentTime(audio.currentTime);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnd = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', onMeta);
        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnd);

        audio.play().catch(() => {});

        return () => {
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnd);
            audio.pause();
            audio.src = '';
            context.close();
            audioRef.current = null;
            contextRef.current = null;
        };
    }, [audioFile]);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        const ctx = contextRef.current;
        if (!audio) return;
        if (ctx?.state === 'suspended') ctx.resume();
        if (audio.paused) audio.play().catch(() => {});
        else audio.pause();
    }, []);

    const setVolume = useCallback((vol) => {
        if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, vol));
    }, []);

    const seek = useCallback((time) => {
        if (audioRef.current) audioRef.current.currentTime = time;
    }, []);

    return { analyserNode, bufferLength, isPlaying, duration, currentTime, togglePlay, setVolume, seek };
};
