import React from 'react';

export interface TransformationState {
  blur: number;
  brightness: number;
  noise: number;
  rotation: number;
  crop: number;
}

export interface ConfusingRegion {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage 0-100
  height: number; // Percentage 0-100
  reason: string;
}

export interface AIAnalysis {
  label: string;
  confidence: number;
  reasoning: string;
  isCorrect: boolean;
  confusingRegions?: ConfusingRegion[];
}

export interface PresetImage {
  id: string;
  url: string;
  label: string;
}

export interface EdgeCaseExample extends PresetImage {
  description: string;
}

export type Difficulty = 'Manual' | 'Easy' | 'Medium' | 'Hard';

export interface DifficultyPreset {
  label: Difficulty;
  config: TransformationState;
  description: string;
}

export interface FieldScenario {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  config: TransformationState;
}
