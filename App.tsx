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
  BookOpen,
  Car,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Home,
  HelpCircle,
  X,
  ChevronLeft,
  GalleryVerticalEnd,
  FlaskConical
} from 'lucide-react';
import { PRESET_IMAGES, EDGE_CASE_EXAMPLES, INITIAL_TRANSFORMATIONS, DIFFICULTY_PRESETS, FIELD_SCENARIOS } from './constants';
import { TransformationState, AIAnalysis, PresetImage, Difficulty, EdgeCaseExample, FieldScenario } from './types';
import VisualCanvas, { VisualCanvasHandle } from './components/VisualCanvas';
import ControlSlider from './components/ControlSlider';
import GalleryCarousel from './components/GalleryCarousel';
import FieldScenarios from './components/FieldScenarios';
import BottomNavBar from './components/BottomNavBar';
import { analyzeImage } from './services/geminiService';

const App: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<PresetImage>(PRESET_IMAGES[0]);
  const [galleryItems] = useState<EdgeCaseExample[]>(EDGE_CASE_EXAMPLES);
  
  const [transformations, setTransformations] = useState<TransformationState>(INITIAL_TRANSFORMATIONS);
  const [difficulty, setDifficulty] = useState<Difficulty>('Manual');
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('edge-case-theme');
    return saved === 'dark';
  });

  // UI State
  const [slidersVisible, setSlidersVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'lab' | 'controls' | 'learn'>('lab');

  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [highlightBox, setHighlightBox] = useState({ top: 0, left: 0, width: 0, height: 0, visible: false });
  const [currentTutorialStepContent, setCurrentTutorialStepContent] = useState<(typeof tutorialContent)[0] | null>(null);
  
  const canvasRef = useRef<VisualCanvasHandle>(null);

  useEffect(() => {
    localStorage.setItem('edge-case-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('has-seen-tutorial');
    if (!hasSeenTutorial) {
      setTutorialStep(0);
    }
  }, []);

  const tutorialContent = [
    {
      title: "Step 1: Choose a Subject",
      text: "Start with a clear photo. This is your 'Ground Truth'—the perfect, correct answer that we'll test the AI against.",
      icon: <Sparkles className="text-yellow-400" size={32} />,
      targetId: "subject-btn"
    },
    {
      title: "Step 2: The Distortion Zone",
      text: "Use these sliders to add real-world problems. Blurring hides the object's sharp edges, noise adds confusing static, and tilting changes its expected shape. Can the AI see past the mess?",
      icon: <Activity className="text-purple-400" size={32} />,
      targetId: "sliders-panel-toggle"
    },
    {
      title: "Step 3: Test the AI",
      text: "Send your creation to the AI! It has to guess the object based only on the messy pixels you give it, similar to how a robot sees the world.",
      icon: <Zap className="text-indigo-400 fill-indigo-400" size={32} />,
      targetId: "challenge-btn"
    },
    {
      title: "Step 4: Analyze Results",
      text: "Check the results! A high confidence score means the AI 'generalized' (it wasn't fooled). A low score means you found an 'edge case'—a tricky situation it wasn't trained for.",
      icon: <BrainCircuit className="text-green-400" size={32} />,
      targetId: "results-panel"
    }
  ];

  // Auto-scroll and spotlight effect for tutorial
  useEffect(() => {
    if (tutorialStep !== null) {
      const content = { ...tutorialContent[tutorialStep] };
      
      let targetElement: HTMLElement | null = null;

      if (tutorialStep === 1) {
        const toggleButton = document.getElementById('sliders-panel-toggle');
        if (toggleButton && toggleButton.offsetParent !== null) {
          setActiveTab('lab');
          content.text = "Tap this button to reveal the Distortion Sliders. They add real-world problems like blur and static to the image.";
          targetElement = toggleButton;
        } else {
          targetElement = document.getElementById('sliders-panel');
        }
      } else {
        targetElement = document.getElementById(content.targetId);
      }
      
      setCurrentTutorialStepContent(content);

      if (targetElement) {
        const yOffset = -100;
        const y = targetElement.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        
        const scrollTimeout = setTimeout(() => {
          const rect = targetElement.getBoundingClientRect();
          const padding = 12;
          setHighlightBox({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
            visible: true,
          });
        }, 500);
        return () => clearTimeout(scrollTimeout);
      }
    } else {
      setHighlightBox(prev => ({ ...prev, visible: false }));
      setCurrentTutorialStepContent(null);
    }
  }, [tutorialStep]);

  const handleTransformChange = (key: keyof TransformationState, val: number) => {
    setTransformations(prev => ({ ...prev, [key]: val }));
    setDifficulty('Manual');
    setActiveScenario(null);
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
      setActiveScenario(null);
      if (analysis) setAnalysis(null);
    }
  };
  
  const handleScenarioSelect = (scenario: FieldScenario) => {
    setTransformations(scenario.config);
    setActiveScenario(scenario.id);
    setDifficulty('Manual');
    if (analysis) setAnalysis(null);
  };

  const resetAll = () => {
    setTransformations(INITIAL_TRANSFORMATIONS);
    setDifficulty('Manual');
    setActiveScenario(null);
    setAnalysis(null);
  };

  const runTest = async () => {
    if (!canvasRef.current) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    const dataUrl = canvasRef.current.getBlob();
    if (!dataUrl) {
      console.error("Could not get image data from canvas.");
      setAnalysis({
        label: "Canvas Error",
        confidence: 0,
        reasoning: "Could not read the image from the canvas. Please try refreshing.",
        isCorrect: false,
      });
      setIsAnalyzing(false);
      return;
    }
    const result = await analyzeImage(dataUrl, selectedPreset.label);
    
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const dismissTutorial = () => {
    setTutorialStep(null);
    localStorage.setItem('has-seen-tutorial', 'true');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextTutorial = () => {
    if (tutorialStep !== null && tutorialStep < 3) {
      setTutorialStep(tutorialStep + 1);
    } else {
      dismissTutorial();
    }
  };

  const prevTutorial = () => {
    if (tutorialStep !== null && tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
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
    nav: isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200',
    card: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100',
    headerText: isDarkMode ? 'text-slate-100' : 'text-slate-800',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    mutedBg: isDarkMode ? 'bg-slate-800' : 'bg-slate-100',
    inputBg: isDarkMode ? 'bg-slate-700' : 'bg-slate-200',
    labCard: isDarkMode ? 'bg-indigo-950/30 border-indigo-900/50' : 'bg-indigo-50 border-indigo-100'
  };

  const renderMission = () => (
    <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg border-b-4 border-indigo-800 animate-in fade-in slide-in-from-top-2 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-yellow-300 fill-yellow-300" />
        <h2 className="text-xl font-bold">Your Mission: Can you trick the AI?</h2>
      </div>
      <p className="text-indigo-100 mb-4 font-medium leading-relaxed">
        AI can get confused by "Edge Cases"—things like bad lighting, messy static, or being tilted sideways! 
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
          <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
          <span><strong>Pick a subject</strong> (Like Maggie the Yorkie!)</span>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
          <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
          <span><strong>Mess up the image</strong> with the sliders on the left.</span>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
          <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
          <span><strong>Click "Challenge"</strong> and see if the AI fails!</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col items-center transition-colors duration-300 ${themeClasses.bg}`}>
      
      {tutorialStep !== null && (
        <>
          {/* Spotlight Overlay */}
          <div className={`fixed inset-0 z-[90] transition-opacity duration-300 ${highlightBox.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute bg-black/60 backdrop-blur-[2px]" style={{ transition: 'all 0.5s ease-in-out', top: 0, left: 0, width: '100%', height: highlightBox.top }} />
            <div className="absolute bg-black/60 backdrop-blur-[2px]" style={{ transition: 'all 0.5s ease-in-out', top: highlightBox.top, left: 0, height: highlightBox.height, width: highlightBox.left }} />
            <div className="absolute bg-black/60 backdrop-blur-[2px]" style={{ transition: 'all 0.5s ease-in-out', top: highlightBox.top, right: 0, height: highlightBox.height, left: highlightBox.left + highlightBox.width }} />
            <div className="absolute bg-black/60 backdrop-blur-[2px]" style={{ transition: 'all 0.5s ease-in-out', top: highlightBox.top + highlightBox.height, left: 0, width: '100%', bottom: 0 }} />
            <div className="absolute pointer-events-none rounded-2xl border-4 border-yellow-400"
                 style={{
                   transition: 'all 0.5s ease-in-out',
                   top: highlightBox.top,
                   left: highlightBox.left,
                   width: highlightBox.width,
                   height: highlightBox.height,
                   boxShadow: '0 0 40px 5px rgba(250, 204, 21, 0.6)'
                 }}
            />
          </div>

          {/* Fixed Tutorial Card */}
          {currentTutorialStepContent && (
            <div className={`fixed bottom-0 left-0 right-0 md:bottom-8 md:right-8 md:left-auto md:w-[450px] z-[100] p-4 animate-in slide-in-from-bottom-10 fade-in duration-500`}>
              <div className={`w-full p-6 md:p-8 rounded-[32px] shadow-2xl ${themeClasses.card} border-4 border-indigo-500 flex flex-col gap-4 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <button 
                  onClick={dismissTutorial}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
                  aria-label="Skip tutorial"
                >
                  <X size={20} />
                </button>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/50 shrink-0">
                    {currentTutorialStepContent.icon}
                  </div>
                  <div>
                    <h2 className={`text-xl font-black mb-2 ${themeClasses.headerText}`}>
                      {currentTutorialStepContent.title}
                    </h2>
                    <p className={`text-sm leading-relaxed ${themeClasses.subText}`}>
                      {currentTutorialStepContent.text}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full pt-2">
                  <button 
                    onClick={prevTutorial}
                    disabled={tutorialStep === 0}
                    className={`flex items-center gap-1 font-bold text-xs px-3 py-2 rounded-lg transition-colors ${tutorialStep === 0 ? 'opacity-0' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <div className="flex gap-1.5">
                    {tutorialContent.map((_, i) => (
                      <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === tutorialStep ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-300 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                  <button 
                    onClick={nextTutorial}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-transform active:scale-95"
                  >
                    {tutorialStep === 3 ? "Start Lab!" : "Next"} <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <nav className={`w-full sticky top-0 z-50 backdrop-blur-md border-b px-6 py-3 flex justify-between items-center transition-colors ${themeClasses.nav}`}>
        <div className="flex items-center gap-6">
          <a href="/" className={`flex items-center gap-2 font-bold text-sm hover:text-indigo-500 transition-colors ${themeClasses.headerText}`}>
            <Home size={18} />
            <span className="hidden sm:inline">Main Website</span>
          </a>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setTutorialStep(0)}
            className={`flex items-center gap-2 font-bold text-sm transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            <HelpCircle size={18} />
            Tutorial
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <div className="w-full max-w-7xl px-4 md:px-8 py-8 pb-28 lg:pb-8">
        <header className="w-full mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className={`text-4xl font-bold flex items-center gap-2 ${themeClasses.headerText}`}>
                <BrainCircuit className="text-indigo-600 w-10 h-10" />
                Edge-Case Lab
              </h1>
              <p className={`${themeClasses.subText} font-medium`}>Explore the limits of Computer Vision and AI robustness.</p>
            </div>
            <div className="flex gap-2">
              <button 
                id="subject-btn"
                onClick={() => setShowPicker(!showPicker)}
                className={`px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm relative z-[95]`}
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

          <div className="hidden lg:block">
            {renderMission()}
          </div>
        </header>

        {showPicker && (
          <div className={`w-full p-8 rounded-[32px] shadow-2xl mb-8 border-4 animate-in fade-in slide-in-from-top-4 duration-300 ${themeClasses.card} ${isDarkMode ? 'border-slate-800' : 'border-indigo-100'}`}>
            <div className="flex flex-col gap-6">
              <div>
                <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${themeClasses.subText}`}>Pick a Lab Preset:</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        setSelectedPreset(img);
                        setShowPicker(false);
                        setAnalysis(null);
                      }}
                      className={`relative group rounded-3xl overflow-hidden border-4 transition-all ${
                        selectedPreset.id === img.id 
                        ? 'border-indigo-600 scale-105 shadow-lg' 
                        : 'border-transparent hover:border-indigo-200'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-24 h-24 md:w-28 md:h-28 object-cover" />
                      {img.id === 'maggie' && (
                        <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 rounded-full px-1.5 py-0.5 shadow-lg text-[8px] font-black uppercase">
                          Classic Example
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                         <span className="text-white text-[9px] font-black px-1 text-center block uppercase tracking-tighter">{img.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- DESKTOP VIEW --- */}
        <div className="hidden lg:block">
          <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
            <div className="lg:col-span-3 space-y-6">
              <div className={`p-6 rounded-3xl shadow-lg border transition-colors ${themeClasses.card}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.headerText}`}><Trophy className="text-indigo-500" size={20} />Challenge Levels</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Easy', 'Medium'].map((lvl) => (<button key={lvl} onClick={() => applyDifficulty(lvl as Difficulty)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 text-center flex items-center justify-center ${difficulty === lvl ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-600'} hover:border-indigo-200 hover:bg-indigo-500 hover:text-white`}`}>{lvl}</button>))}
                  <button key='Hard' onClick={() => applyDifficulty('Hard' as Difficulty)} className={`col-span-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 text-center flex items-center justify-center ${difficulty === 'Hard' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-600'} hover:border-indigo-200 hover:bg-indigo-500 hover:text-white`}`}>Hard</button>
                </div>
              </div>
              <div className={`p-6 rounded-3xl shadow-lg border transition-colors ${themeClasses.card}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.headerText}`}><FlaskConical className="text-amber-500" size={20} />Field Scenarios</h3>
                <p className={`mb-4 text-xs leading-relaxed ${themeClasses.subText}`}>Test the AI against real-world problems.</p>
                <FieldScenarios scenarios={FIELD_SCENARIOS} activeScenario={activeScenario} onSelect={handleScenarioSelect} isDarkMode={isDarkMode} />
              </div>
              <div className={`p-4 rounded-3xl shadow-lg border transition-colors ${themeClasses.card}`}>
                <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${themeClasses.headerText}`}><GalleryVerticalEnd className="text-indigo-500" size={20} />Hall of Fame</h3>
                <p className={`mb-4 text-xs leading-relaxed ${themeClasses.subText}`}>Naturally challenging real-world images.</p>
                <GalleryCarousel items={galleryItems} onSelect={(item) => { setSelectedPreset(item); setAnalysis(null); }} isDarkMode={isDarkMode} />
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col items-center gap-6">
              <div className="relative w-full">
                <VisualCanvas ref={canvasRef} imageUrl={selectedPreset.url} transformations={transformations} confusingRegions={analysis?.confusingRegions} darkMode={isDarkMode} />
              </div>
              <button id="challenge-btn" onClick={runTest} disabled={isAnalyzing} className={`w-full py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl relative z-[95] ${isAnalyzing ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'}`}>{isAnalyzing ? <RefreshCw className="animate-spin" /> : <Zap className="fill-current" />}{isAnalyzing ? 'AI is thinking...' : 'Challenge the AI!'}</button>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div id="sliders-panel" className={`p-6 rounded-3xl shadow-2xl border transition-colors relative z-[95] ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'} backdrop-blur-xl`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.headerText}`}><Zap className="text-yellow-500" />Distortion Sliders</h3>
                <ControlSlider label="Blurry Lens" value={transformations.blur} min={0} max={15} unit="px" darkMode={isDarkMode} icon={<CloudFog size={18} className="text-blue-400" />} onChange={(v) => handleTransformChange('blur', v)} />
                <ControlSlider label="Brightness" value={transformations.brightness} min={0} max={200} unit="%" darkMode={isDarkMode} icon={<Sun size={18} className="text-amber-500" />} onChange={(v) => handleTransformChange('brightness', v)} />
                <ControlSlider label="Static Noise" value={transformations.noise} min={0} max={100} unit="%" darkMode={isDarkMode} icon={<Activity size={18} className="text-purple-400" />} onChange={(v) => handleTransformChange('noise', v)} />
                <ControlSlider label="Tilted Angle" value={transformations.rotation} min={-180} max={180} unit="°" darkMode={isDarkMode} icon={<RotateCw size={18} className="text-emerald-500" />} onChange={(v) => handleTransformChange('rotation', v)} />
                <ControlSlider label="Zoom / Crop" value={transformations.crop} min={0} max={100} unit="%" darkMode={isDarkMode} icon={<Maximize size={18} className="text-orange-400" />} onChange={(v) => handleTransformChange('crop', v)} />
                <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}><div className="flex justify-between items-center mb-1"><span className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Messy Factor</span><span className={`text-sm font-bold ${messyGrade.color}`}>{messyGrade.label}</span></div><div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${Math.min(100, (messyLevel / 200) * 100)}%` }} /></div></div>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
              <div id="results-panel" className={`h-full min-h-[400px] rounded-3xl p-8 flex flex-col transition-all duration-500 border-4 relative z-[95] ${!analysis ? `${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'} border-dashed` : analysis.isCorrect ? `${isDarkMode ? 'bg-emerald-950/20 border-emerald-900' : 'bg-green-50 border-green-200'} shadow-lg` : `${isDarkMode ? 'bg-red-950/20 border-red-900' : 'bg-red-50 border-red-200'} shadow-lg`}`}>
                <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><BrainCircuit className={analysis?.isCorrect ? 'text-green-500' : 'text-slate-400'} />AI's Decision</h3>
                {!analysis && !isAnalyzing && (<div className="flex-1 flex flex-col items-center justify-center text-center space-y-4"><div className={`w-20 h-20 rounded-full flex items-center justify-center animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}><ChevronRight className="text-slate-400" size={32} /></div><p className={`${themeClasses.subText} font-medium`}>Run a test to see the AI's results!</p></div>)}
                {isAnalyzing && (<div className="flex-1 flex flex-col items-center justify-center text-center space-y-4"><div className="relative"><BrainCircuit className="text-indigo-600 animate-bounce" size={64} /><RefreshCw className="absolute -top-2 -right-2 text-indigo-400 animate-spin" size={24} /></div><p className="text-indigo-600 font-bold text-lg">Scanning Pixels...</p><p className={`${themeClasses.subText} text-sm`}>Testing robustness to {messyGrade.label.toLowerCase()} distortion.</p></div>)}
                {analysis && (<div className="flex-1 flex flex-col space-y-6 animate-in zoom-in-95 duration-300"><div className="flex justify-between items-start"><div className="max-w-[70%]"><span className={`text-xs uppercase font-bold tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>AI Thinks it sees</span><h2 className={`text-3xl font-black break-words ${themeClasses.headerText}`}>{analysis.label}</h2></div><div className={`p-3 rounded-2xl shadow-md ${analysis.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{analysis.isCorrect ? <ThumbsUp size={32} /> : <ThumbsDown size={32} />}</div></div><div className="space-y-2"><div className="flex justify-between text-sm font-bold"><span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Confidence</span><span className={analysis.confidence > 70 ? 'text-green-600' : 'text-orange-500'}>{analysis.confidence}%</span></div><div className={`w-full h-4 rounded-full overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}><div className={`h-full transition-all duration-1000 ${analysis.confidence > 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${analysis.confidence}%` }} /></div></div><div className={`p-4 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/60 border-white'}`}><h4 className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Lesson from the Machine</h4><p className={`leading-relaxed font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>"{analysis.reasoning}"</p></div><div className="pt-4 flex items-center gap-3 text-sm font-medium"><AlertCircle size={18} className="text-amber-500 shrink-0" /><p className={themeClasses.subText}>{analysis.isCorrect ? "The AI was smart enough to see through the mess!" : "You broke it! This is called 'Drift' or 'Out-of-Distribution' failure."}</p></div></div>)}
              </div>
            </div>
          </main>
          <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className={`${themeClasses.card} p-6 rounded-3xl shadow-md border flex flex-col items-center text-center`}><div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4"><BookOpen size={24} /></div><h3 className={`text-lg font-bold mb-2 ${themeClasses.headerText}`}>The Goal: Generalization</h3><p className={`text-sm ${themeClasses.subText}`}>True AI isn't just a "pixel matcher." It should recognize Maggie whether she's upside down, blurry, or in a snowstorm. This ability is called <strong>Generalization</strong>.</p></div>
            <div className={`${themeClasses.card} p-6 rounded-3xl shadow-md border flex flex-col items-center text-center`}><div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4"><Lightbulb size={24} /></div><h3 className={`text-lg font-bold mb-2 ${themeClasses.headerText}`}>The Trap: Pixel Logic</h3><p className={`text-sm ${themeClasses.subText}`}>Computers don't "see" objects; they see a grid of numbers. When you add noise or tilt, those numbers change wildly. AI must be <strong>Robust</strong> enough to ignore the mess.</p></div>
            <div className={`${themeClasses.card} p-6 rounded-3xl shadow-md border flex flex-col items-center text-center`}><div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4"><ShieldCheck size={24} /></div><h3 className={`text-lg font-bold mb-2 ${themeClasses.headerText}`}>Why it Matters: Safety</h3><p className={`text-sm ${themeClasses.subText}`}>If a self-driving car misses a stop sign because of a shadow, it's a disaster. We build these tests to ensure AI works in the <strong>messy real world</strong>, not just in clean labs.</p></div>
          </section>
          <footer className={`w-full p-8 rounded-[40px] shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-900'} text-white`}><div className="grid md:grid-cols-2 gap-12 items-center"><div><h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Car className="text-indigo-400" />Real World Engineering</h2><p className="text-slate-300 mb-6 leading-relaxed">In industry, we call this <strong>Stress Testing</strong>. Engineers intentionally "poison" their datasets or apply massive distortions to find where the AI is weak. By finding these "edge cases," we can train better models that are safe for everyone to use.</p><div className="flex gap-4"><div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10"><span className="text-indigo-400 font-bold block mb-1">Data Drift</span><span className="text-slate-400 text-xs">When real-world data stops looking like the training data.</span></div><div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10"><span className="text-amber-400 font-bold block mb-1">Out-of-Dist</span><span className="text-slate-400 text-xs">A "wild" image the AI was never prepared to handle.</span></div></div></div><div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/20"><h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity className="text-indigo-400" />Pro Lab Notebook</h3><ul className="space-y-4 text-slate-300 text-sm"><li className="flex gap-3 items-start"><div className="w-5 h-5 bg-indigo-500 rounded flex-shrink-0 flex items-center justify-center text-[10px] mt-1">1</div><p><strong>The Tipping Point:</strong> Every model has a "breaking point" where noise overrides object features.</p></li><li className="flex gap-3 items-start"><div className="w-5 h-5 bg-indigo-500 rounded flex-shrink-0 flex items-center justify-center text-[10px] mt-1">2</div><p><strong>Contextual Clues:</strong> Sometimes AI "cheats" by looking at the background instead of the object!</p></li><li className="flex gap-3 items-start"><div className="w-5 h-5 bg-indigo-500 rounded flex-shrink-0 flex items-center justify-center text-[10px] mt-1">3</div><p><strong>Feedback Loops:</strong> Using the "Confusion Areas" shown on the canvas helps engineers retrain models on specific weaknesses.</p></li></ul></div></div><div className="mt-8 pt-8 border-t border-white/10 text-center text-slate-500 text-xs font-medium uppercase tracking-widest">Edge-Case Challenge &copy; 2025 AI Safety Education</div></footer>
        </div>

        {/* --- MOBILE VIEW --- */}
        <div className="lg:hidden space-y-8">
          {activeTab === 'lab' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-full">
                  <VisualCanvas ref={canvasRef} imageUrl={selectedPreset.url} transformations={transformations} confusingRegions={analysis?.confusingRegions} darkMode={isDarkMode} />
                  <button id="sliders-panel-toggle" onClick={() => setSlidersVisible(!slidersVisible)} className="absolute bottom-24 right-4 z-20 p-4 bg-indigo-600 text-white rounded-full shadow-xl transform active:scale-90 transition-all hover:bg-indigo-700" aria-label="Toggle distortion sliders"><Zap className="fill-current" /></button>
                </div>
                <button id="challenge-btn" onClick={runTest} disabled={isAnalyzing} className={`w-full py-5 rounded-2xl text-xl font-bold items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl relative z-[95] ${isAnalyzing ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'} ${slidersVisible ? 'hidden' : 'flex'}`}>{isAnalyzing ? <RefreshCw className="animate-spin" /> : <Zap className="fill-current" />}{isAnalyzing ? 'AI is thinking...' : 'Challenge the AI!'}</button>
              </div>
              {slidersVisible && (<div onClick={() => setSlidersVisible(false)} className="fixed inset-0 bg-black/40 z-30 animate-in fade-in-25"/>)}
              <div className={`fixed bottom-0 left-0 right-0 z-40 p-4 transition-transform duration-300 ease-in-out ${slidersVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                <div id="sliders-panel" className={`p-6 rounded-3xl shadow-2xl border transition-colors relative z-[95] ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'} backdrop-blur-xl`}>
                  <button onClick={() => setSlidersVisible(false)} className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" aria-label="Close sliders"><X size={20}/></button>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.headerText}`}><Zap className="text-yellow-500" />Distortion Sliders</h3>
                  <ControlSlider label="Blurry Lens" value={transformations.blur} min={0} max={15} unit="px" darkMode={isDarkMode} icon={<CloudFog size={18} className="text-blue-400" />} onChange={(v) => handleTransformChange('blur', v)} />
                  <ControlSlider label="Brightness" value={transformations.brightness} min={0} max={200} unit="%" darkMode={isDarkMode} icon={<Sun size={18} className="text-amber-500" />} onChange={(v) => handleTransformChange('brightness', v)} />
                  <ControlSlider label="Static Noise" value={transformations.noise} min={0} max={100} unit="%" darkMode={isDarkMode} icon={<Activity size={18} className="text-purple-400" />} onChange={(v) => handleTransformChange('noise', v)} />
                  <ControlSlider label="Tilted Angle" value={transformations.rotation} min={-180} max={180} unit="°" darkMode={isDarkMode} icon={<RotateCw size={18} className="text-emerald-500" />} onChange={(v) => handleTransformChange('rotation', v)} />
                  <ControlSlider label="Zoom / Crop" value={transformations.crop} min={0} max={100} unit="%" darkMode={isDarkMode} icon={<Maximize size={18} className="text-orange-400" />} onChange={(v) => handleTransformChange('crop', v)} />
                  <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}><div className="flex justify-between items-center mb-1"><span className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Messy Factor</span><span className={`text-sm font-bold ${messyGrade.color}`}>{messyGrade.label}</span></div><div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${Math.min(100, (messyLevel / 200) * 100)}%` }} /></div></div>
                </div>
              </div>
              <div id="results-panel" className={`h-full min-h-[400px] rounded-3xl p-8 flex flex-col transition-all duration-500 border-4 relative z-[95] ${!analysis ? `${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'} border-dashed` : analysis.isCorrect ? `${isDarkMode ? 'bg-emerald-950/20 border-emerald-900' : 'bg-green-50 border-green-200'} shadow-lg` : `${isDarkMode ? 'bg-red-950/20 border-red-900' : 'bg-red-50 border-red-200'} shadow-lg`}`}>
                <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><BrainCircuit className={analysis?.isCorrect ? 'text-green-500' : 'text-slate-400'} />AI's Decision</h3>
                {!analysis && !isAnalyzing && (<div className="flex-1 flex flex-col items-center justify-center text-center space-y-4"><div className={`w-20 h-20 rounded-full flex items-center justify-center animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}><ChevronRight className="text-slate-400" size={32} /></div><p className={`${themeClasses.subText} font-medium`}>Run a test to see the AI's results!</p></div>)}
                {isAnalyzing && (<div className="flex-1 flex flex-col items-center justify-center text-center space-y-4"><div className="relative"><BrainCircuit className="text-indigo-600 animate-bounce" size={64} /><RefreshCw className="absolute -top-2 -right-2 text-indigo-400 animate-spin" size={24} /></div><p className="text-indigo-600 font-bold text-lg">Scanning Pixels...</p><p className={`${themeClasses.subText} text-sm`}>Testing robustness to {messyGrade.label.toLowerCase()} distortion.</p></div>)}
                {analysis && (<div className="flex-1 flex flex-col space-y-6 animate-in zoom-in-95 duration-300"><div className="flex justify-between items-start"><div className="max-w-[70%]"><span className={`text-xs uppercase font-bold tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>AI Thinks it sees</span><h2 className={`text-3xl font-black break-words ${themeClasses.headerText}`}>{analysis.label}</h2></div><div className={`p-3 rounded-2xl shadow-md ${analysis.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{analysis.isCorrect ? <ThumbsUp size={32} /> : <ThumbsDown size={32} />}</div></div><div className="space-y-2"><div className="flex justify-between text-sm font-bold"><span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Confidence</span><span className={analysis.confidence > 70 ? 'text-green-600' : 'text-orange-500'}>{analysis.confidence}%</span></div><div className={`w-full h-4 rounded-full overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}><div className={`h-full transition-all duration-1000 ${analysis.confidence > 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${analysis.confidence}%` }} /></div></div><div className={`p-4 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/60 border-white'}`}><h4 className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Lesson from the Machine</h4><p className={`leading-relaxed font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>"{analysis.reasoning}"</p></div><div className="pt-4 flex items-center gap-3 text-sm font-medium"><AlertCircle size={18} className="text-amber-500 shrink-0" /><p className={themeClasses.subText}>{analysis.isCorrect ? "The AI was smart enough to see through the mess!" : "You broke it! This is called 'Drift' or 'Out-of-Distribution' failure."}</p></div></div>)}
              </div>
            </div>
          )}
          {activeTab === 'controls' && (
            <div className="space-y-6 animate-in fade-in-25">
              <div className={`p-6 rounded-3xl shadow-lg border transition-colors ${themeClasses.card}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.headerText}`}><Trophy className="text-indigo-500" size={20} />Challenge Levels</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Easy', 'Medium'].map((lvl) => (<button key={lvl} onClick={() => applyDifficulty(lvl as Difficulty)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 text-center flex items-center justify-center ${difficulty === lvl ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-600'} hover:border-indigo-200 hover:bg-indigo-500 hover:text-white`}`}>{lvl}</button>))}
                  <button key='Hard' onClick={() => applyDifficulty('Hard' as Difficulty)} className={`col-span-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 text-center flex items-center justify-center ${difficulty === 'Hard' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : `${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-600'} hover:border-indigo-200 hover:bg-indigo-500 hover:text-white`}`}>Hard</button>
                </div>
              </div>
              <div className={`p-6 rounded-3xl shadow-lg border transition-colors ${themeClasses.card}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.headerText}`}><FlaskConical className="text-amber-500" size={20} />Field Scenarios</h3>
                <p className={`mb-4 text-xs leading-relaxed ${themeClasses.subText}`}>Test the AI against real-world problems.</p>
                <FieldScenarios scenarios={FIELD_SCENARIOS} activeScenario={activeScenario} onSelect={handleScenarioSelect} isDarkMode={isDarkMode} />
              </div>
              <div className={`p-4 rounded-3xl shadow-lg border transition-colors ${themeClasses.card}`}>
                <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${themeClasses.headerText}`}><GalleryVerticalEnd className="text-indigo-500" size={20} />Hall of Fame</h3>
                <p className={`mb-4 text-xs leading-relaxed ${themeClasses.subText}`}>Naturally challenging real-world images.</p>
                <GalleryCarousel items={galleryItems} onSelect={(item) => { setSelectedPreset(item); setAnalysis(null); setActiveTab('lab'); }} isDarkMode={isDarkMode} />
              </div>
            </div>
          )}
          {activeTab === 'learn' && (
            <div className="space-y-8 animate-in fade-in-25">
              {renderMission()}
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${themeClasses.card} p-6 rounded-3xl shadow-md border flex flex-col items-center text-center`}><div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4"><BookOpen size={24} /></div><h3 className={`text-lg font-bold mb-2 ${themeClasses.headerText}`}>The Goal: Generalization</h3><p className={`text-sm ${themeClasses.subText}`}>True AI isn't just a "pixel matcher." It should recognize Maggie whether she's upside down, blurry, or in a snowstorm. This ability is called <strong>Generalization</strong>.</p></div>
                <div className={`${themeClasses.card} p-6 rounded-3xl shadow-md border flex flex-col items-center text-center`}><div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4"><Lightbulb size={24} /></div><h3 className={`text-lg font-bold mb-2 ${themeClasses.headerText}`}>The Trap: Pixel Logic</h3><p className={`text-sm ${themeClasses.subText}`}>Computers don't "see" objects; they see a grid of numbers. When you add noise or tilt, those numbers change wildly. AI must be <strong>Robust</strong> enough to ignore the mess.</p></div>
                <div className={`${themeClasses.card} p-6 rounded-3xl shadow-md border flex flex-col items-center text-center`}><div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4"><ShieldCheck size={24} /></div><h3 className={`text-lg font-bold mb-2 ${themeClasses.headerText}`}>Why it Matters: Safety</h3><p className={`text-sm ${themeClasses.subText}`}>If a self-driving car misses a stop sign because of a shadow, it's a disaster. We build these tests to ensure AI works in the <strong>messy real world</strong>, not just in clean labs.</p></div>
              </div>
              <footer className={`w-full p-8 rounded-[40px] shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-900'} text-white`}><div className="grid md:grid-cols-2 gap-12 items-center"><div><h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Car className="text-indigo-400" />Real World Engineering</h2><p className="text-slate-300 mb-6 leading-relaxed">In industry, we call this <strong>Stress Testing</strong>. Engineers intentionally "poison" their datasets or apply massive distortions to find where the AI is weak. By finding these "edge cases," we can train better models that are safe for everyone to use.</p><div className="flex gap-4"><div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10"><span className="text-indigo-400 font-bold block mb-1">Data Drift</span><span className="text-slate-400 text-xs">When real-world data stops looking like the training data.</span></div><div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10"><span className="text-amber-400 font-bold block mb-1">Out-of-Dist</span><span className="text-slate-400 text-xs">A "wild" image the AI was never prepared to handle.</span></div></div></div><div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/20"><h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity className="text-indigo-400" />Pro Lab Notebook</h3><ul className="space-y-4 text-slate-300 text-sm"><li className="flex gap-3 items-start"><div className="w-5 h-5 bg-indigo-500 rounded flex-shrink-0 flex items-center justify-center text-[10px] mt-1">1</div><p><strong>The Tipping Point:</strong> Every model has a "breaking point" where noise overrides object features.</p></li><li className="flex gap-3 items-start"><div className="w-5 h-5 bg-indigo-500 rounded flex-shrink-0 flex items-center justify-center text-[10px] mt-1">2</div><p><strong>Contextual Clues:</strong> Sometimes AI "cheats" by looking at the background instead of the object!</p></li><li className="flex gap-3 items-start"><div className="w-5 h-5 bg-indigo-500 rounded flex-shrink-0 flex items-center justify-center text-[10px] mt-1">3</div><p><strong>Feedback Loops:</strong> Using the "Confusion Areas" shown on the canvas helps engineers retrain models on specific weaknesses.</p></li></ul></div></div><div className="mt-8 pt-8 border-t border-white/10 text-center text-slate-500 text-xs font-medium uppercase tracking-widest">Edge-Case Challenge &copy; 2025 AI Safety Education</div></footer>
            </div>
          )}
        </div>

      </div>

      <BottomNavBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isDarkMode={isDarkMode} 
      />
    </div>
  );
};

export default App;
