/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";
import { useAudioAnalyzer } from "./useAudioAnalyzer";


export const TestCanvas = ({ audioFile, compression }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const { analyserNode, bufferLength } = useAudioAnalyzer(audioFile);

    useEffect(() => {
        // Dibujo y animación en el canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false });
        let tiempo = 0;

        // Control de fps
        const fps = 30;
        const frameInterval = 1000 / fps;
        let lastFrameTime = 0;

        const tick = (timestamp) => {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;

            if (!lastFrameTime) lastFrameTime = timestamp;

            const elapsed = timestamp - lastFrameTime;
            if (elapsed > frameInterval) {

                
            }
            tiempo = tiempo + 0.05;
            requestAnimationFrame(tick);
        };

        tick();

    }, [analyserNode, bufferLength, compression]);

    return (
        <div id='canvasContainer' ref={containerRef}>
            <canvas id='myCanvas' ref={canvasRef}></canvas>
        </div>
    );
};