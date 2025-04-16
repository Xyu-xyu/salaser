declare module 'rc-knob' {
    import * as React from 'react';
  
    export interface KnobProps {
      size: number;
      angleOffset?: number;
      angleRange?: number;
      steps?: number;
      min?: number;
      max?: number;
      value: number;
      onChange: (value: number) => void;
      children?: React.ReactNode;
    }
  
    export interface PointerProps {
      width: number;
      radius: number;
      type?: 'circle' | 'rect';
      color?: string;
    }
  
    export interface ArcProps {
      arcWidth: number;
      radius: number;
      color?: string;
      background?: string;
    }
  
    export interface ScaleProps {
      steps: number;
      tickWidth: number;
      tickHeight: number;
      radius: number;
      color?: string;
    }
  
    export interface ValueProps {
      marginBottom?: number;
      className?: string;
    }
  
    export const Knob: React.FC<KnobProps>;
    export const Pointer: React.FC<PointerProps>;
    export const Arc: React.FC<ArcProps>;
    export const Scale: React.FC<ScaleProps>;
    export const Value: React.FC<ValueProps>;
  }
  