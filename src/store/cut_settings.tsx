export interface Root {
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
  }
  
const cut_settings= {
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
              "enabled": false,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "CW",
              "modulationMacro": 0,
              "height": 2.0,
              "modulationFrequency_Hz": 20000.0
            }
          },
          {
            "piercingMacro": 0,
            "cutting": {
              "pressure": 9.0,
              "power_W_mm": 20000.0,
              "gas": "O2",
              "focus": 10.0,
              "enabled": false,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "CW",
              "modulationMacro": 15,
              "height": 1.9,
              "modulationFrequency_Hz": 40000.0
            }
          },
          {
            "piercingMacro": 0,
            "cutting": {
              "pressure": 10.0,
              "power_W_mm": 30000.0,
              "gas": "N2",
              "focus": -11.0,
              "enabled": false,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "CW",
              "modulationMacro": 1,
              "height": 1.9,
              "modulationFrequency_Hz": 50000.0
            }
          },
          {
            "piercingMacro": 0,
            "cutting": {
              "pressure": 11.0,
              "power_W_mm": 40000.0,
              "gas": "AIR",
              "focus": 9.0,
              "enabled": false,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "CW",
              "modulationMacro": 15,
              "height": 1.0,
              "modulationFrequency_Hz": 60000.0
            }
          },
          {
            "piercingMacro": 0,
            "cutting": {
              "pressure": 12.0,
              "power_W_mm": 50000.0,
              "gas": "AIR",
              "focus": -14.0,
              "enabled": false,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "CW",
              "modulationMacro": 2,
              "height": 1.5,
              "modulationFrequency_Hz": 70000.0
            }
          },
          {
            "piercingMacro": 0,
            "cutting": {
              "pressure": 13.0,
              "power_W_mm": 60000.0,
              "gas": "AIR",
              "focus": 15.0,
              "enabled": false,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "CW",
              "modulationMacro": 13,
              "height": 1.4,
              "modulationFrequency_Hz": 80000.0
            }
          },
          {
            "piercingMacro": 0,
            "cutting": {
              "pressure": 14.0,
              "power_W_mm": 70000.0,
              "gas": "AIR",
              "focus": -1.0,
              "enabled": false,
              "feedLimit_mm_s": 50000,
              "cross_blow": false,
              "type": "CW",
              "modulationMacro": 3,
              "height": 0.1,
              "modulationFrequency_Hz": 90000.0
            }
          },
          {
            "piercingMacro": 0,
            "cutting": {
              "pressure": 15.0,
              "power_W_mm": 100000.0,
              "gas": "O2",
              "focus": 0,
              "enabled": false,
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
                "pressure": .0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Unknown incut",
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
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Unknown incut",
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
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Unknown incut",
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
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Unknown incut",
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
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Unknown incut",
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
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Unknown incut",
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
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Unknown incut",
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
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              },
              {
                "pressure": 8.0,
                "power": 1000,
                "enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                "cross_blow": false,
                "modulationMacro": 0
              }
            ],
            "initial_cross_blow": false,
            "initial_pressure": 8.0,
            "gas": "AIR",
            "name": "Unknown incut",
            "initial_modulationMacro": 0,
            "initial_power": 1000,
            "initial_focus": 1.0,
            "initial_height": 1.0
          }
        ],
        "modulationMacros": [
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          },
          {
            "pulseFill_percent": 50.0,
            "name": "Unknown modulation macro",
            "pulseFrequency_Hz": 0
          }
        ],
        "feeding": {
          "feedLimit_mm_s": 50000
        }
      }
    }
  }

  export default cut_settings;