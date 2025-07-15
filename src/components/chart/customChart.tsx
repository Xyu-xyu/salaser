import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import utils from '../../scripts/util';
import viewStore from '../../store/viewStore';

interface ComponentInt {
	keyInd: number;
	height: number;
}

export const CustomChart: React.FC<ComponentInt> = observer(({ keyInd, height }) => {

	const data = utils.getChartData(keyInd)
	const {t} = useTranslation()
	const getPath = (key: string): string => {
		let res = 'M';

		const chartWidth = 490;
		const startX = 80;
		const step = chartWidth / data.length;

		data.forEach((a, index) => {
			const x = startX + index * step;
			if (a['enabled'] || index === 0) {
				// Безопасное извлечение и преобразование значения
				const raw = a.hasOwnProperty(key) ? a[key] : 0;
				const num = Number(raw);
				const y = 185 - (isNaN(num) ? 0 : num * 1.5);
				res += `${x} ${y} `;
			}

		});

		return res.trim();
	};

	const showToolTip = (index:number) =>{
		console.log ("Show tooltip for step: " + index)
		viewStore.setselectedPiercingStage(index)
	}

	const { selectedPiercingStage } =viewStore

	return (
		<div className="recharts-responsive-container" style={{ width: '100%', height: '250px', minWidth: '0px', transition: 'none' }}>
			<div
				className="recharts-wrapper"
				role="application"
				style={{
					position: 'relative',
					cursor: 'default',
					width: '100%',
					height: '100%',
					maxHeight: '250px',
					maxWidth: '600px',
				}}
			>
				<div
					className="recharts-tooltip-wrapper"
					tabIndex={-1}
					style={{
						visibility: 'hidden',
						pointerEvents: 'none',
						position: 'absolute',
						top: 0,
						left: 0,
						fontSize: 16,
						padding: 2,
						margin: 0,
					}}
				>
					<div
						className="recharts-default-tooltip"
						role="status"
						aria-live="assertive"
						style={{
							margin: 0,
							padding: 10,
							backgroundColor: 'rgb(255, 255, 255)',
							border: '1px solid rgb(204, 204, 204)',
							whiteSpace: 'nowrap',
						}}
					>
						<p className="recharts-tooltip-label" style={{ margin: 0 }}></p>
					</div>
				</div>

				<div
					className="recharts-legend-wrapper"
					style={{
						position: 'absolute',
						width: '550px',
						height: 'auto',
						left: '20px',
						bottom: '5px',
						fontSize: '20px',
						marginLeft: '25px',
					}}
				>
					<ul
						className="recharts-default-legend"
						style={{
							padding: 0,
							margin: 0,
							textAlign: 'center',
						}}
					>
						{[
							{ color: '#8884d8', param: 'focus, mm' },
							{ color: '#82ca9d', param: 'height, mm' },
							{ color: '#ff7300', param: 'power, kWt' },
							{ color: '#ffc658', param: 'pressure, bar' },
						].map((item, index) => (
							<li
								key={index}
								className={`recharts-legend-item legend-item-${index}`}
								style={{ display: 'inline-block', marginRight: '10px' }}
							>
								<svg
									aria-label={`${item.param} legend icon`}
									className="recharts-surface"
									width="14"
									height="14"
									viewBox="0 0 32 32"
									style={{
										display: 'inline-block',
										verticalAlign: 'middle',
										marginRight: '4px',
									}}
								>
									<title></title>
									<desc></desc>
									<path
										strokeWidth="4"
										fill="none"
										stroke={item.color}
										d="M0,16h10.666666666666666   A5.333333333333333,5.333333333333333,0,1,1,21.333333333333332,16                   H32M21.333333333333332,16  A5.333333333333333,5.333333333333333,0,1,1,10.666666666666666,16"
										className="recharts-legend-icon"
									></path>
								</svg>
								<span
									className="recharts-legend-item-text"
									style={{ color: item.color }}
								>
									{ t(item.param)}
								</span>
							</li>
						))}
					</ul>
				</div>

				<svg role="application" className="recharts-surface" width="600" height="250" viewBox="0 0 600 250" style={{ width: '100%', height: '100%' }}>
					<title></title>
					<desc></desc>
					<defs>
						<clipPath id="recharts1-clip">
							<rect x="80" y="20" height="165" width="490"></rect>
						</clipPath>
					</defs>
					<g className="recharts-cartesian-grid">
						<g className="recharts-cartesian-grid-horizontal">
							{
								Array.from({ length: 6 }).map((_, index) => {
									const y = 185 - index * 30;

									return (
										<line
											key={index}
											strokeDasharray="3 3"
											stroke="#ccc"
											fill="none"
											x="80"
											y="20"
											width="490"
											height="165"
											x1="80"
											y1={y}
											x2="570"
											y2={y}
										/>
									);
								})
							}


						</g>
						<g className="recharts-cartesian-grid-vertical">
							{
								Array.from({ length: data.length }).map((_, index) => {
									const chartWidth = 490;
									const startX = 80;
									const step = chartWidth / (data.length);
									const x = startX + index * step;

									return (
										<line
											key={index}
											strokeDasharray="3 3"
											stroke="#ccc"
											fill="none"
											x="80"
											y="20"
											width="490"
											height="165"
											x1={x}
											y1={20}
											x2={x}
											y2={185}
										/>
									);
								})
							}

						</g>
					</g>
					<g className="recharts-layer recharts-cartesian-axis recharts-xAxis xAxis">
						<line height="30" orientation="bottom" x="80" y="185" width="490" className="recharts-cartesian-axis-line" stroke="#666" fill="none" x1="80" y1="185" x2="570" y2="185"></line>
						<g className="recharts-cartesian-axis-ticks">
							{Array.from({ length: data.length }).map((_, i) => {
								const startX = 80;
								const totalWidth = 490;
								const count = data.length;
								const step = totalWidth / count;
								const x = startX + step * i;

								return (
									<g className="recharts-layer recharts-cartesian-axis-tick" key={i}>
										<line
											height="30"
											orientation="bottom"
											x="80"
											y="185"
											width="490"
											className="recharts-cartesian-axis-tick-line"
											stroke="#666"
											fill="none"
											x1={x}
											y1="191"
											x2={x}
											y2="185"
										/>
										<text
											height="30"
											orientation="bottom"
											width="490"
											stroke="none"
											fontSize="12"
											x={x}
											y="193"
											className="recharts-text recharts-cartesian-axis-tick-value"
											textAnchor="middle"
											fill="#333"
										>
											<tspan x={x} dy="0.71em">{i}</tspan>
										</text>
									</g>
								);
							})}

						</g>
					</g>
					<g className="recharts-layer recharts-cartesian-axis recharts-yAxis yAxis">
						<line orientation="left" width="60" x="20" y="20" height="165" className="recharts-cartesian-axis-line" stroke="#666" fill="none" x1="80" y1="20" x2="80" y2="185"></line>
						<g className="recharts-cartesian-axis-ticks">
							{
								Array.from({ length: 6 }).map((_, index, arr) => (
									<g key={index} className="recharts-layer recharts-cartesian-axis-tick">
										<line
											orientation="left"
											width="60"
											x="20"
											y="20"
											height="165"
											className="recharts-cartesian-axis-tick-line"
											stroke="#666"
											fill="none"
											x1="74"
											y1={185 - index * 30}
											x2="80"
											y2={185 - index * 30}
										/>
										{(index == 0 || index=== arr.length-1) && <text
											orientation="left"
											width="60"
											height="165"
											stroke="none"
											fontSize="12"
											x="72"
											y={185 - index * 30}
											className="recharts-text recharts-cartesian-axis-tick-value"
											textAnchor="end"
											fill="#333"
										>
											<tspan x="72" dy="0.355em">{index ===0 ? "min" : 'max'}</tspan>
										</text> }
									</g>
								))
							}
						</g>
					</g>
					{
						[
							{ color: '#8884d8', param: 'focus, mm' },
							{ color: '#82ca9d', param: 'height, mm' },
							{ color: '#ff7300', param: 'power, kWt' },
							{ color: '#ffc658', param: 'pressure, bar' }
						].map((p, i) => {

							return (
							<g className="recharts-layer recharts-line"	key={"recharts-layer_recharts-line"+i}>
								<g className="recharts-layer recharts-line-dots">
									{data.map((a, index) => {
										const chartWidth = 490;
										const startX = 80;
										const step = chartWidth / (data.length);
										const x = startX + index * step;
										const y = 185 - Number(a[p.param]) * 1.5
										return (
											<g key={'layerback'+index} onMouseDown={ ()=>{ showToolTip(index) } }>
												 {i === 0 && <rect 
												 	x={x-15 < 79 ? 80 :x-15} 
													y="35"
        											width={ x-15 < 79 ? 15 : 30}
													height="155"
													stroke='transparent'
													fill='transparent'
													className='transparentBack' 
												/>}
												 
											</g>
										)
									})
									}
								</g>
								<path
									stroke={p.color}
									fill="none"
									strokeWidth="1"
									height="165" width="490"
									className="recharts-curve recharts-line-curve"
									d={getPath(p.param)}>

								</path>
								<g className="recharts-layer recharts-line-dots">
									{data.map((a, index) => {
										const chartWidth = 490;
										const startX = 80;
										const step = chartWidth / (data.length);
										const x = startX + index * step;
										const y = 185 - Number(a[p.param]) * 1.5
										return (
											<g onMouseDown={ ()=>{ showToolTip(index) } } key={Math.random()}>
												<circle
													key={10+index}
													r="5"
													stroke={p.color}
													fill={selectedPiercingStage === index ? p.color : '#fff'}
													strokeWidth="1"
													height="165"
													width="490"
													cx={x}
													cy={y}
													className="recharts-dot recharts-line-dot"
												/>
											</g>
										)
									})
									}
								</g>
							</g>
							)
						})
					}
				</svg>
			</div>
		</div>
	)
});


export default CustomChart;