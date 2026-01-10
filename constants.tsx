
import { PresetImage, TransformationState, DifficultyPreset } from './types';

export const PRESET_IMAGES: PresetImage[] = [
  { id: 'cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=500&fit=crop', label: 'Cat' },
  { id: 'banana', url: 'https://images.unsplash.com/photo-1571771894821-ad990241274d?w=500&h=500&fit=crop', label: 'Banana' },
  { id: 'bicycle', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&h=500&fit=crop', label: 'Bicycle' },
  { id: 'teapot', url: 'https://images.unsplash.com/photo-1576091160550-2173bdd99625?w=500&h=500&fit=crop', label: 'Teapot' },
  { id: 'plant', url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop', label: 'Potted Plant' },
];

export const EDGE_CASE_EXAMPLES = [
  { id: 'shadows', label: 'Harsh Shadows', url: 'https://images.unsplash.com/photo-1516222338250-863216ce019b?w=300&h=300&fit=crop', description: 'Dark patches hide shape' },
  { id: 'blur', label: 'Motion Blur', url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=300&h=300&fit=crop', description: 'Fast movement smudges edges' },
  { id: 'angle', label: 'Bird\'s Eye', url: 'https://images.unsplash.com/photo-1471180625745-944903837c22?w=300&h=300&fit=crop', description: 'Top-down perspective change' },
  { id: 'noise', label: 'Digital Grain', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&h=300&fit=crop', description: 'Low light sensor static' },
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
