
import React from 'react';

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  icon?: React.ReactNode;
  darkMode?: boolean;
  onChange: (val: number) => void;
}

const ControlSlider: React.FC<ControlSliderProps> = ({ label, value, min, max, unit = "", icon, darkMode, onChange }) => {
  return (
    <div className="flex flex-col space-y-2 mb-4">
      <div className={`flex justify-between items-center text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className={`${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'} px-2 py-0.5 rounded-full text-xs`}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
    </div>
  );
};

export default ControlSlider;
