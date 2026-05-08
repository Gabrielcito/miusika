/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";

export const MusicCanvas = ({ analyserNode, bufferLength, compression, visual }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const rafRef = useRef(null);
    const tiempoRef = useRef(0);
    const mousePosRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d", { alpha: false });

        const resizeCanvas = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };
        resizeCanvas();

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(container);

        const tick = () => {
            tiempoRef.current += 0.016;
            const t = tiempoRef.current;

            ctx.fillStyle = '#0a0a14';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (analyserNode) {
                if (visual === 'bars') drawBars(ctx, canvas, analyserNode, bufferLength, compression, t);
                else if (visual === 'circumference') drawCircumference(ctx, canvas, analyserNode, t);
                else if (visual === 'wave') drawWave(ctx, canvas, analyserNode, bufferLength, t);
            }

            drawMouseGlow(ctx, mousePosRef.current, t);

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafRef.current);
            resizeObserver.disconnect();
        };
    }, [analyserNode, bufferLength, compression, visual]);

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => { mousePosRef.current = null; };

    return (
        <div id="canvasContainer" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <canvas id="myCanvas" ref={canvasRef} />
        </div>
    );
};

function drawBars(ctx, canvas, analyserNode, bufferLength, compression, t) {
    const rectW = 8;
    const gap = 5;
    const step = rectW + gap;
    const numBars = Math.floor((canvas.width - 40) / step);

    const raw = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(raw);
    const data = new Float32Array(numBars);

    if (compression === 'chunk') {
        const binSize = Math.max(1, Math.floor(bufferLength / numBars));
        for (let i = 0; i < numBars; i++) {
            let sum = 0;
            for (let j = 0; j < binSize; j++) sum += raw[i * binSize + j] ?? 0;
            data[i] = sum / binSize;
        }
    } else if (compression === 'log') {
        for (let i = 0; i < numBars; i++) {
            const start = Math.floor(Math.pow(i / numBars, 2) * bufferLength);
            const end = Math.floor(Math.pow((i + 1) / numBars, 2) * bufferLength);
            let sum = 0, count = 0;
            for (let j = start; j < end; j++) { sum += raw[j]; count++; }
            data[i] = count > 0 ? sum / count : 0;
        }
    } else {
        for (let i = 0; i < numBars; i++) data[i] = raw[i] ?? 0;
    }

    const yBase = canvas.height - 30;
    const maxH = canvas.height - 60;
    const colorShift = (t * 20) % 360;

    for (let i = 0; i < numBars; i++) {
        const x = 20 + i * step;
        const barH = Math.max(1, (data[i] / 255) * maxH);
        const hue = (i / numBars * 300 + colorShift) % 360;
        const color = `hsl(${hue}, 100%, 55%)`;

        const grad = ctx.createLinearGradient(x, yBase - barH, x, yBase);
        grad.addColorStop(0, `hsl(${hue}, 100%, 72%)`);
        grad.addColorStop(1, `hsl(${hue}, 100%, 28%)`);

        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = grad;
        ctx.fillRect(x, yBase - barH, rectW, barH);

        ctx.beginPath();
        ctx.arc(x + rectW / 2, yBase - barH - 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, 100%, 85%)`;
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}

function drawCircumference(ctx, canvas, analyserNode, t) {
    const numBars = 360;
    const data = new Uint8Array(numBars);
    analyserNode.getByteFrequencyData(data);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const minDim = Math.min(canvas.width, canvas.height);

    // Average of bass bins (first ~10% of spectrum) drives the pulse
    const bassSlice = Math.floor(numBars * 0.1);
    let bassSum = 0;
    for (let i = 0; i < bassSlice; i++) bassSum += data[i];
    const bassLevel = bassSum / bassSlice / 255;

    const baseR = minDim * 0.18 + bassLevel * minDim * 0.06 + Math.sin(t * 3) * minDim * 0.008;
    const maxBarLen = minDim * 0.24;
    const colorShift = (t * 5) % 360;

    for (let i = 0; i < numBars; i++) {
        const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;
        const barLen = 3 + (data[i] / 255) * maxBarLen;
        const hue = (i + colorShift) % 360;
        const color = `hsl(${hue}, 100%, 62%)`;

        ctx.beginPath();
        ctx.moveTo(cx + baseR * Math.cos(angle), cy + baseR * Math.sin(angle));
        ctx.lineTo(cx + (baseR + barLen) * Math.cos(angle), cy + (baseR + barLen) * Math.sin(angle));
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.stroke();
    }

    const ringHue = (t * 30) % 360;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = `hsl(${ringHue}, 80%, 65%)`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `hsl(${ringHue}, 80%, 65%)`;
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawWave(ctx, canvas, analyserNode, bufferLength, t) {
    const data = new Uint8Array(bufferLength);
    analyserNode.getByteTimeDomainData(data);

    const cy = canvas.height / 2;
    const shift = (t * 20) % 360;

    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, `hsl(${shift}, 100%, 62%)`);
    grad.addColorStop(0.33, `hsl(${(shift + 120) % 360}, 100%, 62%)`);
    grad.addColorStop(0.66, `hsl(${(shift + 240) % 360}, 100%, 62%)`);
    grad.addColorStop(1, `hsl(${shift}, 100%, 62%)`);

    ctx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
        const x = (i / bufferLength) * canvas.width;
        const y = cy + ((data[i] - 128) / 128) * (canvas.height * 0.38);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = `hsl(${shift}, 100%, 62%)`;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center line
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(canvas.width, cy);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.stroke();
}

function drawMouseGlow(ctx, mousePos, t) {
    if (!mousePos) return;

    const { x, y } = mousePos;
    const hue = (t * 40) % 360;
    const r = 80;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0,   `hsla(${hue}, 100%, 70%, 0.18)`);
    grad.addColorStop(0.4, `hsla(${hue}, 100%, 60%, 0.07)`);
    grad.addColorStop(1,   `hsla(${hue}, 100%, 50%, 0)`);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
}
