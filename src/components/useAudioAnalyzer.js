import { useState, useEffect } from "react";

export const useAudioAnalyzer = (audioFile) => {
    const [analyserNode, setAnalyserNode] = useState(null);
    const [bufferLength, setBufferLength] = useState(0);

    useEffect(() => {
        const context = new AudioContext();

        const audioElement = new Audio(audioFile);
        audioElement.volume = 0.3;
        audioElement.crossOrigin = "anonymous";

        const analyser = context.createAnalyser();
        analyser.fftSize = 2048; // Mayor fftSize, mayor resolución
        const length = analyser.frequencyBinCount;
        setBufferLength(length);
        setAnalyserNode(analyser);

        const source = context.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(context.destination);

        audioElement.play();

        // Limpieza cuando el componente se desmonte
        return () => {
            context.close();
        };
    }, [audioFile]);

    return { analyserNode, bufferLength };
};
