
import { PresetImage, TransformationState, DifficultyPreset } from './types';

export const PRESET_IMAGES: PresetImage[] = [
  { id: 'cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=500&fit=crop', label: 'Cat' },
  { id: 'banana', url: 'https://images.unsplash.com/photo-1571771894821-ad990241274d?w=500&h=500&fit=crop', label: 'Banana' },
  { id: 'bicycle', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&h=500&fit=crop', label: 'Bicycle' },
  { id: 'teapot', url: 'https://images.unsplash.com/photo-1576091160550-2173bdd99625?w=500&h=500&fit=crop', label: 'Teapot' },
  { id: 'plant', url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop', label: 'Potted Plant' },
];

export const INITIAL_TRANSFORMATIONS: TransformationState = {
  blur: 0,
  brightness: 100,
  noise: 0,
  rotation: 0,
  crop: 0,
};

export const DIFFICULTY_PRESETS: DifficultyPreset[] = [
  { 
    label: 'Easy', 
    config: { blur: 2, brightness: 115, noise: 5, rotation: 5, crop: 10 },
    description: 'Just a tiny smudge on the lens.'
  },
  { 
    label: 'Medium', 
    config: { blur: 6, brightness: 140, noise: 30, rotation: 35, crop: 25 },
    description: 'A shaky, noisy photo in bright light.'
  },
  { 
    label: 'Hard', 
    config: { blur: 12, brightness: 180, noise: 70, rotation: 160, crop: 55 },
    description: 'Total chaos! Almost unrecognizable.'
  }
];
