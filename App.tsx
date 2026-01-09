
import React, { useState, useRef, useEffect } from 'react';
import { 
  Images, 
  RefreshCw, 
  Zap, 
  AlertCircle, 
  BrainCircuit, 
  RotateCw, 
  Maximize, 
  Sun, 
  Moon,
  CloudFog, 
  Activity,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Trophy,
  Dices,
  EyeOff,
  BookOpen,
  Car,
  Lightbulb,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PRESET_IMAGES, INITIAL_TRANSFORMATIONS, DIFFICULTY_PRESETS } from './constants';
import { TransformationState, AIAnalysis, PresetImage, Difficulty } from './types';
import VisualCanvas, { VisualCanvasHandle } from './components/VisualCanvas';
import ControlSlider from './components/ControlSlider';
import { analyzeImage } from './services/geminiService';

const App: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<PresetImage>(PRESET_IMAGES[0]);
  const [transformations, setTransformations] = useState<TransformationState>(INITIAL_TRANSFORMATIONS);
  const [difficulty, setDifficulty] = useState<Difficulty>('Manual');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('edge-case-theme');
    return saved === 'dark';
  });
  
  const canvasRef = useRef<VisualCanvasHandle>(null);

  useEffect(() => {
    localStorage.setItem('edge-case-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleTransformChange = (key: keyof TransformationState, val: number) => {
    setTransformations(prev => ({ ...prev, [key]: val }));
    setDifficulty('Manual');
    if (analysis) setAnalysis(null);
  };

  const applyDifficulty = (level: Difficulty) => {
    if (level === 'Manual') {
      resetAll();
      return;
    }
    const preset = DIFFICULTY_PRESETS.find(p => p.label === level);
    if (preset) {
      setTransformations(preset.config);
      setDifficulty(level);
      if (analysis) setAnalysis(null);
    }
  };

  const resetAll = () => {
    setTransformations(INITIAL_TRANSFORMATIONS);
    setDifficulty('Manual');
    setAnalysis(null);
  };

  const runTest = async () => {
    if (!canvasRef.current) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    const dataUrl = canvasRef.current.getBlob();
    const result = await analyzeImage(dataUrl, selectedPreset.label);
    
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const messyLevel = (transformations.blur * 2) + 
                    (Math.abs(100 - transformations.brightness) / 2) + 
                    (transformations.noise) + 
                    (Math.abs(transformations.rotation) / 1.8) +
                    (transformations.crop);

  const getMessyGrade = () => {
    if (messyLevel < 30) return { label: 'Mild', color: 'text-green-500' };
    if (messyLevel < 80) return { label: 'Moderate', color: 'text-yellow-500' };
    if (messyLevel < 150) return { label: 'Extreme', color: 'text-orange-500' };
    return { label: 'Unrecognizable!', color: 'text-red-500 font-bold' };
  };

  const messyGrade = getMessyGrade();

  const themeClasses = {
    bg: isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900',
    card: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100',
    headerText: isDarkMode ? 'text-slate-100' : 'text-slate-800',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    mutedBg: isDarkMode ? 'bg-slate-800' : 'bg-slate-100',
    inputBg: isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 md:p-8 transition-colors duration-300 ${themeClasses.bg}`}>
      {/* Header */}
      <header className="w-full max-w-5xl mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div>
            <h1 className={`text-4xl font-bold flex items-center gap-2 ${themeClasses.headerText}`}>
              <BrainCircuit className="text-indigo-600 w-10 h-10" />
              Edge-Case Lab
            </h1>
            <p className={`${themeClasses.subText} font-medium`}>Explore the limits of Computer Vision and AI robustness.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button 
              onClick={() => setShowPicker(!showPicker)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Images size={20} />
              {showPicker ? 'Close Picker' : 'Change Subject'}
            </button>
            <button 
              onClick={resetAll}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
              title="Reset transformations"
            >
              <RefreshCw size={24} />
            </button>
          </div>
        </div>

        {/* Kid Friendly Explanation / How to Play */}
        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg border-b-4 border-indigo-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-yellow-300 fill-yellow-300" />
            <h2 className="text-xl font-bold">Your Mission: Can you trick the AI?</h2>
          </div>
          <p className="text-indigo-100 mb-4 font-medium leading-relaxed">
            AI is usually super smart, but it can get confused by "Edge Cases"—things like bad lighting, messy static, or being tilted sideways! 
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
              <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
              <span><strong>Pick an object</strong> from our laboratory library!</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
              <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
              <span><strong>Move the sliders</strong> to make the picture look messy.</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
              <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
              <span><strong>Click "Challenge the AI"</strong> to see if it's still correct!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Preset Picker section */}
      {showPicker && (
        <div className={`w-full max-w-5xl p-6 rounded-3xl shadow-xl mb-8 border-4 animate-in fade-in slide-in-from-top-4 duration-300 ${themeClasses.card} ${isDarkMode ? 'border-slate-800' : 'border-indigo-50'}`}>
          <h2 className={`text-xl font-bold mb-4 ${themeClasses.headerText}`}>Choose a subject to test:</h2>
          <div className="flex flex-wrap gap-4">
            {PRESET_IMAGES.map((img) => (
              <button
                key={img.id}
                onClick={() => {
                  setSelectedPreset(img);
                  setShowPicker(false);
                  setAnalysis(null);
                }}
                className={`relative group rounded-2xl overflow-hidden border-4 transition-all ${
                  selectedPreset.id === img.id ? 'border-indigo-500 scale-105 shadow-lg' : 'border-transparent hover:border-indigo-200'
                }`}
              >
                <img src={img.url} alt={img.label} className="w-24 h-24 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <span className="text-white text-xs font-bold px-1 text-center">{img.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        
        {/* Left Panel: Sliders & Difficulties */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          <div className={`p-6 rounded-3xl shadow-lg border transition-colors ${themeClasses.card}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.headerText}`}>
              <Trophy className="text-indigo-500" size={20} />
              Challenge Modes
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {['Easy', 'Medium', 'Hard'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => applyDifficulty(lvl as Difficulty)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 text-left flex items-center justify-between ${
                    difficulty === lvl 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                    : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-600'} hover:border-indigo-200 hover:bg-indigo-500 hover:text-white`
                  }`}
                >
                  {lvl}
                  {difficulty === lvl && <Zap size={14} className="fill-current" />}
                </button>
              ))}
              <button
                onClick={() => applyDifficulty('Manual')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 text-left flex items-center justify-between mt-1 ${
                  difficulty === 'Manual' 
                  ? `${isDarkMode ? 'bg-slate-100 text-slate-900 border-slate-100' : 'bg-slate-700 text-white border-slate-700'}` 
                  : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-600'} hover:border-slate-400`
                }`}
              >
                Custom Manual
                <Dices size={14} />
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-3xl shadow-lg border transition-colors ${themeClasses.card}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.headerText}`}>
              <Zap className="text-yellow-500" />
              Break Logic
            </h3>
            
            <ControlSlider 
              label="Blurry Lens" 
              value={transformations.blur} 
              min={0} max={15} 
              unit="px"
              darkMode={isDarkMode}
              icon={<CloudFog size={18} className="text-blue-400" />}
              onChange={(v) => handleTransformChange('blur', v)} 
            />
            
            <ControlSlider 
              label="Brightness" 
              value={transformations.brightness} 
              min={0} max={200} 
              unit="%"
              darkMode={isDarkMode}
              icon={<Sun size={18} className="text-amber-500" />}
              onChange={(v) => handleTransformChange('brightness', v)} 
            />

            <ControlSlider 
              label="Static Noise" 
              value={transformations.noise} 
              min={0} max={100} 
              unit="%"
              darkMode={isDarkMode}
              icon={<Activity size={18} className="text-purple-400" />}
              onChange={(v) => handleTransformChange('noise', v)} 
            />

            <ControlSlider 
              label="Tilted Angle" 
              value={transformations.rotation} 
              min={-180} max={180} 
              unit="°"
              darkMode={isDarkMode}
              icon={<RotateCw size={18} className="text-emerald-500" />}
              onChange={(v) => handleTransformChange('rotation', v)} 
            />

            <ControlSlider 
              label="Zoom / Crop" 
              value={transformations.crop} 
              min={0} max={100} 
              unit="%"
              darkMode={isDarkMode}
              icon={<Maximize size={18} className="text-orange-400" />}
              onChange={(v) => handleTransformChange('crop', v)} 
            />

            <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Messy Factor</span>
                <span className={`text-sm font-bold ${messyGrade.color}`}>{messyGrade.label}</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (messyLevel / 200) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Preview */}
        <div className="lg:col-span-5 flex flex-col items-center gap-6 order-1 lg:order-2">
          <VisualCanvas 
            ref={canvasRef}
            imageUrl={selectedPreset.url} 
            transformations={transformations}
            confusingRegions={analysis?.confusingRegions}
            darkMode={isDarkMode}
          />
          
          <button
            onClick={runTest}
            disabled={isAnalyzing}
            className={`w-full py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${
              isAnalyzing 
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
            }`}
          >
            {isAnalyzing ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <Zap className="fill-current" />
            )}
            {isAnalyzing ? 'AI is thinking...' : 'Challenge the AI!'}
          </button>

          <p className={`${themeClasses.subText} text-sm italic text-center`}>
            Prediction: Do you think the AI will still see the <span className={`font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>"{selectedPreset.label}"</span>?
          </p>

          {/* Confusion Hotspot Legend */}
          {analysis?.confusingRegions && analysis.confusingRegions.length > 0 && (
            <div className={`w-full p-4 rounded-2xl border animate-in fade-in slide-in-from-bottom-2 ${isDarkMode ? 'bg-red-950/30 border-red-900/50' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-2">
                <EyeOff size={16} />
                Confusion Hotspots Detected:
              </div>
              <div className="space-y-2">
                {analysis.confusingRegions.map((region, idx) => (
                  <div key={idx} className={`flex gap-3 text-xs font-medium items-start ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] shrink-0 mt-0.5">Area {idx + 1}</span>
                    <p>{region.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: AI Results */}
        <div className="lg:col-span-4 space-y-6 order-3">
          <div className={`h-full min-h-[400px] rounded-3xl p-8 flex flex-col transition-all duration-500 border-4 ${
            !analysis 
            ? `${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'} border-dashed` 
            : analysis.isCorrect 
              ? `${isDarkMode ? 'bg-emerald-950/20 border-emerald-900' : 'bg-green-50 border-green-200'} shadow-lg` 
              : `${isDarkMode ? 'bg-red-950/20 border-red-900' : 'bg-red-50 border-red-200'} shadow-lg`
          }`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <BrainCircuit className={analysis?.isCorrect ? 'text-green-500' : 'text-slate-400'} />
              AI's Decision
            </h3>

            {!analysis && !isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <ChevronRight className="text-slate-400" size={32} />
                </div>
                <p className={`${themeClasses.subText} font-medium`}>Wait for input...<br/>Press the button to start the test!</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="relative">
                   <BrainCircuit className="text-indigo-600 animate-bounce" size={64} />
                   <RefreshCw className="absolute -top-2 -right-2 text-indigo-400 animate-spin" size={24} />
                 </div>
                 <p className="text-indigo-600 font-bold text-lg">Scanning Pixels...</p>
                 <p className={`${themeClasses.subText} text-sm`}>Testing robustness to {messyGrade.label.toLowerCase()} distortion.</p>
              </div>
            )}

            {analysis && (
              <div className="flex-1 flex flex-col space-y-6 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <span className={`text-xs uppercase font-bold tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>AI Thinks it sees</span>
                    <h2 className={`text-3xl font-black break-words ${themeClasses.headerText}`}>{analysis.label}</h2>
                  </div>
                  <div className={`p-3 rounded-2xl shadow-md ${analysis.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {analysis.isCorrect ? <ThumbsUp size={32} /> : <ThumbsDown size={32} />}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Confidence</span>
                    <span className={analysis.confidence > 70 ? 'text-green-600' : 'text-orange-500'}>{analysis.confidence}%</span>
                  </div>
                  <div className={`w-full h-4 rounded-full overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-full transition-all duration-1000 ${analysis.confidence > 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${analysis.confidence}%` }}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/60 border-white'}`}>
                  <h4 className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Lesson from the Machine</h4>
                  <p className={`leading-relaxed font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>"{analysis.reasoning}"</p>
                </div>

                <div className="pt-4 flex items-center gap-3 text-sm font-medium">
                  <AlertCircle size={18} className="text-amber-500 shrink-0" />
                  <p className={themeClasses.subText}>
                    {analysis.isCorrect 
                      ? "The AI was smart enough to see through the mess!" 
                      : "You broke it! This is called 'Drift' or 'Out-of-Distribution' failure."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Expanded Explanation Section */}
      <section className="w-full max-w-5xl mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${themeClasses.card} p-6 rounded-3xl shadow-md border flex flex-col items-center text-center`}>
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className={`text-lg font-bold mb-2 ${themeClasses.headerText}`}>The Goal: Generalization</h3>
          <p className={`text-sm ${themeClasses.subText}`}>
            True AI isn't just a "pixel matcher." It should recognize a cat whether it's upside down, blurry, or in a snowstorm. This ability is called <strong>Generalization</strong>.
          </p>
        </div>

        <div className={`${themeClasses.card} p-6 rounded-3xl shadow-md border flex flex-col items-center text-center`}>
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <Lightbulb size={24} />
          </div>
          <h3 className={`text-lg font-bold mb-2 ${themeClasses.headerText}`}>The Trap: Pixel Logic</h3>
          <p className={`text-sm ${themeClasses.subText}`}>
            Computers don't "see" objects; they see a grid of numbers. When you add noise or tilt, those numbers change wildly. AI must be <strong>Robust</strong> enough to ignore the mess.
          </p>
        </div>

        <div className={`${themeClasses.card} p-6 rounded-3xl shadow-md border flex flex-col items-center text-center`}>
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className={`text-lg font-bold mb-2 ${themeClasses.headerText}`}>Why it Matters: Safety</h3>
          <p className={`text-sm ${themeClasses.subText}`}>
            If a self-driving car misses a stop sign because of a shadow, it's a disaster. We build these tests to ensure AI works in the <strong>messy real world</strong>, not just in clean labs.
          </p>
        </div>
      </section>

      {/* Footer / Lesson */}
      <footer className={`w-full max-w-5xl p-8 rounded-[40px] shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-900'} text-white`}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Car className="text-indigo-400" />
              Real World Engineering
            </h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              In industry, we call this <strong>Stress Testing</strong>. Engineers intentionally "poison" their datasets or apply massive distortions to find where the AI is weak. By finding these "edge cases," we can train better models that are safe for everyone to use.
            </p>
            <div className="flex gap-4">
              <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-indigo-400 font-bold block mb-1">Data Drift</span>
                <span className="text-slate-400 text-xs">When real-world data stops looking like the training data.</span>
              </div>
              <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-amber-400 font-bold block mb-1">Out-of-Dist</span>
                <span className="text-slate-400 text-xs">A "wild" image the AI was never prepared to handle.</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="text-indigo-400" />
              Pro Lab Notebook
            </h3>
            <ul className="space-y-4 text-slate-300 text-sm">
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 bg-indigo-500 rounded flex-shrink-0 flex items-center justify-center text-[10px] mt-1">1</div>
                <p><strong>The Tipping Point:</strong> Every model has a "breaking point" where noise overrides object features.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 bg-indigo-500 rounded flex-shrink-0 flex items-center justify-center text-[10px] mt-1">2</div>
                <p><strong>Contextual Clues:</strong> Sometimes AI "cheats" by looking at the background instead of the object!</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 bg-indigo-500 rounded flex-shrink-0 flex items-center justify-center text-[10px] mt-1">3</div>
                <p><strong>Feedback Loops:</strong> Using the "Confusion Areas" shown on the canvas helps engineers retrain models on specific weaknesses.</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-slate-500 text-xs font-medium uppercase tracking-widest">
          Edge-Case Challenge &copy; 2025 AI Safety Education
        </div>
      </footer>
    </div>
  );
};

export default App;
