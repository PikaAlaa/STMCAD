import { ComponentType, Pin } from '../types';

export interface ComponentBlueprint {
  type: ComponentType;
  name: string;
  width: number;
  height: number;
  pins: Pin[];
  defaultProperties: any;
}

const generateBreadboardPins = () => {
    const pins: Pin[] = [];
    const startX = 25;
    const spacing = 10;
    
    for (let i = 0; i < 30; i++) {
        pins.push({ id: `rail_top_pos_${i}`, x: startX + i*spacing, y: 10, label: '+' });
        pins.push({ id: `rail_top_neg_${i}`, x: startX + i*spacing, y: 22, label: '-' });
        
        pins.push({ id: `col_top_${i}_a`, x: startX + i*spacing, y: 42 });
        pins.push({ id: `col_top_${i}_b`, x: startX + i*spacing, y: 52 });
        pins.push({ id: `col_top_${i}_c`, x: startX + i*spacing, y: 62 });
        pins.push({ id: `col_top_${i}_d`, x: startX + i*spacing, y: 72 });
        pins.push({ id: `col_top_${i}_e`, x: startX + i*spacing, y: 82 });

        pins.push({ id: `col_bot_${i}_f`, x: startX + i*spacing, y: 108 });
        pins.push({ id: `col_bot_${i}_g`, x: startX + i*spacing, y: 118 });
        pins.push({ id: `col_bot_${i}_h`, x: startX + i*spacing, y: 128 });
        pins.push({ id: `col_bot_${i}_i`, x: startX + i*spacing, y: 138 });
        pins.push({ id: `col_bot_${i}_j`, x: startX + i*spacing, y: 148 });

        pins.push({ id: `rail_bot_pos_${i}`, x: startX + i*spacing, y: 168, label: '+' });
        pins.push({ id: `rail_bot_neg_${i}`, x: startX + i*spacing, y: 180, label: '-' });
    }
    return pins;
};

