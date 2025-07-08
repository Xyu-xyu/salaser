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
import { observer } from 'mobx-react-lite';


interface ComponentInt {
	keyInd: number;
	height: number;
}



export const SwiperPiercingMacroCharts: React.FC<ComponentInt> = observer(({ keyInd, height }) => {

	const data = utils.getChartData(keyInd)

	return (
		<div>
			<div className='d-flex flex-column mt-4'>
 				<ResponsiveContainer width="100%" height={height}>
					<LineChart
						data={data}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" tick={{ fontSize: 12, fill: '#333' }}/>
						<YAxis tick={{ fontSize: 12, fill: '#333' }} />
						<Tooltip wrapperStyle={{ fontSize: 16, padding: 2, margin: 0 }}/>
						<Legend wrapperStyle={{ fontSize: 20, marginLeft: 25 }} />
						<Line type="monotone" dataKey="focus, mm" stroke="#8884d8" activeDot={{ r: 8 }}/>
						<Line type="monotone" dataKey="height, mm" stroke="#82ca9d" activeDot={{ r: 8 }}/>
						<Line type="monotone" dataKey="pressure, bar" stroke="#ffc658" activeDot={{ r: 8 }}/>
						<Line type="monotone" dataKey="power, kWt" stroke="#ff7300" activeDot={{ r: 8 }}/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>

	);
});
