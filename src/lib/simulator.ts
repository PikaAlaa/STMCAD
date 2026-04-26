import { CircuitComponent, Wire } from '../types';
import { COMPONENT_CATALOG } from '../components/Catalog';

export interface SimulationResult {
  components: CircuitComponent[];
  logs: string[];
}

// A very simplified DC solver that assumes mostly series or simple parallel loops
export function simulateCircuit(components: CircuitComponent[], wires: Wire[]): SimulationResult {
  const logs: string[] = [];
  
  // Create a deep copy of components and reset their states
  const simComps: CircuitComponent[] = components.map(c => ({
    ...c,
    state: { ...c.state, on: false, current: 0, voltageDrop: 0 }
  }));

  // Helper to find a component
  const getComp = (id: string) => simComps.find(c => c.id === id);

  // Build Adjacency List for node traversal (Pins connected by wires or internal paths)
  // To keep it simple, we will just look for any path from Battery + to Battery -
  const powerSources = simComps.filter(c => ['BATTERY', 'ARDUINO_UNO', 'STM32_BLACK_PILL'].includes(c.type));
  
  if (powerSources.length === 0) {
    return { components: simComps, logs: ['No power source found.'] };
  }

  // Find nets (connected pins via wires)
  // Discarding full MNA here in favor of a naive loop finding approach for simplicity
  let pathsFound = 0;

  // Extremely basic path finder for single-loop series circuits
  powerSources.forEach(source => {
    // Determine start/target pins for this power source
    let startPins: string[] = [];
    let targetPins: string[] = [];
    let sourceVoltage = 5;

    if (source.type === 'BATTERY') {
       startPins = [`${source.id}:pos`];
       targetPins = [`${source.id}:neg`];
       sourceVoltage = source.properties.voltage || 9;
    } else if (source.type === 'ARDUINO_UNO' || source.type === 'STM32_BLACK_PILL') {
       startPins = [];
       // Include both 5V and 3V3 for safety depending on board
       if (source.type === 'ARDUINO_UNO') {
          startPins.push(`${source.id}:5v`, `${source.id}:3v3`);
       } else {
          startPins.push(`${source.id}:5v`, `${source.id}:3v3_1`, `${source.id}:3v3_2`, `${source.id}:3v3_3`);
       }
       
       // Handle fake code execution for Blink example or uploaded hex
       const code = (source.properties.code as string || '');
       const now = Date.now();
       
       if (code.startsWith(':')) {
           // Basic dummy simulation for Intel HEX file
           // We'll randomly blink pins to "simulate" execution
           const blinkSpeed = 2; // Variable blink
           if (Math.floor(now / (500 * blinkSpeed)) % 2 === 0) {
               startPins.push(`${source.id}:d11`, `${source.id}:pb12`, `${source.id}:pa5`);
           }
       } else if (code.includes('digitalWrite(11, HIGH)') && code.includes('delay(')) {
           // Arduino Blink
           if (Math.floor(now / 1000) % 2 === 0) {
              startPins.push(`${source.id}:d11`);
           }
       }

       if (source.type === 'ARDUINO_UNO') {
          targetPins = [`${source.id}:gnd1`, `${source.id}:gnd2`, `${source.id}:gnd3`];
          sourceVoltage = 5;
       } else {
          targetPins = [`${source.id}:gnd1`, `${source.id}:gnd2`, `${source.id}:gnd3`];
          sourceVoltage = 3.3;
       }
    }

    // DFS from pos to neg
    const visited = new Set<string>(); // trace visited pins
    
    // Build connection map: pin -> connected pins (via wire or via component internal)
    const connections = new Map<string, Array<{pin: string, compId?: string}>>();
    
    const addConn = (a: string, b: string, compId?: string) => {
      if (!connections.has(a)) connections.set(a, []);
      connections.get(a)!.push({pin: b, compId});
    };

    // Wires
    wires.forEach(w => {
      const pinA = `${w.startComp}:${w.startPin}`;
      const pinB = `${w.endComp}:${w.endPin}`;
      addConn(pinA, pinB);
      addConn(pinB, pinA);
    });

    // Components internal paths
    simComps.forEach(comp => {
      const cat = COMPONENT_CATALOG[comp.type];
      if (comp.type === 'SWITCH' && !comp.state.closed) return; // Open switch = no path
      if (comp.type === 'BATTERY') return; // Handled separately
      
      if (['ARDUINO_UNO', 'STM32_BLACK_PILL', 'LCD_16X2', 'SPI_SCREEN'].includes(comp.type)) {
         // Fake internal connection between ground and VCC/5V/3V3
         if (comp.id !== source.id) {
             const pwrPins = cat.pins.filter(p => ['5v', 'vcc', 'vdd', '3v3', 'vin'].some(v => p.id.includes(v)));
             const gndPins = cat.pins.filter(p => ['gnd', 'vss'].some(v => p.id.includes(v)));
             
             if (pwrPins.length > 0 && gndPins.length > 0) {
                 const pinA = `${comp.id}:${pwrPins[0].id}`;
                 const pinB = `${comp.id}:${gndPins[0].id}`;
                 addConn(pinA, pinB, comp.id);
                 addConn(pinB, pinA, comp.id);
             }
         }
      } else if (comp.type === 'BREADBOARD') {
         // Connect rails
         for(let i=0; i<29; i++){
            addConn(`${comp.id}:rail_top_pos_${i}`, `${comp.id}:rail_top_pos_${i+1}`, comp.id);
            addConn(`${comp.id}:rail_top_pos_${i+1}`, `${comp.id}:rail_top_pos_${i}`, comp.id);
            addConn(`${comp.id}:rail_top_neg_${i}`, `${comp.id}:rail_top_neg_${i+1}`, comp.id);
            addConn(`${comp.id}:rail_top_neg_${i+1}`, `${comp.id}:rail_top_neg_${i}`, comp.id);
            
            addConn(`${comp.id}:rail_bot_pos_${i}`, `${comp.id}:rail_bot_pos_${i+1}`, comp.id);
            addConn(`${comp.id}:rail_bot_pos_${i+1}`, `${comp.id}:rail_bot_pos_${i}`, comp.id);
            addConn(`${comp.id}:rail_bot_neg_${i}`, `${comp.id}:rail_bot_neg_${i+1}`, comp.id);
            addConn(`${comp.id}:rail_bot_neg_${i+1}`, `${comp.id}:rail_bot_neg_${i}`, comp.id);
         }
         // Connect columns
         const topRows = ['a','b','c','d','e'];
         const botRows = ['f','g','h','i','j'];
         for(let i=0; i<30; i++){
            for(let r=0; r<4; r++){
               addConn(`${comp.id}:col_top_${i}_${topRows[r]}`, `${comp.id}:col_top_${i}_${topRows[r+1]}`, comp.id);
               addConn(`${comp.id}:col_top_${i}_${topRows[r+1]}`, `${comp.id}:col_top_${i}_${topRows[r]}`, comp.id);
               
               addConn(`${comp.id}:col_bot_${i}_${botRows[r]}`, `${comp.id}:col_bot_${i}_${botRows[r+1]}`, comp.id);
               addConn(`${comp.id}:col_bot_${i}_${botRows[r+1]}`, `${comp.id}:col_bot_${i}_${botRows[r]}`, comp.id);
            }
         }
      } else if (cat.pins.length >= 2) {
        const pinA = `${comp.id}:${cat.pins[0].id}`;
        const pinB = `${comp.id}:${cat.pins[1].id}`;
        addConn(pinA, pinB, comp.id);
        addConn(pinB, pinA, comp.id);
      }
    });

    const processPath = (path: string[], compsInPath: string[], src: CircuitComponent, initVoltage: number) => {
      let rTotal = 0;
      let ledsInPath = 0;
      compsInPath.forEach(compId => {
        if (compId === src.id) return;
        const c = getComp(compId)!;
        if (c.type === 'RESISTOR') rTotal += (c.properties.resistance || 0);
        if (c.type === 'LED' || c.type === 'BUZZER') {
          ledsInPath++;
          rTotal += 10;
        }
        if (['ARDUINO_UNO', 'STM32_BLACK_PILL', 'LCD_16X2', 'SPI_SCREEN'].includes(c.type)) {
          rTotal += 100;
        }
      });

      if (rTotal === 0) {
       logs.push(`SHORT CIRCUIT DETECTED on ${src.type}!`);
       return;
      }

      const current = initVoltage / rTotal;

      compsInPath.forEach(compId => {
        if (compId === src.id) return;
        const c = getComp(compId)!;
        c.state.current = current;
        
        if (['STM32_BLACK_PILL', 'SPI_SCREEN'].includes(c.type) && initVoltage > 3.6) {
            if (!c.state.burnt) logs.push(`💥 ${c.type} OVERVOLTAGE! Max 3.6V, applied ${initVoltage}V.`);
            c.state.burnt = true;
        }

        if (['ARDUINO_UNO', 'LCD_16X2'].includes(c.type) && initVoltage > 5.5) {
            if (!c.state.burnt) logs.push(`💥 ${c.type} OVERVOLTAGE! Max 5.5V, applied ${initVoltage}V.`);
            c.state.burnt = true;
        }

        if (!c.state.burnt) {
           if (['LCD_16X2', 'SPI_SCREEN'].includes(c.type)) {
             c.state.on = true;
           }
        }

        if (c.type === 'LED' || c.type === 'BUZZER') {
           const maxI = c.properties.maxCurrent || 20;
           const currentMA = current * 1000;
           if (currentMA > maxI) {
             c.state.burnt = true;
             logs.push(`${c.type} ${c.id} BURNT OUT! Current: ${currentMA.toFixed(1)}mA > ${maxI}mA`);
           } else if (currentMA > 1) {
             c.state.on = true;
             if (!c.state.burnt) {
                logs.push(`${c.type} ${c.id} is ON (Current: ${currentMA.toFixed(1)}mA).`);
             }
           }
        }
      });
    };

    let ops = 0;
    const findPaths = (currentPin: string, currentPath: string[], currentComps: string[]) => {
      ops++;
      if (ops > 20000 || pathsFound > 50) return;
      
      if (targetPins.includes(currentPin)) {
        processPath(currentPath, currentComps, source, sourceVoltage);
        pathsFound++;
        return;
      }
      visited.add(currentPin);
      const nextHops = connections.get(currentPin) || [];
      for (const hop of nextHops) {
        if (!visited.has(hop.pin)) {
          let canPass = true;
          if (hop.compId) {
            const comp = getComp(hop.compId)!;
            if (comp.type === 'LED') {
              if (currentPin.includes('cathode')) {
                 canPass = false;
              }
            }
          }
          if (canPass) {
            findPaths(hop.pin, [...currentPath, hop.pin], hop.compId ? [...currentComps, hop.compId] : currentComps);
          }
        }
      }
      visited.delete(currentPin);
    };

    startPins.forEach(sp => {
       findPaths(sp, [sp], []);
    });
  });

  if (pathsFound === 0) {
    logs.push("Circuit is open.");
  }

  return { components: simComps, logs };
}
