import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
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
  const [imageError, setImageError] = useState(false);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  
  // Ref to store the loaded image for immediate access in getBlob without re-rendering
  const imageRef = useRef<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => ({
    getBlob: () => {
      // Use the cached, fully loaded image
      const img = imageRef.current;
      const canvas = canvasRef.current;
      
      // Safety checks: image must be loaded and complete
      if (!img || !img.complete || img.naturalWidth === 0 || !canvas) return '';
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return '';

      // Draw the image with transformations but WITHOUT the confusing regions overlay
      // This ensures the AI sees the "clean" distorted image
      drawToContext(tCtx, tempCanvas.width, tempCanvas.height, img, transformations, []);
      
      return tempCanvas.toDataURL('image/jpeg', 0.8);
    }
  }));

  const drawToContext = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    img: HTMLImageElement, 
    trans: TransformationState,
    regions?: ConfusingRegion[]
  ) => {
    ctx.clearRect(0, 0, width, height);
    
    // Safety check to prevent "InvalidStateError"
    if (!img.complete || img.naturalWidth === 0) return;

    ctx.save();

    // 1. Apply Coordinate Transformations (Rotate, Scale/Crop)
    ctx.translate(width / 2, height / 2);
    ctx.rotate((trans.rotation * Math.PI) / 180);
    
    const scaleFactor = 1 + trans.crop / 50;
    ctx.scale(scaleFactor, scaleFactor);
    
    ctx.translate(-width / 2, -height / 2);

    // 2. Draw Image with CSS Filters (Blur, Brightness)
    ctx.filter = `blur(${trans.blur}px) brightness(${trans.brightness}%)`;
    ctx.drawImage(img, 0, 0, width, height);

    // 3. Apply Noise (Pixel manipulation)
    if (trans.noise > 0) {
      // Note: getImageData gets pixels from the canvas backing store.
      // It captures the result of drawImage including the filter.
      // It ignores the current transformation matrix (scale/rotate), 
      // which is what we want (noise applies to the final viewport pixels).
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Simple random noise
        const noiseValue = (Math.random() - 0.5) * trans.noise * 2.55;
        data[i] = Math.max(0, Math.min(255, data[i] + noiseValue));     // R
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noiseValue)); // G
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noiseValue)); // B
      }
      ctx.putImageData(imageData, 0, 0);
    }

    ctx.restore();

    // 4. Draw Confusing Regions Overlay (if provided)
    if (regions && regions.length > 0) {
      regions.forEach((region, index) => {
        const rx = (region.x / 100) * width;
        const ry = (region.y / 100) * height;
        const rw = (region.width / 100) * width;
        const rh = (region.height / 100) * height;

        ctx.save();
        ctx.strokeStyle = '#ef4444'; 
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        ctx.strokeRect(rx, ry, rw, rh);
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(rx, ry, rw, rh);

        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px Fredoka';
        ctx.fillText(`Area ${index + 1}`, rx, ry > 20 ? ry - 8 : ry + rh + 15);
        ctx.restore();
      });
    }
  };

  // Effect 1: Handle Image Loading
  useEffect(() => {
    let active = true;
    setImageError(false);
    setLoadedImage(null);
    imageRef.current = null;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      if (active) {
        setLoadedImage(img);
        imageRef.current = img;
      }
    };

    img.onerror = () => {
      if (active) {
        setImageError(true);
      }
    };

    return () => { active = false; };
  }, [imageUrl]);

  // Effect 2: Handle Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set fixed canvas size
    canvas.width = 500;
    canvas.height = 500;

    if (imageError) {
      // Draw Error State
      ctx.fillStyle = darkMode ? '#1e293b' : '#f1f5f9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = darkMode ? '#94a3b8' : '#64748b';
      ctx.font = '16px Fredoka';
      ctx.textAlign = 'center';
      ctx.fillText('Image failed to load', canvas.width / 2, canvas.height / 2);
    } else if (loadedImage) {
      // Draw Success State
      drawToContext(ctx, canvas.width, canvas.height, loadedImage, transformations, confusingRegions);
    } else {
      // Draw Loading State (Optional: clear canvas)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [loadedImage, imageError, transformations, confusingRegions, darkMode]);

  return (
    <div className={`canvas-container rounded-2xl overflow-hidden border-4 transition-all duration-300 ${darkMode ? 'border-slate-800' : 'border-white'}`}>
      <canvas ref={canvasRef} className="max-w-full h-auto block" />
    </div>
  );
});

export default VisualCanvas;