
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TransformationState, ConfusingRegion } from '../types';

interface VisualCanvasProps {
  imageUrl: string;
  transformations: TransformationState;
  confusingRegions?: ConfusingRegion[];
  darkMode?: boolean;
}

export interface VisualCanvasHandle {
  getBlob: () => string;
}

const VisualCanvas = forwardRef<VisualCanvasHandle, VisualCanvasProps>(({ imageUrl, transformations, confusingRegions, darkMode }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    getBlob: () => {
      // Create a temp canvas to get clean pixels without the AI overlays
      const canvas = canvasRef.current;
      if (!canvas) return '';
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return '';

      // Re-draw only image + filters
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      
      drawCanvas(tCtx, tempCanvas.width, tempCanvas.height, img, transformations, []);
      
      return tempCanvas.toDataURL('image/jpeg', 0.8);
    }
  }));

  const drawCanvas = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    img: HTMLImageElement, 
    trans: TransformationState,
    regions?: ConfusingRegion[]
  ) => {
    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Apply Transformations
    ctx.translate(width / 2, height / 2);
    ctx.rotate((trans.rotation * Math.PI) / 180);
    
    const scaleFactor = 1 + trans.crop / 50;
    ctx.scale(scaleFactor, scaleFactor);
    
    ctx.translate(-width / 2, -height / 2);

    // Draw Image
    ctx.filter = `blur(${trans.blur}px) brightness(${trans.brightness}%)`;
    ctx.drawImage(img, 0, 0, width, height);

    // Apply Noise manually
    if (trans.noise > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noiseValue = (Math.random() - 0.5) * trans.noise * 2.55;
        data[i] = Math.max(0, Math.min(255, data[i] + noiseValue));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noiseValue));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noiseValue));
      }
      ctx.putImageData(imageData, 0, 0);
    }

    ctx.restore();

    // Draw Confusing Regions Overlay
    if (regions && regions.length > 0) {
      regions.forEach((region, index) => {
        const rx = (region.x / 100) * width;
        const ry = (region.y / 100) * height;
        const rw = (region.width / 100) * width;
        const rh = (region.height / 100) * height;

        // Glowing Red Box
        ctx.save();
        ctx.strokeStyle = '#ef4444'; 
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        ctx.strokeRect(rx, ry, rw, rh);
        
        // Fill semi-transparent
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(rx, ry, rw, rh);

        // Label for the region
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px Fredoka';
        ctx.fillText(`Area ${index + 1}: ${region.reason.substring(0, 20)}...`, rx, ry > 20 ? ry - 8 : ry + rh + 15);
        ctx.restore();
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = 500;
      canvas.height = 500;
      drawCanvas(ctx, canvas.width, canvas.height, img, transformations, confusingRegions);
    };
  }, [imageUrl, transformations, confusingRegions]);

  return (
    <div className={`canvas-container rounded-2xl overflow-hidden border-4 transition-all duration-300 ${darkMode ? 'border-slate-800' : 'border-white'}`}>
      <canvas ref={canvasRef} className="max-w-full h-auto block" />
    </div>
  );
});

export default VisualCanvas;
