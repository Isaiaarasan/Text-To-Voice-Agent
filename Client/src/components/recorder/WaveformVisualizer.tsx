import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null;
  isRecording: boolean;
  durationSeconds: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  analyserNode,
  isRecording,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bufferLength = 64;
    let dataArray = new Uint8Array(bufferLength);

    if (analyserNode) {
      analyserNode.fftSize = 128;
      bufferLength = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    let phase = 0;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isRecording && analyserNode) {
        analyserNode.getByteFrequencyData(dataArray);

        const barCount = 32;
        const barWidth = Math.max(3, (width - barCount * 3) / barCount);
        let x = 4;

        for (let i = 0; i < barCount; i++) {
          const index = Math.floor((i / barCount) * (bufferLength / 2));
          const val = dataArray[index] || 0;
          const barHeight = Math.max(4, (val / 255) * (height - 12));

          const gradient = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
          gradient.addColorStop(0, '#ec4899');
          gradient.addColorStop(0.5, '#6366f1');
          gradient.addColorStop(1, '#8b5cf6');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, height / 2 - barHeight / 2, barWidth, barHeight, 3);
          ctx.fill();

          x += barWidth + 3;
        }
      } else {
        // Idle ambient gentle wave
        phase += 0.05;
        const barCount = 32;
        const barWidth = Math.max(3, (width - barCount * 3) / barCount);
        let x = 4;

        for (let i = 0; i < barCount; i++) {
          const sinHeight = Math.sin(phase + i * 0.25) * 6 + 10;
          
          ctx.fillStyle = isRecording ? '#ef4444' : 'rgba(99, 102, 241, 0.25)';
          ctx.beginPath();
          ctx.roundRect(x, height / 2 - sinHeight / 2, barWidth, sinHeight, 2);
          ctx.fill();

          x += barWidth + 3;
        }
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isRecording]);

  return (
    <div className="w-full h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center overflow-hidden p-2 backdrop-blur-md">
      <canvas
        ref={canvasRef}
        width={380}
        height={56}
        className="w-full h-full"
      />
    </div>
  );
};
