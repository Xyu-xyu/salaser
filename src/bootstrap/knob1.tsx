import React from 'react';
import { Knob, Arc, Pointer, Value } from 'rc-knob';
import styled from 'styled-components';

// Цвета, можете заменить на свои
const colors = {
  secondary: '#00BFFF', // Пример цвета
};

const StyledKnobWrapper = styled.div`
  .value {
    fill: #FC5A96;
    font-size: 16px;
    font-weight: bold;
    text-anchor: middle;
  }
`;

interface CustomKnobProps {
  value: number;
  onChange: (value: number) => void;
}

const CustomKnob: React.FC<CustomKnobProps> = ({ value, onChange }) => {
  return (
    <StyledKnobWrapper>
      <Knob
        size={100}
        angleOffset={220}
        angleRange={280}
        min={0}
        max={100}
        value={value}
        onChange={onChange}
      >
        <Arc arcWidth={5} color="#FC5A96" radius={47.5} />
        <Pointer width={5} radius={40} type="circle" color={colors.secondary} />
        <Value marginBottom={40} className="value" />
      </Knob>
    </StyledKnobWrapper>
  );
};

export default CustomKnob;
