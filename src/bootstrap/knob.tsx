import { Component } from 'react';
import { Knob, Pointer, Value, Scale, Arc } from 'rc-knob';
import styled from 'styled-components';

interface MyKnobProps {
  value?: number;
  size?: number;
}

interface MyKnobState {
  value: number;
  size: number;
  radius: string;
  fontSize: number;
}

const Styles = styled.div<{ fontSize: number }>`
  .vpotText {
    fill: green;
    font-size: 50px;
  }
`;

class MyKnob extends Component<MyKnobProps, MyKnobState> {
  static defaultProps = {
    value: 50,
    size: 200,
  };

  constructor(props: MyKnobProps) {
    super(props);
    this.state = {
      value: props.value || 50,
      size: props.size || 200,
      radius: ((props.value || 100) / 2).toString(),
      fontSize: (props.size || 200) * 0.2,
    };
  }

  render() {
    const { value, size, fontSize } = this.state;

    return (
      <Styles fontSize={fontSize}>
        <Knob
          size={size}
          angleOffset={220}
          angleRange={280}
          steps={10}
          min={0}
          max={100}
          value={value}
          onChange={(val: number) => this.setState({ value: val })}
        >
          <Scale
            steps={10}
            tickWidth={1}
            tickHeight={2}
            radius={(size / 2) * 0.84}
            color="grey"
          />
          {/*           <Arc
            arcWidth={2}
            color="#4eccff"
            background="#141a1e"
            radius={(size / 2) * 0.76}
          />
 */}
          <defs>
            {/* Градиенты можно вставить здесь при необходимости */}
          </defs>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size / 2) * 0.8}
            fill="url(#grad-dial-soft-shadow)"
          />
          <ellipse
            cx={size / 2}
            cy={size / 2 + 2}
            rx={(size / 2) * 0.7}
            ry={(size / 2) * 0.7}
            fill="#141a1e"
            opacity="0.15"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size / 2) * 0.7}
            fill="url(#grad-dial-base)"
            stroke="#242a2e"
            strokeWidth={1.5}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size / 2) * 0.64}
            fill="transparent"
            stroke="url(#grad-dial-highlight)"
            strokeWidth={1.5}
          />
          <Pointer
            width={(size / 2) * 0.05}
            radius={(size / 2) * 0.47}
            type="circle"
            color="#4eccff"
          />
          <Value
            marginBottom={(size - fontSize / 2) / 2}
            className="vpotText"
          />
        </Knob>
      </Styles>
    );
  }
}

export default MyKnob;
