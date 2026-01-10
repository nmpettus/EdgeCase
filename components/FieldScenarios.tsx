import React from 'react';
import { FieldScenario } from '../types';

interface FieldScenariosProps {
  scenarios: FieldScenario[];
  activeScenario: string | null;
  onSelect: (scenario: FieldScenario) => void;
  isDarkMode: boolean;
}

const FieldScenarios: React.FC<FieldScenariosProps> = ({ scenarios, activeScenario, onSelect, isDarkMode }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {scenarios.map(scenario => (
        <button
          key={scenario.id}
          onClick={() => onSelect(scenario)}
          className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 ${
            activeScenario === scenario.id
              ? 'bg-indigo-600 border-indigo-500 shadow-lg'
              : `${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-100 hover:border-indigo-300'}`
          }`}
        >
          <div className={`flex items-center gap-2 mb-1 ${activeScenario === scenario.id ? 'text-white' : ''}`}>
            {scenario.icon}
            <span className={`text-xs font-bold ${activeScenario === scenario.id ? 'text-white' : (isDarkMode ? 'text-slate-200' : 'text-slate-800')}`}>{scenario.label}</span>
          </div>
          <p className={`text-[10px] leading-tight ${activeScenario === scenario.id ? 'text-indigo-100' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
            {scenario.description}
          </p>
        </button>
      ))}
    </div>
  );
};

export default FieldScenarios;
