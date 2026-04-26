export type ComponentType = 'BATTERY' | 'LED' | 'RESISTOR' | 'SWITCH' | 'BUZZER' | 'ARDUINO_UNO' | 'STM32_BLACK_PILL' | 'LCD_16X2' | 'SPI_SCREEN' | 'BREADBOARD';

export interface Pin {
  id: string;
  x: number; // Offset from component top-left
  y: number; // Offset from component top-left
  label?: string; // Optional label for UI
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  properties: {
    voltage?: number; // Battery
    resistance?: number; // Resistor
    color?: string; // LED
    maxCurrent?: number; // LED/Buzzer max current in mA
    code?: string; // Microcontroller code
    vccVoltage?: number; // Operating voltage
  };
  state: {
    closed?: boolean; // Switch
    burnt?: boolean; // Flaw state 
    on?: boolean; // Visual state
    current?: number; // Calculated current
    voltageDrop?: number; // Calculated voltage drop
    displayText?: string[]; // For LCD screens
    pinVoltages?: Record<string, number>; // Voltage at each pin
  };
}

export interface Wire {
  id: string;
  startComp: string;
  startPin: string;
  endComp: string;
  endPin: string;
}

export interface Point {
  x: number;
  y: number;
}
