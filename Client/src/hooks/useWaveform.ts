import { useEffect, useRef } from 'react';

export function useWaveform(analyser: AnalyserNode | null, isRecording: boolean) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    if (!analyser || !isRecording) {
      // Draw idle static wave
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.beginPath();
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.25)';
      ctx.lineWidth = 2;
      ctx.moveTo(0, rect.height / 2);
      ctx.lineTo(rect.width, rect.height / 2);
      ctx.stroke();
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, rect.width, rect.height);

      const isDark = document.documentElement.classList.contains('dark');
      const barCount = 48;
      const barWidth = (rect.width / barCount) * 0.65;
      const gap = (rect.width / barCount) * 0.35;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] || 0;
        const percent = value / 255;
        const minHeight = 4;
        const height = Math.max(minHeight, percent * (rect.height - 8));
        const x = i * (barWidth + gap);
        const y = (rect.height - height) / 2;

        // Gradient color for bars
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        if (isDark) {
          gradient.addColorStop(0, '#818cf8');
          gradient.addColorStop(0.5, '#c084fc');
          gradient.addColorStop(1, '#6366f1');
        } else {
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(0.5, '#8b5cf6');
          gradient.addColorStop(1, '#4f46e5');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded bar
        ctx.roundRect(x, y, barWidth, height, [barWidth / 2]);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isRecording]);

  return canvasRef;
}
