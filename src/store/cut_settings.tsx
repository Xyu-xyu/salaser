/* export interface Root {
    success: boolean
    result: Result
  }
  
  export interface Result {
    machine: Machine
    material: Material
    technology: Technology
  }
  
  export interface Machine {
    name: string
    sourcePower_w: number
  }
  
  export interface Material {
    code: string
    name: string
    thickness: number
  }
  
  export interface Technology {
    macros: Macro[]
    piercingMacros: PiercingMacro[]
    modulationMacros: ModulationMacro[]
    feeding: Feeding
  }
  
  export interface Macro {
    piercingMacro: number
    cutting: Cutting
  }
  
  export interface Cutting {
    pressure: number
    power_W_mm: number
    gas: string
    focus: number
    enabled: boolean
    feedLimit_mm_s: number
    cross_blow: boolean
    type: string
    modulationMacro: number
    height: number
    modulationFrequency_Hz: number
  }
  
  export interface PiercingMacro {
    initial_modulationFrequency_Hz: number
    stages: Stage[]
    initial_cross_blow: boolean
    initial_pressure: number
    gas: string
    name: string
    initial_modulationMacro: number
    initial_power: number
    initial_focus: number
    initial_height: number
  }
  
  export interface Stage {
    pressure: number
    power: number
    enabled: boolean
    delay_s: number
    power_W_s: number
    focus: number
    height: number
    modulationFrequency_Hz: number
    cross_blow: boolean
    modulationMacro: number
  }
  
  export interface ModulationMacro {
    pulseFill_percent: number
    name: string
    pulseFrequency_Hz: number
  }
  
  export interface Feeding {
    feedLimit_mm_s: number
  } */
  