export const COMPONENT_CATALOG: Record<ComponentType, ComponentBlueprint> = {
  BREADBOARD: {
    type: 'BREADBOARD',
    name: 'Half Breadboard',
    width: 340,
    height: 190,
    pins: generateBreadboardPins(),
    defaultProperties: {}
  },
  BATTERY: {
    type: 'BATTERY',
    name: 'Battery (9V)',
    width: 60,
    height: 80,
    pins: [
      { id: 'pos', x: 30, y: 0 },
      { id: 'neg', x: 30, y: 80 }
    ],
    defaultProperties: { voltage: 9 }
  },
  RESISTOR: {
    type: 'RESISTOR',
    name: 'Resistor',
    width: 80,
    height: 20,
    pins: [
      { id: 'p1', x: 0, y: 10 },
      { id: 'p2', x: 80, y: 10 }
    ],
    defaultProperties: { resistance: 330 }
  },
  LED: {
    type: 'LED',
    name: 'LED',
    width: 30,
    height: 40,
    pins: [
      { id: 'anode', x: 0, y: 40 },
      { id: 'cathode', x: 30, y: 40 }
    ],
    defaultProperties: { color: 'red', maxCurrent: 20 }
  },
  SWITCH: {
    type: 'SWITCH',
    name: 'SPST Switch',
    width: 60,
    height: 30,
    pins: [
      { id: 'p1', x: 0, y: 15 },
      { id: 'p2', x: 60, y: 15 }
    ],
    defaultProperties: {}
  },
  BUZZER: {
    type: 'BUZZER',
    name: 'Piezo Buzzer',
    width: 50,
    height: 50,
    pins: [
      { id: 'pos', x: 15, y: 50 },
      { id: 'neg', x: 35, y: 50 }
    ],
    defaultProperties: { maxCurrent: 30 }
  },
  ARDUINO_UNO: {
    type: 'ARDUINO_UNO',
    name: 'Arduino Uno R3',
    width: 200,
    height: 150,
    pins: [
      // Bottom Row Power
      { id: '3v3', x: 60, y: 150, label: '3.3V' },
      { id: '5v', x: 75, y: 150, label: '5V' },
      { id: 'gnd1', x: 90, y: 150, label: 'GND' },
      { id: 'gnd2', x: 105, y: 150, label: 'GND' },
      { id: 'vin', x: 120, y: 150, label: 'VIN' },
      // Bottom Row Analog
      { id: 'a0', x: 140, y: 150, label: 'A0' },
      { id: 'a1', x: 155, y: 150, label: 'A1' },
      { id: 'a2', x: 170, y: 150, label: 'A2' },
      { id: 'a3', x: 185, y: 150, label: 'A3' },
      // Top Row Digital
      { id: 'd0', x: 180, y: 0, label: 'RX←0' },
      { id: 'd1', x: 165, y: 0, label: 'TX→1' },
      { id: 'd2', x: 150, y: 0, label: '2' },
      { id: 'd3', x: 135, y: 0, label: '~3' },
      { id: 'd4', x: 120, y: 0, label: '4' },
      { id: 'd5', x: 105, y: 0, label: '~5' },
      { id: 'd6', x: 90, y: 0, label: '~6' },
      { id: 'd7', x: 75, y: 0, label: '7' },
      { id: 'd8', x: 55, y: 0, label: '8' },
      { id: 'd9', x: 40, y: 0, label: '~9' },
      { id: 'd10', x: 25, y: 0, label: '~10' },
      { id: 'd11', x: 10, y: 0, label: '~11' },
      { id: 'gnd3', x: -5, y: 0, label: 'GND' }
    ],
    defaultProperties: { code: '// void setup() { ... }', vccVoltage: 5 }
  },
  STM32_BLACK_PILL: {
    type: 'STM32_BLACK_PILL',
    name: 'STM32 Black Pill',
    width: 60,
    height: 180,
    pins: [
      // Left side pins (top to bottom)
      { id: '3v3_1', x: 0, y: 10, label: '3V3' },
      { id: 'gnd1', x: 0, y: 20, label: 'GND' },
      { id: '5v', x: 0, y: 30, label: '5V' },
      { id: 'pb9', x: 0, y: 40, label: 'PB9' },
      { id: 'pb8', x: 0, y: 50, label: 'PB8' },
      { id: 'pb7', x: 0, y: 60, label: 'PB7' },
      { id: 'pb6', x: 0, y: 70, label: 'PB6' },
      { id: 'pb5', x: 0, y: 80, label: 'PB5' },
      { id: 'pa15', x: 0, y: 90, label: 'A15' },
      { id: 'pa12', x: 0, y: 100, label: 'A12' },
      { id: 'pa11', x: 0, y: 110, label: 'A11' },
      { id: 'pa10', x: 0, y: 120, label: 'A10' },
      { id: 'pa9', x: 0, y: 130, label: 'A9' },
      { id: 'pa8', x: 0, y: 140, label: 'A8' },
      { id: 'pb15', x: 0, y: 150, label: 'B15' },
      { id: 'pb14', x: 0, y: 160, label: 'B14' },
      { id: 'pb13', x: 0, y: 170, label: 'B13' },
      // Right side pins (top to bottom)
      { id: '3v3_2', x: 60, y: 10, label: '3V3' },
      { id: 'gnd2', x: 60, y: 20, label: 'GND' },
      { id: '3v3_3', x: 60, y: 30, label: '3V3' },
      { id: 'pa0', x: 60, y: 40, label: 'A0' },
      { id: 'pa1', x: 60, y: 50, label: 'A1' },
      { id: 'pa2', x: 60, y: 60, label: 'A2' },
      { id: 'pa3', x: 60, y: 70, label: 'A3' },
      { id: 'pa4', x: 60, y: 80, label: 'A4' },
      { id: 'pa5', x: 60, y: 90, label: 'A5' },
      { id: 'pa6', x: 60, y: 100, label: 'A6' },
      { id: 'pa7', x: 60, y: 110, label: 'A7' },
      { id: 'pb0', x: 60, y: 120, label: 'B0' },
      { id: 'pb1', x: 60, y: 130, label: 'B1' },
      { id: 'pb2', x: 60, y: 140, label: 'B2' },
      { id: 'pb10', x: 60, y: 150, label: 'B10' },
      { id: 'pb12', x: 60, y: 160, label: 'B12' },
      { id: 'gnd3', x: 60, y: 170, label: 'GND' }
    ],
    defaultProperties: { code: '// STM32 Code', vccVoltage: 3.3 }
  },
  LCD_16X2: {
    type: 'LCD_16X2',
    name: 'LCD 16x2 Display',
    width: 160,
    height: 60,
    pins: [
      { id: 'vss', x: 10, y: 0, label: 'VSS' },
      { id: 'vdd', x: 20, y: 0, label: 'VDD' },
      { id: 'v0', x: 30, y: 0, label: 'V0' },
      { id: 'rs', x: 40, y: 0, label: 'RS' },
      { id: 'rw', x: 50, y: 0, label: 'RW' },
      { id: 'e', x: 60, y: 0, label: 'E' },
      { id: 'd4', x: 100, y: 0, label: 'D4' },
      { id: 'd5', x: 110, y: 0, label: 'D5' },
      { id: 'd6', x: 120, y: 0, label: 'D6' },
      { id: 'd7', x: 130, y: 0, label: 'D7' },
      { id: 'a', x: 140, y: 0, label: 'A' },
      { id: 'k', x: 150, y: 0, label: 'K' }
    ],
    defaultProperties: { maxCurrent: 40 } // Backlight needs limit
  },
  SPI_SCREEN: {
    type: 'SPI_SCREEN',
    name: 'TFT SPI Display',
    width: 80,
    height: 100,
    pins: [
      { id: 'vcc', x: 10, y: 100, label: 'VCC' },
      { id: 'gnd', x: 20, y: 100, label: 'GND' },
      { id: 'cs', x: 30, y: 100, label: 'CS' },
      { id: 'res', x: 40, y: 100, label: 'RST' },
      { id: 'dc', x: 50, y: 100, label: 'DC' },
      { id: 'mosi', x: 60, y: 100, label: 'SDA' },
      { id: 'sck', x: 70, y: 100, label: 'SCK' },
      { id: 'led', x: 80, y: 100, label: 'LED' }
    ],
    defaultProperties: { maxCurrent: 50 }
  }
};
