import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface IDataPoint {
  name: number;
  value: number;
}

const data: IDataPoint[] = [
  { name: 0, value: 200 },
  { name: 1, value: 400 },
  { name: 2, value: 300 },
  { name: 3, value: 500 },
  { name: 4, value: 200 },
];

export const SwiperPiercingMacroCharts: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" type="number" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="linear"
          dataKey="value"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}          // включает анимацию
         /*  animationDuration={1000}          // длительность в мс
          animationEasing="linear"   */        // делает анимацию равномерной
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
