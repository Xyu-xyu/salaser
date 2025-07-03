import React from 'react';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	AreaChart,
	Area,
	ResponsiveContainer,
} from 'recharts';

// Типизация одной точки данных
interface IDataPoint {
	name: string;
	focus: number;
	height: number;
	pressure: number;
	power: number;

}

const data: IDataPoint[] = [
	{ name: '0', focus: 4000, height: 2400, pressure: 2400, power: 1100 },
	{ name: '1', focus: 3000, height: 1398, pressure: 2210, power: 1000 },
	{ name: '2', focus: 2000, height: 9800, pressure: 2290, power: 1000 },
	{ name: '3', focus: 2780, height: 3908, pressure: 2000, power: 1200 },
	{ name: '4', focus: 1890, height: 4800, pressure: 2181, power: 1000 },
	{ name: '5', focus: 2390, height: 3800, pressure: 2500, power: 1000 },
	{ name: '6', focus: 3490, height: 4300, pressure: 2100, power: 1200 },
	{ name: '7', focus: 5120, height: 3200, pressure: 4500, power: 1000 },
	{ name: '8', focus: 1800, height: 6700, pressure: 1200, power: 1000 },
	{ name: '9', focus: 6500, height: 2700, pressure: 3300, power: 1000 },
	{ name: '10', focus: 7200, height: 8300, pressure: 5400, power: 1000 },
	{ name: '11', focus: 1100, height: 900, pressure: 1300, power: 1000 },
	{ name: '12', focus: 9400, height: 1500, pressure: 8700, power: 1000 },
	{ name: '13', focus: 300, height: 7800, pressure: 6200, power: 1000 },
	{ name: '14', focus: 4600, height: 5100, pressure: 4900, power: 1000 },
	{ name: '15', focus: 8700, height: 2900, pressure: 7700, power: 1000 },
];


export const SwiperPiercingMacroCharts: React.FC = () => {
	return (
		<div>
			<div className='d-flex flex-column mt-4'>
				<div className='d-flex'>
					{/* Первый график */}
					<ResponsiveContainer width="50%" height={200}>
						<LineChart
							data={data}
							syncId="anyId"
							margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="name"
								tick={{ fontSize: 10, fill: '#333' }} // регулируем шрифт и цвет
							/>
							<YAxis
								tick={{ fontSize: 10, fill: '#333' }} // регулируем шрифт и цвет
							/>
							<Tooltip wrapperStyle={{ fontSize: 20 }} />
							<Legend wrapperStyle={{ fontSize: 20 }} />
							<Line type="monotone" dataKey="focus" stroke="#8884d8" fill="#8884d8" />
						</LineChart>
					</ResponsiveContainer>


					{/* Второй график с Brush */}
					<ResponsiveContainer width="50%" height={200}>
						<LineChart
							data={data}
							syncId="anyId"
							margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								tick={{ fontSize: 10, fill: '#333' }} // регулируем шрифт и цвет
							/>
							<YAxis
								tick={{ fontSize: 10, fill: '#333' }} // регулируем шрифт и цвет
							/>
							<Tooltip wrapperStyle={{ fontSize: 20 }} />
							<Legend wrapperStyle={{ fontSize: 20 }} />
							<Line type="monotone" dataKey="height" stroke="#82ca9d" fill="#82ca9d" />
						</LineChart>
					</ResponsiveContainer>
				</div>


				<div className='d-flex'>
					{/* Третий график - AreaChart */}
					<ResponsiveContainer width="50%" height={200}>
						<AreaChart
							data={data}
							syncId="anyId"
							margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="name"
								tick={{ fontSize: 10, fill: '#333' }} // регулируем шрифт и цвет
							/>
							<YAxis
								tick={{ fontSize: 10, fill: '#333' }} // регулируем шрифт и цвет
							/>
							<Tooltip wrapperStyle={{ fontSize: 20 }} />
							<Legend wrapperStyle={{ fontSize: 20 }} />
							<Area type="monotone" dataKey="pressure" stroke="#82ca9d" fill="#82ca9d" />
						</AreaChart>
					</ResponsiveContainer>

					<ResponsiveContainer width="50%" height={200}>
						<LineChart
							data={data}
							syncId="anyId"
							margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="name"
								tick={{ fontSize: 10, fill: '#333' }} // регулируем шрифт и цвет
							/>
							<YAxis
								tick={{ fontSize: 10, fill: '#333' }} // регулируем шрифт и цвет
							/>
							<Tooltip wrapperStyle={{ fontSize: 20 }} />
							<Legend wrapperStyle={{ fontSize: 20 }} />
							<Line type="monotone" dataKey="power" stroke="#8884d8" fill="#8884d8" />
						</LineChart>
					</ResponsiveContainer>
				</div>

			</div>

		</div>

	);
};