const cut_settings= JSON.parse(`{
    "success": true,
    "result": {
      "machine": {
        "name": "SGNlaser",
        "sourcePower_w": 12000
      },
      "material": {
        "code": "STEEL",
        "name": "Steel",
        "thickness": 1.5
      },
      "technology": {
        "macros": [
          {
            "piercingMacro": 0,
            "cutting": {
              "pressure": 8.0,
              "power_W_mm": 100.0,
              "gas": "AIR",
              "focus": -15.0,
              "enabled": true,
              "feedLimit_mm_s": 40000,
              "cross_blow": true,
              "type": "CW",
              "modulationMacro": 0             ,
              "height": 2.0,
              "modulationFrequency_Hz": 20000.0
            }
          },
          {
            "piercingMacro": 1,
            "cutting": {
              "pressure": 9.0,
              "power_W_mm": 20000.0,
              "gas": "O2",
              "focus": 10.0,
              "enabled": true,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "PULSE",
              "modulationMacro": 6,
              "height": 1.9,
              "modulationFrequency_Hz": 40000.0
            }
          },
          {
            "piercingMacro": 2,
            "cutting": {
              "pressure": 10.0,
              "power_W_mm": 30000.0,
              "gas": "N2",
              "focus": -11.0,
              "enabled": true,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "ENGRAVING",
              "modulationMacro": 1,
              "height": 1.9,
              "modulationFrequency_Hz": 50000.0
            }
          },
          {
            "piercingMacro": 3,
            "cutting": {
              "pressure": 11.0,
              "power_W_mm": 40000.0,
              "gas": "AIR",
              "focus": 9.0,
              "enabled": true,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "VAPOR",
              "modulationMacro": 6,
              "height": 1.0,
              "modulationFrequency_Hz": 60000.0
            }
          },
          {
            "piercingMacro": 4,
            "cutting": {
              "pressure": 12.0,
              "power_W_mm": 50000.0,
              "gas": "AIR",
              "focus": -14.0,
              "enabled": true,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "EDGING",
              "modulationMacro": 2,
              "height": 1.5,
              "modulationFrequency_Hz": 70000.0
            }
          },
          {
            "piercingMacro": 5,
            "cutting": {
              "pressure": 13.0,
              "power_W_mm": 60000.0,
              "gas": "AIR",
              "focus": 15.0,
              "enabled": true,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "CW",
              "modulationMacro": 13,
              "height": 1.4,
              "modulationFrequency_Hz": 80000.0
            }
          },
          {
            "piercingMacro": 6,
            "cutting": {
              "pressure": 14.0,
              "power_W_mm": 70000.0,
              "gas": "AIR",
              "focus": -1.0,
              "enabled": true,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "CW",
              "modulationMacro": 3,
              "height": 0.1,
              "modulationFrequency_Hz": 90000.0
            }
          },
          {
            "piercingMacro": 7,
            "cutting": {
              "pressure": 15.0,
              "power_W_mm": 100000.0,
              "gas": "O2",
              "focus": 0,
              "enabled": true,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "CW",
              "modulationMacro": 12,
              "height": 1.1,
              "modulationFrequency_Hz": 100000.0
            }
          }
        ],
        "piercingMacros": [
          {
            "initial_modulationFrequency_Hz": 10000.0,
            "stages": [
              {
                "pressure": 4.0,
                "power": 2000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 0.1,
                "height": 0.75,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": true,
                "modulationMacro": 1
              },
              {
                "pressure": 2.0,
                "power": 2000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 0.2,
                "height": 2,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2
              },
              {
                "pressure": 1.0,
                "power": 2000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 0.3,
                "height": 1,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": true,
                "modulationMacro": 3
              },
              {
                "pressure": 2.0,
                "power": 1300,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 2,
                "height": 3,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": true,
                "modulationMacro": 4
              },
              {
                "pressure": 2.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 0.4,
                "height": 4,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 5
              },
              {
                "pressure": 3.0,
                "power": 1400,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.2,
                "height": 1.4,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6
              },
              {
                "pressure": 4.0,
                "power": 1500,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 7
              },
              {
                "pressure": 5.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.3,
                "height": 1.6,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 6.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.5,
                "height": 1.8,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 9
              },
              {
                "pressure": 7.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 10
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": -1.0,
                "height": 1.5,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 9
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": -1.0,
                "height": 1.1,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 0.1,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 7
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.5,
                "height": 1.5,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 5
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 14
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Врезка №1",
            "initial_modulationMacro": 15,
            "initial_power": 1000,
            "initial_focus": 0.5,
            "initial_height": 0.8
          },
          {
            "initial_modulationFrequency_Hz": 10000.0,
            "stages": [
             
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Врезка №2",
            "initial_modulationMacro": 0,
            "initial_power": 1000,
            "initial_focus": 1.0,
            "initial_height": 1.0
          },
          {
            "initial_modulationFrequency_Hz": 10000.0,
            "stages": [
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 1             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Врезка №3",
            "initial_modulationMacro": 0,
            "initial_power": 1000,
            "initial_focus": 1.0,
            "initial_height": 1.0
          },
          {
            "initial_modulationFrequency_Hz": 10000.0,
            "stages": [
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 2             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Врезка №4",
            "initial_modulationMacro": 0,
            "initial_power": 1000,
            "initial_focus": 1.0,
            "initial_height": 1.0
          },
          {
            "initial_modulationFrequency_Hz": 10000.0,
            "stages": [
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 3             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Врезка №5",
            "initial_modulationMacro": 0,
            "initial_power": 1000,
            "initial_focus": 1.0,
            "initial_height": 1.0
          },
          {
            "initial_modulationFrequency_Hz": 10000.0,
            "stages": [
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 4             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Врезка №6",
            "initial_modulationMacro": 0,
            "initial_power": 1000,
            "initial_focus": 1.0,
            "initial_height": 1.0
          },
          {
            "initial_modulationFrequency_Hz": 10000.0,
            "stages": [
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 6             
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Врезка №7",
            "initial_modulationMacro": 0,
            "initial_power": 1000,
            "initial_focus": 1.0,
            "initial_height": 1.0
          },
          {
            "initial_modulationFrequency_Hz": 10000.0,
            "stages": [
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 8
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Врезка №8",
            "initial_modulationMacro": 0,
            "initial_power": 1000,
            "initial_focus": 1.0,
            "initial_height": 1.0
          }
        ],
        "modulationMacros": [
            {
              "pulseFill_percent": 0.0,
              "name": "Режим импульса № 0",
              "pulseFrequency_Hz": 0
            },
            {
              "pulseFill_percent": 7.0,
              "name": "Режим импульса № 1",
              "pulseFrequency_Hz": 67
            },
            {
              "pulseFill_percent": 13.0,
              "name": "Режим импульса № 2",
              "pulseFrequency_Hz": 134
            },
            {
              "pulseFill_percent": 20.0,
              "name": "Режим импульса № 3",
              "pulseFrequency_Hz": 201
            },
            {
              "pulseFill_percent": 27.0,
              "name": "Режим импульса № 4",
              "pulseFrequency_Hz": 268
            },
            {
              "pulseFill_percent": 33.0,
              "name": "Режим импульса № 5",
              "pulseFrequency_Hz": 335
            },
            {
              "pulseFill_percent": 40.0,
              "name": "Режим импульса № 6",
              "pulseFrequency_Hz": 402
            },
            {
              "pulseFill_percent": 47.0,
              "name": "Режим импульса № 7",
              "pulseFrequency_Hz": 469
            },
            {
              "pulseFill_percent": 53.0,
              "name": "Режим импульса № 8",
              "pulseFrequency_Hz": 536
            },
            {
              "pulseFill_percent": 60.0,
              "name": "Режим импульса № 9",
              "pulseFrequency_Hz": 603
            },
            {
              "pulseFill_percent": 67.0,
              "name": "Режим импульса № 10",
              "pulseFrequency_Hz": 670
            },
            {
              "pulseFill_percent": 73.0,
              "name": "Режим импульса № 11",
              "pulseFrequency_Hz": 737
            },
            {
              "pulseFill_percent": 80.0,
              "name": "Режим импульса № 12",
              "pulseFrequency_Hz": 804
            },
            {
              "pulseFill_percent": 87.0,
              "name": "Режим импульса № 13",
              "pulseFrequency_Hz": 871
            },
            {
              "pulseFill_percent": 93.0,
              "name": "Режим импульса № 14",
              "pulseFrequency_Hz": 938
            },
            {
              "pulseFill_percent": 100.0,
              "name": "Режим импульса № 15",
              "pulseFrequency_Hz": 1000
            }          
        ],
        "feeding": {
          "feedLimit_mm_s": 50000
        }
      }
    }
  }`)

  export default cut_settings;