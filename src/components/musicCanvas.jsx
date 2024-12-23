/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";
import { useAudioAnalyzer } from "./useAudioAnalyzer";


export const MusicCanvas = ({ audioFile, compression }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const { analyserNode, bufferLength } = useAudioAnalyzer(audioFile);

    useEffect(() => {
        // Dibujo y animación en el canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false });
        let tiempo = 0;

        // Control de fps
        const fps = 24;
        const frameInterval = 1000 / fps;
        let lastFrameTime = 0;

        const tick = (timestamp) => {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;

            if (!lastFrameTime) lastFrameTime = timestamp;

            const elapsed = timestamp - lastFrameTime;
            if (elapsed > frameInterval) {
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (analyserNode) {
                    const dataArray = new Uint8Array(bufferLength);
                    analyserNode.getByteFrequencyData(dataArray);

                    const rectWidth = 10;
                    const spacing = 16;
            
                    const numRectangles = Math.floor(canvas.width / (rectWidth + spacing));
                    const finalDataArray = new Uint8Array(numRectangles);

                    //Raw
                    if (compression === "raw") {
                        for (let i = 0; i < numRectangles; i++) {
                            finalDataArray[i] = dataArray[i];
                        }
                    }

                    //LOGARITMIC COMPRESSION
                    if (compression === 'log') {
                        
                        for (let i = 0; i < numRectangles; i++) {
                            const start = Math.floor(Math.pow(i / numRectangles, 1.5) * bufferLength); // Escala logarítmica
                            const end = Math.floor(Math.pow((i + 1) / numRectangles, 1.5) * bufferLength);
                    
                            let sum = 0;
                            let count = 0;
                    
                            for (let j = start; j < end; j++) {
                                if (dataArray[j] > 0) { // Ignorar valores 0
                                    sum += dataArray[j];
                                    count++;
                                }
                            }
                    
                            // Promediar valores válidos o usar mínimo predeterminado
                            finalDataArray[i] = sum / count;
                        }
                    }


                    //CHUNK COMPRESSION
                    if(compression === 'chunk'){
                        const binSize = Math.floor(dataArray.length / numRectangles); // Tamaño de cada bin

                        for (let i = 0; i < numRectangles; i++) {
                            let sum = 0;
                            for (let j = 0; j < binSize; j++) {
                                sum += dataArray[i * binSize + j];
                            }
                            finalDataArray[i] = sum / binSize; // Promedio del bin
                        }
                    
                        // Si hay datos sobrantes, agrégalos al último bin
                        const remainderStart = numRectangles * binSize;
                        if (remainderStart < dataArray.length) {
                            let sum = 0;
                            let count = 0;
                            for (let i = remainderStart; i < dataArray.length; i++) {
                                sum += dataArray[i];
                                count++;
                            }
                            finalDataArray[finalDataArray.length - 1] += sum / count;
                        }
                    }
                
                    for (let i = 0; i < numRectangles; i++) {
                        // Dibujar un cuadrado con datos del espectro de frecuencias
                        const xRectangulo = 10;
                        const xCentroOffSet = 25;
                        const xCentro = 47 + xCentroOffSet * i;
                        const yBase = canvas.height - 20;

                        // Calcular el color del arcoíris basado en la frecuencia y en numero de rectangulos
                        const colorFactor = 300 / (numRectangles - 1);
                        const hue = (i * colorFactor);
                        const color = `hsl(${hue}, 100%, 50%)`;

                        // Usar el valor de frecuencia para ajustar la altura de la barra
                        const barHeight = finalDataArray[i] * 2;

                        // Configuración de glow
                        ctx.shadowColor = color;
                        ctx.shadowBlur = 20;

                        ctx.fillStyle = color;
                        ctx.fillRect(
                            xCentro - xRectangulo / 2,
                            yBase - barHeight,
                            xRectangulo,
                            barHeight
                        );

                        const radioCirculo = 10;
                        ctx.beginPath();
                            ctx.arc(xCentro, yBase - barHeight - radioCirculo, radioCirculo, 0, Math.PI * 2);
                            ctx.fillStyle = color;
                            ctx.fill();
                        ctx.closePath();

                        // Resetear el glow
                        ctx.shadowColor = "transparent";
                        ctx.shadowBlur = 0;
                    }
                }
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