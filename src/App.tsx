import React, { useState, useRef, useEffect } from 'react';
import { CircuitComponent, ComponentType, Wire, Point } from './types';
import { COMPONENT_CATALOG } from './components/Catalog';
import { simulateCircuit, SimulationResult } from './lib/simulator';
import { Play, Square, Eraser, MousePointer2, Cable } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type InteractionMode = 'SELECT' | 'WIRE';

export default function App() {
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [mode, setMode] = useState<InteractionMode>('SELECT');
  const [simulating, setSimulating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(false);

  // Interaction State
  const [wiringStart, setWiringStart] = useState<{compId: string, pinId: string, x: number, y: number} | null>(null);

  const loadExample = (exampleName: string) => {
    setSimulating(false);
    setLogs([]);
    setWiringStart(null);
    setSelectedCompId(null);
    setExamplesOpen(false);

    const bbId = uuidv4();

    if (exampleName === 'NO_OPEN_CIRCUIT') {
       const batId = uuidv4();
       const swId = uuidv4();
       const resId = uuidv4();
       const ledId = uuidv4();
       
       setComponents([
          { id: bbId, type: 'BREADBOARD', x: 50, y: 300, rotation: 0, properties: {}, state: {} },
          { id: batId, type: 'BATTERY', x: 50, y: 100, rotation: 0, properties: { voltage: 9 }, state: {} },
          { id: swId, type: 'SWITCH', x: 250, y: 100, rotation: 0, properties: {}, state: { closed: false } },
          { id: resId, type: 'RESISTOR', x: 200, y: 200, rotation: 0, properties: { resistance: 330 }, state: {} },
          { id: ledId, type: 'LED', x: 400, y: 150, rotation: 0, properties: { color: 'green', maxCurrent: 20 }, state: {} },
       ]);

       setWires([
         { id: uuidv4(), startComp: batId, startPin: 'pos', endComp: bbId, endPin: 'rail_top_pos_0' },
         { id: uuidv4(), startComp: batId, startPin: 'neg', endComp: bbId, endPin: 'rail_top_neg_0' },
         { id: uuidv4(), startComp: bbId, startPin: 'rail_top_pos_10', endComp: swId, endPin: 'p1' },
         { id: uuidv4(), startComp: swId, startPin: 'p2', endComp: bbId, endPin: 'col_top_10_a' },
         { id: uuidv4(), startComp: bbId, startPin: 'col_top_10_e', endComp: resId, endPin: 'p1' },
         { id: uuidv4(), startComp: resId, startPin: 'p2', endComp: bbId, endPin: 'col_top_15_a' },
         { id: uuidv4(), startComp: bbId, startPin: 'col_top_15_e', endComp: ledId, endPin: 'anode' },
         { id: uuidv4(), startComp: ledId, startPin: 'cathode', endComp: bbId, endPin: 'rail_top_neg_15' }
       ]);
    } else if (exampleName === 'LED_BLINKS') {
       const ardId = uuidv4();
       const ledId = uuidv4();
       const resId = uuidv4();

       setComponents([
         { id: bbId, type: 'BREADBOARD', x: 50, y: 400, rotation: 0, properties: {}, state: {} },
         { id: ardId, type: 'ARDUINO_UNO', x: 50, y: 100, rotation: 0, properties: { vccVoltage: 5, code: '// Blink\nvoid setup() {\n  pinMode(11, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(11, HIGH);\n  delay(1000);\n  digitalWrite(11, LOW);\n  delay(1000);\n}' }, state: {} },
         { id: resId, type: 'RESISTOR', x: 350, y: 220, rotation: 0, properties: { resistance: 330 }, state: {} },
         { id: ledId, type: 'LED', x: 450, y: 220, rotation: 0, properties: { color: 'red', maxCurrent: 20 }, state: {} },
       ]);

       setWires([
          { id: uuidv4(), startComp: ardId, startPin: 'gnd2', endComp: bbId, endPin: 'rail_bot_neg_0' },
          { id: uuidv4(), startComp: ardId, startPin: 'd11', endComp: bbId, endPin: 'col_bot_5_f' },
          { id: uuidv4(), startComp: bbId, startPin: 'col_bot_5_j', endComp: resId, endPin: 'p1' },
          { id: uuidv4(), startComp: resId, startPin: 'p2', endComp: bbId, endPin: 'col_bot_15_f' },
          { id: uuidv4(), startComp: bbId, startPin: 'col_bot_15_j', endComp: ledId, endPin: 'anode' },
          { id: uuidv4(), startComp: ledId, startPin: 'cathode', endComp: bbId, endPin: 'rail_bot_neg_15' }
       ]);
    } else if (exampleName === 'NO_OPEN_CIRCUIT') {
       const batId = uuidv4();
       const ledId = uuidv4();
       const resId = uuidv4();

       setComponents([
          { id: batId, type: 'BATTERY', x: 100, y: 150, rotation: 0, properties: { voltage: 9 }, state: {} },
          { id: resId, type: 'RESISTOR', x: 250, y: 150, rotation: 0, properties: { resistance: 330 }, state: {} },
          { id: ledId, type: 'LED', x: 400, y: 150, rotation: 0, properties: { color: 'green', maxCurrent: 20 }, state: {} },
       ]);

       setWires([
          // Connected correctly
          { id: uuidv4(), startComp: batId, startPin: 'pos', endComp: resId, endPin: 'p1' },
          { id: uuidv4(), startComp: resId, startPin: 'p2', endComp: ledId, endPin: 'anode' },
          { id: uuidv4(), startComp: ledId, startPin: 'cathode', endComp: batId, endPin: 'neg' }
       ]);
    } else if (exampleName === 'NO_SHORT_CIRCUIT') {
       const batId = uuidv4();
       const ledId = uuidv4();
       const resId = uuidv4();

       setComponents([
          { id: batId, type: 'BATTERY', x: 150, y: 150, rotation: 0, properties: { voltage: 9 }, state: {} },
          { id: resId, type: 'RESISTOR', x: 300, y: 150, rotation: 0, properties: { resistance: 330 }, state: {} },
          { id: ledId, type: 'LED', x: 450, y: 150, rotation: 0, properties: { color: 'blue', maxCurrent: 20 }, state: {} },
       ]);

       setWires([
          // Connected correctly without short
          { id: uuidv4(), startComp: batId, startPin: 'pos', endComp: resId, endPin: 'p1' },
          { id: uuidv4(), startComp: resId, startPin: 'p2', endComp: ledId, endPin: 'anode' },
          { id: uuidv4(), startComp: ledId, startPin: 'cathode', endComp: batId, endPin: 'neg' }
       ]);
    }
  };
  const [mousePos, setMousePos] = useState<Point>({x: 0, y: 0});
  const canvasRef = useRef<HTMLDivElement>(null);

  // State refs for simulation
  const wiresRef = useRef<Wire[]>(wires);
  const componentsRef = useRef<CircuitComponent[]>(components);
  useEffect(() => { wiresRef.current = wires; }, [wires]);
  useEffect(() => { componentsRef.current = components; }, [components]);

  // Simulation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simulating) {
      const runSim = () => {
        const result = simulateCircuit(componentsRef.current, wiresRef.current);
        // Only set components if we are still simulating
        setComponents([...result.components]);
        setLogs(result.logs);
      };
      runSim(); // run once immediately
      interval = setInterval(runSim, 200); // refresh every 200ms
    }
    return () => clearInterval(interval);
  }, [simulating]);

  const handleAddComponent = (type: ComponentType) => {
    const cat = COMPONENT_CATALOG[type];
    const newComp: CircuitComponent = {
      id: uuidv4(),
      type,
      x: 100,
      y: 100,
      rotation: 0,
      properties: { ...cat.defaultProperties },
      state: { closed: false, burnt: false, on: false, current: 0 }
    };
    setComponents([...components, newComp]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
       setSelectedCompId(null);
       if (wiringStart) setWiringStart(null);
    }
  };

  const handlePinClick = (e: React.MouseEvent, compId: string, pinId: string, px: number, py: number) => {
    e.stopPropagation();
    if (mode === 'WIRE') {
      if (wiringStart) {
        if (wiringStart.compId === compId && wiringStart.pinId === pinId) {
          setWiringStart(null); // Cancel
          return;
        }
        // Complete wire
        const newWire: Wire = {
          id: uuidv4(),
          startComp: wiringStart.compId,
          startPin: wiringStart.pinId,
          endComp: compId,
          endPin: pinId
        };
        setWires([...wires, newWire]);
        setWiringStart(null);
      } else {
        setWiringStart({ compId, pinId, x: px, y: py });
      }
    }
  };

  const handleCompClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (mode === 'SELECT') {
      setSelectedCompId(id);
    }
    // Toggle switch
    if (!simulating) {
        setComponents(components.map(c => {
           if (c.id === id && c.type === 'SWITCH') {
             return { ...c, state: { ...c.state, closed: !c.state.closed } };
           }
           return c;
        }));
    }
  };

  const handleComponentDrag = (e: React.MouseEvent, id: string) => {
    if (mode !== 'SELECT') return;
    // Basic drag implementation (simplified)
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const comp = components.find(c => c.id === id);
    if (!comp) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setComponents(comps => comps.map(c => 
        c.id === id ? { ...c, x: comp.x + dx, y: comp.y + dy } : c
      ));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const selectedComp = components.find(c => c.id === selectedCompId);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0 relative z-50">
        <h1 className="text-xl font-bold tracking-tight text-indigo-600">CircuiSim Pro</h1>
        
        <div className="flex items-center gap-2">
          <div className="relative">
             <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                onClick={() => setExamplesOpen(!examplesOpen)}
             >
                Examples ▾
             </button>
             {examplesOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-md flex flex-col py-1 overflow-hidden z-50">
                   <button className="px-4 py-2 text-left text-sm hover:bg-indigo-50 hover:text-indigo-700" onClick={() => loadExample('LED_BLINKS')}>The Led Blinks</button>
                   <button className="px-4 py-2 text-left text-sm hover:bg-indigo-50 hover:text-indigo-700" onClick={() => loadExample('NO_OPEN_CIRCUIT')}>No Open circuit</button>
                   <button className="px-4 py-2 text-left text-sm hover:bg-indigo-50 hover:text-indigo-700" onClick={() => loadExample('NO_SHORT_CIRCUIT')}>No Short circuit</button>
                </div>
             )}
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <button 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'SELECT' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}
            onClick={() => { setMode('SELECT'); setWiringStart(null); }}
          >
            <MousePointer2 size={16} /> Select / Move
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'WIRE' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}
            onClick={() => setMode('WIRE')}
          >
            <Cable size={16} /> Wire
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <button 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white ${simulating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            onClick={() => setSimulating(!simulating)}
          >
            {simulating ? <><Square size={16}/> Stop</> : <><Play size={16}/> Simulate</>}
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => { setComponents([]); setWires([]); setLogs([]); setSimulating(false); }}
          >
            <Eraser size={16} /> Clear
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Palette */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Components
          </div>
          <div className="p-2 flex flex-col gap-2">
            {(Object.keys(COMPONENT_CATALOG) as ComponentType[]).map(type => (
              <button 
                key={type}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left bg-white text-gray-800 font-medium"
                onClick={() => handleAddComponent(type)}
                disabled={simulating}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-xs">
                    {type.substring(0,2)}
                </div>
                {COMPONENT_CATALOG[type].name}
              </button>
            ))}
          </div>
          
          <div className="mt-auto p-4 border-t border-gray-200 text-xs text-gray-500 font-mono flex flex-col gap-1">
             <strong>Logs:</strong>
             {logs.length === 0 && <span>No simulation logs.</span>}
             {logs.map((L, i) => <span key={i} className={L.includes('BURNT') || L.includes('SHORT') ? 'text-red-600 font-bold' : ''}>{L}</span>)}
          </div>
        </aside>

        {/* Canvas Area */}
        <main 
          ref={canvasRef}
          className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-gray-50 relative overflow-hidden cursor-crosshair"
          onMouseMove={handleCanvasMouseMove}
          onClick={handleCanvasClick}
        >
          {/* SVG layer for wires */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-blue-500 stroke-[3px] fill-transparent stroke-linecap-round stroke-linejoin-round" style={{ zIndex: mode==='WIRE' ? 40 : 0 }}>
            {wires.map(w => {
               const c1 = components.find(c => c.id === w.startComp);
               const c2 = components.find(c => c.id === w.endComp);
               if (!c1 || !c2) return null;

               // Helper to rotate a point (px, py) around center (cx, cy)
               const rotatePoint = (px: number, py: number, cx: number, cy: number, angleDeg: number) => {
                   const angle = angleDeg * Math.PI / 180;
                   const dx = px - cx;
                   const dy = py - cy;
                   return {
                       x: cx + dx * Math.cos(angle) - dy * Math.sin(angle),
                       y: cy + dx * Math.sin(angle) + dy * Math.cos(angle)
                   };
               };

               const cat1 = COMPONENT_CATALOG[c1.type];
               const cat2 = COMPONENT_CATALOG[c2.type];
               
               const p1 = cat1.pins.find(p => p.id === w.startPin);
               const p2 = cat2.pins.find(p => p.id === w.endPin);
               if (!p1 || !p2) return null;
               
               const rawP1 = { x: c1.x + p1.x, y: c1.y + p1.y };
               const center1 = { x: c1.x + cat1.width / 2, y: c1.y + cat1.height / 2 };
               const rotatedP1 = rotatePoint(rawP1.x, rawP1.y, center1.x, center1.y, c1.rotation);

               const rawP2 = { x: c2.x + p2.x, y: c2.y + p2.y };
               const center2 = { x: c2.x + cat2.width / 2, y: c2.y + cat2.height / 2 };
               const rotatedP2 = rotatePoint(rawP2.x, rawP2.y, center2.x, center2.y, c2.rotation);

               // Draw an elbow wire instead of direct line if they aren't perfectly aligned
               const midX = rotatedP1.x + (rotatedP2.x - rotatedP1.x) / 2;

               return <path key={w.id} d={`M ${rotatedP1.x} ${rotatedP1.y} C ${midX} ${rotatedP1.y}, ${midX} ${rotatedP2.y}, ${rotatedP2.x} ${rotatedP2.y}`} className="pointer-events-auto hover:stroke-red-500 hover:stroke-[4px] cursor-pointer transition-all duration-200" onClick={(e) => {
                  e.stopPropagation();
                  setWires(wires.filter(wire => wire.id !== w.id));
               }}/>
            })}
            {wiringStart && (
              <line 
                x1={wiringStart.x} y1={wiringStart.y} 
                x2={mousePos.x} y2={mousePos.y} 
                className="stroke-blue-400 stroke-[3px] stroke-dasharray-[6,6]" 
              />
            )}
          </svg>

          {/* Render Components */}
          {components.map(comp => {
             const cat = COMPONENT_CATALOG[comp.type];
             const isSelected = selectedCompId === comp.id;
             return (
                 <div 
                 key={comp.id}
                 className={`absolute shadow-sm transition-shadow rounded duration-200 ${isSelected ? 'ring-4 ring-indigo-500 ring-offset-2' : 'hover:shadow-md'} ${comp.state.burnt ? 'opacity-50 grayscale contrast-200' : ''}`}
                 style={{ 
                     left: comp.x, top: comp.y, 
                     width: cat.width, height: cat.height,
                     transform: `rotate(${comp.rotation}deg)`,
                     transformOrigin: 'center center'
                 }}
                 onClick={(e) => handleCompClick(e, comp.id)}
                 onMouseDown={(e) => handleComponentDrag(e, comp.id)}
               >
                 {/* Component Visual representation */}
                 <div className={`w-full h-full rounded-sm flex flex-col items-center justify-center text-[10px] font-mono select-none overflow-hidden ${['ARDUINO_UNO', 'STM32_BLACK_PILL', 'BREADBOARD'].includes(comp.type) ? 'bg-transparent border-transparent' : 'bg-white border-2 border-gray-300'} ${comp.type === 'BATTERY' ? '!border-orange-600' : ''}`} style={comp.type === 'LED' && comp.state.on ? { borderColor: comp.properties.color as string || 'red', boxShadow: `0 0 15px 2px ${comp.properties.color as string || 'red'}` } : {}}>
                    {comp.type === 'SWITCH' ? (
                       <div className="w-full h-full relative cursor-pointer bg-gray-50 flex items-center justify-center">
                          <span className="absolute top-1 text-[8px] text-gray-400">SWITCH</span>
                          <div className={`w-10 h-1.5 bg-gray-800 rounded origin-left transition-transform duration-200 ${comp.state.closed ? 'rotate-0 translate-y-1.5' : '-rotate-45 translate-y-2'}`}></div>
                          <div className="absolute top-1/2 left-2 w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-500 -translate-y-1/2 shadow-inner"></div>
                          <div className="absolute top-1/2 right-2 w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-500 -translate-y-1/2 shadow-inner"></div>
                       </div>
                    ) : comp.type === 'RESISTOR' ? (
                       <div className="w-full h-full relative bg-[#e8d5c4] flex flex-col items-center justify-center">
                         <div className="absolute flex gap-1 items-center z-0 w-full px-2">
                           <div className="flex-1 h-0.5 bg-black"></div>
                           <div className="w-4 h-full bg-black"></div>
                           <div className="flex-1 h-0.5 bg-black"></div>
                         </div>
                         <svg width="100%" height="100%" viewBox="0 0 80 20" className="absolute inset-0 pointer-events-none">
                            <path d="M 0 10 L 15 10 L 20 2 L 30 18 L 40 2 L 50 18 L 60 2 L 65 10 L 80 10" stroke="#333" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
                         </svg>
                         <span className="bg-white/80 px-1 rounded text-[8px] z-10 font-bold">{comp.properties.resistance}Ω</span>
                       </div>
                    ) : comp.type === 'LED' ? (
                       <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
                           <div className={`w-6 h-6 rounded-full border-2 transition-colors duration-300 ${comp.state.burnt ? 'bg-zinc-800 border-zinc-900' : ''}`} style={comp.state.burnt ? {} : { backgroundColor: comp.state.on ? (comp.properties.color as string || 'red') : 'transparent', borderColor: comp.properties.color as string || 'red' }}>
                             <div className="w-3 h-3 rounded-full bg-white opacity-40 absolute top-1 left-1"></div>
                           </div>
                           {comp.state.burnt && <span className="absolute top-0 right-0 text-lg drop-shadow-md">💥</span>}
                       </div>
                    ) : comp.type === 'BATTERY' ? (
                       <div className="flex flex-col w-full h-full">
                          <div className="h-3 w-6 bg-gray-400 mx-auto rounded-t-sm border-x border-t border-gray-600"></div>
                          <div className="flex-1 bg-orange-500 text-white flex flex-col items-center justify-center border-t-2 border-orange-400">
                             <span className="font-bold text-sm tracking-wider">{comp.properties.voltage}V</span>
                          </div>
                          <div className="h-6 bg-zinc-800 text-gray-400 flex items-center justify-center text-[10px] font-bold">
                             - NEG
                          </div>
                          <div className="absolute top-4 w-full text-center text-white font-bold text-[10px]">+ POS</div>
                       </div>
                    ) : comp.type === 'BUZZER' ? (
                       <div className="w-full h-full bg-zinc-800 flex items-center justify-center p-1 relative rounded-full">
                         <div className="w-full h-full rounded-full border-4 border-zinc-600 flex items-center justify-center bg-zinc-700 overflow-hidden relative">
                            {comp.state.on && <div className="absolute w-full h-full bg-yellow-400 opacity-20 animate-ping rounded-full"></div>}
                            <span className={`text-zinc-300 font-bold ${comp.state.on ? 'animate-bounce' : ''}`}>♪</span>
                         </div>
                         {comp.state.burnt && <span className="absolute -top-2 -right-2 text-xl drop-shadow-md z-20">💥</span>}
                       </div>
                    ) : comp.type === 'ARDUINO_UNO' ? (
                       <div className="w-full h-full bg-[#006468] flex flex-col relative rounded-md border-2 border-[#004d50] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] p-2">
                          {/* USB Port */}
                          <div className="absolute top-2 -left-2 w-10 h-10 bg-slate-300 border-2 border-slate-500 rounded-sm shadow-sm flex items-center justify-center">
                            <div className="w-4 h-2 bg-slate-400"></div>
                          </div>
                          {/* Power Jack */}
                          <div className="absolute bottom-2 -left-2 w-10 h-12 bg-gray-800 border-2 border-gray-900 rounded-r-md shadow-sm"></div>
                          
                          {/* Headers Top */}
                          <div className="absolute top-0 right-2 w-32 h-3 bg-zinc-900 flex justify-around items-center px-1">
                            {Array(10).fill(0).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>)}
                          </div>
                          {/* Headers Bottom */}
                          <div className="absolute bottom-0 right-10 w-24 h-3 bg-zinc-900 flex justify-around items-center px-1">
                            {Array(8).fill(0).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>)}
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none mt-4">
                            <div className="flex items-center gap-1 opacity-80">
                               <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center font-bold text-white text-[8px]">-</div>
                               <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center font-bold text-white text-[8px]">+</div>
                            </div>
                            <div className="text-white text-xs font-bold mt-1 tracking-widest opacity-90 drop-shadow-md">UNO</div>
                            <div className="text-white text-[6px] font-bold tracking-widest opacity-80">ARDUINO</div>
                            <div className="w-20 h-6 bg-zinc-900 border border-zinc-700 mx-auto mt-4 flex items-center justify-center text-[5px] text-zinc-500 rounded-sm shadow-lg">ATMEGA328P-PU</div>
                          </div>
                          {comp.state.burnt && <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl drop-shadow-md z-20">💥</span>}
                       </div>
                    ) : comp.type === 'STM32_BLACK_PILL' ? (
                       <div className="w-full h-full bg-[#1a1a1a] flex flex-col relative rounded-sm border-2 border-[#111] shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] overflow-hidden">
                          {/* USB-C */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-6 h-3 bg-gray-400 border border-gray-600 rounded-sm"></div>
                          
                          {/* Headers */}
                          <div className="absolute left-0 top-2 bottom-2 w-3 bg-yellow-400 flex flex-col justify-around items-center py-1 border-r border-yellow-500">
                             {Array(17).fill(0).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-black rounded-sm"></div>)}
                          </div>
                          <div className="absolute right-0 top-2 bottom-2 w-3 bg-yellow-400 flex flex-col justify-around items-center py-1 border-l border-yellow-500">
                             {Array(17).fill(0).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-black rounded-sm"></div>)}
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none mt-6">
                            <div className="w-6 h-6 bg-zinc-800 border bg-gradient-to-br from-zinc-700 to-zinc-900 border-zinc-600 rounded flex items-center justify-center rotate-45 shadow-lg"></div>
                            <div className="text-zinc-300 text-[6px] font-bold text-center mt-6 opacity-70 rotate-[-90deg] absolute right-4 truncate">STM32F411</div>
                          </div>
                          
                          {/* Crystal and buttons */}
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-8 h-3 bg-gray-500 rounded-full border border-gray-600"></div>
                          <div className="absolute top-6 right-4 w-3 h-3 bg-zinc-800 border border-zinc-600 rounded flex items-center justify-center"><div className="w-1 h-1 bg-white rounded-full"></div></div>

                          {comp.state.burnt && <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow-md z-20">💥</span>}
                       </div>
                    ) : comp.type === 'LCD_16X2' ? (
                       <div className="w-full h-full bg-green-700 relative p-2 border-2 border-green-800 rounded flex flex-col items-center">
                          <div className={`w-full h-10 ${comp.state.on && !comp.state.burnt ? 'bg-green-400 border-green-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]' : 'bg-green-800 border-green-900'} border-4 flex items-center px-1 font-mono text-[10px] whitespace-pre text-black leading-none`}>
                             {comp.state.burnt ? '########### X _ X' : (comp.state.displayText?.[0] || '') + '\n' + (comp.state.displayText?.[1] || '')}
                          </div>
                          {comp.state.burnt && <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl drop-shadow-md z-20">💥</span>}
                       </div>
                    ) : comp.type === 'SPI_SCREEN' ? (
                       <div className="w-full h-full bg-red-600 relative p-1 rounded border-b-2 border-red-800">
                          <div className={`w-full h-20 ${comp.state.on && !comp.state.burnt ? 'bg-white' : 'bg-zinc-800'} border-4 border-zinc-900 flex items-center justify-center overflow-hidden`}>
                             {comp.state.on && !comp.state.burnt && <div className="text-[8px] text-black">Display ON</div>}
                          </div>
                          {comp.state.burnt && <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow-md z-20">💥</span>}
                       </div>
                    ) : comp.type === 'BREADBOARD' ? (
                       <div className="w-full h-full bg-[#E8E4D9] rounded shadow-md border-b-[6px] border-r-[4px] border-[#C8C4B9] flex flex-col p-1 relative box-border overflow-hidden">
                          {/* Rail Lines */}
                          <div className="absolute left-6 right-6 top-[15px] h-0.5 bg-red-400 opacity-60"></div>
                          <div className="absolute left-6 right-6 top-[27px] h-0.5 bg-blue-400 opacity-60"></div>
                          
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                             <div className="w-full h-2 bg-gray-500"></div>
                          </div>

                          <div className="absolute left-6 right-6 bottom-[27px] h-0.5 bg-red-400 opacity-60"></div>
                          <div className="absolute left-6 right-6 bottom-[15px] h-0.5 bg-blue-400 opacity-60"></div>
                          
                          {/* Column markers */}
                          <div className="absolute left-[25px] top-[30px] right-[25px] flex justify-between px-1">
                             {Array(6).fill(0).map((_,i) => <div key={i} className="text-[6px] font-bold text-gray-500">{i*5 + 1}</div>)}
                          </div>
                       </div>
                    ) : cat.name}
                 </div>

                 {/* Pins */}
                 {cat.pins.map(pin => {
                   const px = pin.x;
                   const py = pin.y;
                   // Re-use logic to get absolute rotated pin position
                   const cx = cat.width / 2;
                   const cy = cat.height / 2;
                   const angle = comp.rotation * Math.PI / 180;
                   const dx = px - cx;
                   const dy = py - cy;
                   const absoluteRotatedX = comp.x + cx + dx * Math.cos(angle) - dy * Math.sin(angle);
                   const absoluteRotatedY = comp.y + cy + dx * Math.sin(angle) + dy * Math.cos(angle);

                   const isBreadboard = comp.type === 'BREADBOARD';
                   const pinSize = isBreadboard ? 8 : 16;
                   const offset = pinSize / 2;

                   return (
                     <div 
                       key={pin.id}
                       className="absolute flex items-center justify-center group z-10"
                       style={{ left: px - offset, top: py - offset, width: pinSize, height: pinSize }}
                     >
                       <div className={`w-full h-full ${isBreadboard ? 'rounded bg-gray-600 hover:bg-blue-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]' : 'bg-blue-500 rounded-full border-2 border-white cursor-pointer group-hover:scale-125 transition-transform active:bg-blue-700'}`}
                            onClick={(e) => handlePinClick(e, comp.id, pin.id, absoluteRotatedX, absoluteRotatedY)}
                       />
                       {pin.label && !isBreadboard && (
                         <span className="absolute -top-5 w-max text-[9px] font-bold text-gray-800 bg-white shadow-sm ring-1 ring-black/5 px-1.5 py-0.5 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                           {pin.label}
                         </span>
                       )}
                     </div>
                   );
                 })}
               </div>
             );
          })}
        </main>

        {/* Right Properties Panel */}
        <aside className="w-64 bg-white border-l border-gray-200 p-6 shrink-0 flex flex-col gap-6">
           <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Properties & State</h2>
           {selectedComp ? (
             <div className="flex flex-col gap-4">
                <div className="text-lg font-medium">{COMPONENT_CATALOG[selectedComp.type].name}</div>
                <div className="text-xs text-gray-400 font-mono break-all leading-tight">ID: {selectedComp.id}</div>
                
                <div className="w-full h-px bg-gray-200 my-2"></div>

                {Object.entries(selectedComp.properties).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700 capitalize">{key}</label>
                    {key === 'code' ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          className="border border-gray-300 rounded px-2 py-1.5 text-[10px] font-mono focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 resize-none"
                          value={val as string}
                          onChange={(e) => {
                             setComponents(components.map(c => 
                               c.id === selectedComp.id ? { ...c, properties: { ...c.properties, [key]: e.target.value } } : c
                             ));
                          }}
                          disabled={simulating}
                          placeholder="// Type code or upload .hex"
                        />
                        <div className="flex items-center justify-between mt-1">
                           <span className="text-xs text-gray-500">Upload .hex:</span>
                           <input type="file" accept=".hex,.bin" onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                   const reader = new FileReader();
                                   reader.onload = (re) => {
                                       const content = re.target?.result as string;
                                       setComponents(components.map(c => 
                                         c.id === selectedComp.id ? { ...c, properties: { ...c.properties, [key]: content } } : c
                                       ));
                                   };
                                   reader.readAsText(file);
                               }
                           }} className="text-xs w-48 font-mono file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        </div>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={val as string}
                        onChange={(e) => {
                           const newVal = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                           setComponents(components.map(c => 
                             c.id === selectedComp.id ? { ...c, properties: { ...c.properties, [key]: newVal } } : c
                           ));
                        }}
                        disabled={simulating}
                      />
                    )}
                  </div>
                ))}
                {Object.keys(selectedComp.properties).length === 0 && <div className="text-sm text-gray-500">No editable properties.</div>}

                {/* State display */}
                <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                   <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Live metrics</div>
                   <div className="text-sm flex justify-between"><span>Current:</span> <span className="font-mono">{((selectedComp.state.current || 0) * 1000).toFixed(1)} mA</span></div>
                   <div className="text-sm flex justify-between mt-1"><span>Status:</span> 
                     <span className={`font-medium ${selectedComp.state.burnt ? 'text-red-600' : selectedComp.state.on ? 'text-green-600' : 'text-gray-500'}`}>
                        {selectedComp.state.burnt ? 'BURNT' : selectedComp.state.on ? 'ACTIVE' : 'IDLE'}
                     </span>
                   </div>
                </div>

                <div className="flex gap-2 w-full mt-4">
                  <button 
                    className="flex-1 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
                    onClick={() => {
                        setComponents(components.map(c => 
                            c.id === selectedComp.id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
                        ));
                    }}
                    disabled={simulating}
                  >
                    Rotate 90°
                  </button>
                  <button 
                    className="flex-1 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                    onClick={() => {
                       setComponents(components.filter(c => c.id !== selectedComp.id));
                       setWires(wires.filter(w => w.startComp !== selectedComp.id && w.endComp !== selectedComp.id));
                       setSelectedCompId(null);
                    }}
                    disabled={simulating}
                  >
                    Delete
                  </button>
                </div>
             </div>
           ) : (
             <div className="text-sm text-gray-400 italic mt-10 text-center">Select a component to edit its properties.</div>
           )}
        </aside>
      </div>
    </div>
  );
}

