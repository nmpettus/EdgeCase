import React from 'react';
import { PresetImage, TransformationState, DifficultyPreset, EdgeCaseExample, FieldScenario } from './types';
import { Aperture, CloudRain, Video, Eye, ZoomIn } from 'lucide-react';

export const PRESET_IMAGES: PresetImage[] = [
  { 
    id: 'maggie', 
    // Updated to the user's image of Maggie
    url: 'https://i.postimg.cc/KvbCL1p1/Maggie-New-NBP-copy.png', 
    label: 'Maggie (Yorkie Poo)' 
  },
  { 
    id: 'cat', 
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=800&fit=crop&q=80', 
    label: 'Playful Cat' 
  },
  { 
    id: 'banana', 
    url: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800&h=800&fit=crop&q=80', 
    label: 'Yellow Banana' 
  },
  { 
    id: 'bicycle', 
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&h=800&fit=crop&q=80', 
    label: 'Red Bicycle' 
  },
  { 
    id: 'teapot', 
    url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=800&fit=crop&q=80', 
    label: 'Teapot' 
  },
  { 
    id: 'plant', 
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop&q=80', 
    label: 'Potted Plant' 
  },
  { 
    id: 'turtle', 
    url: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=800&h=800&fit=crop&q=80', 
    label: 'Sea Turtle' 
  },
  { 
    id: 'robot', 
    url: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop&q=80', 
    label: 'Toy Robot' 
  },
];

export const EDGE_CASE_EXAMPLES: EdgeCaseExample[] = [
  { id: 'shadows', label: 'Harsh Shadows', url: 'https://images.pexels.com/photos/777059/pexels-photo-777059.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop&dpr=1', description: 'Dark patches hide shape' },
  { id: 'blur', label: 'Motion Blur', url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=800&fit=crop&q=80', description: 'Fast movement smudges edges' },
  { id: 'angle', label: 'Bird\'s Eye', url: 'https://images.unsplash.com/photo-1471180625745-944903837c22?w=800&h=800&fit=crop&q=80', description: 'Top-down perspective change' },
  { id: 'noise', label: 'Digital Grain', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&h=800&fit=crop&q=80', description: 'Low light sensor static' },
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

export const FIELD_SCENARIOS: FieldScenario[] = [
  {
    id: 'rainy_night',
    label: 'Rainy Night Drive',
    description: 'Low light and rain adds noise.',
    icon: <CloudRain size={20} className="text-blue-400" />,
    config: { blur: 2, brightness: 70, noise: 60, rotation: 0, crop: 0 }
  },
  {
    id: 'shaky_cam',
    label: 'Shaky Camera',
    description: 'The camera moved, blurring the shot.',
    icon: <Video size={20} className="text-red-400" />,
    config: { blur: 8, brightness: 100, noise: 10, rotation: 3, crop: 0 }
  },
  {
    id: 'frosted_glass',
    label: 'Frosted Glass',
    description: 'Looking through an unclear surface.',
    icon: <Eye size={20} className="text-cyan-400" />,
    config: { blur: 14, brightness: 110, noise: 25, rotation: 0, crop: 0 }
  },
  {
    id: 'far_away',
    label: 'Far Away Object',
    description: 'Zooming in degrades quality.',
    icon: <ZoomIn size={20} className="text-purple-400" />,
    config: { blur: 1, brightness: 100, noise: 15, rotation: 0, crop: 75 }
  },
];
