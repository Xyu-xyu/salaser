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
import utils from '../scripts/util';


interface ComponentInt {
    keyInd: number;
}



export const SwiperPiercingMacroCharts: React.FC<ComponentInt> = ({ keyInd }) => {

	const data  = utils.getChartData( keyInd )	 

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
							<Line type="monotone" dataKey="pressure" stroke="#82ca9d" fill="#82ca9d" />
						</LineChart>
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
