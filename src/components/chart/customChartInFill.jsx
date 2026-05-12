import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import macrosStore from '../../store/macrosStore';


export const CustomChartinFill = observer(({}) => {

	const data = macrosStore.getTecnologyValue("fillCurve", "macros")||[]
	const {t} = useTranslation()
	const chartWidth = 280;
	const chartHeight = 200;

	const GRAPH = {
		left: 35,
		top: 20,
		right: 235,
		bottom: 165,
	};

	const width = GRAPH.right - GRAPH.left;   // 200
	const height = GRAPH.bottom - GRAPH.top;  // 145

	const maxX = 50000; // speed_mm_s
	const maxY = 100;   // fill_percent
	
	const toX = (value) => GRAPH.left + (value / maxX) * width;
	const toY = (value) =>	GRAPH.bottom - (value / maxY) * height;

 


	return (
		<div className="recharts-responsive-container" style={{ 
				width: chartWidth+'px', 
				height: chartHeight+'px', 
				minWidth: '0px', 
				transition: 'none' 
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
						width: chartWidth+'px',
						height: 'auto',
						left: '20px',
						bottom: '5px',
						fontSize: '20px',
						marginLeft: '25px',
					}}
				>
				</div>

				<svg role="application" className="recharts-surface" width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%' }}>
					<rect 
						x="0" 
						y="0" 
						width={chartWidth} 
						height={chartHeight} 
						stroke="var(--grey-nav)"
						strokeWidth={1}
						fill="#fff"
						rx="15" 
					/>


					{/* вертикальные линии */}
					{[1, 2, 3, 4, 5].map((i) => {
						const stepX = 200 / 5; // ширина области / количество секций
						const x = 35 + stepX * i;

						return (
						<line
							key={`v-${i}`}
							x1={x}
							y1={20}
							x2={x}
							y2={165}
							stroke="#999"
							strokeWidth={0.3}
							strokeDasharray="3 3"
						/>
						);
					})}

					{/* горизонтальные линии */}
					{[1, 2, 3, 4].map((i) => {
						const stepY = 145 / 5; // высота области / количество секций
						const y = 165 - stepY * i;

						return (
						<line
							key={`h-${i}`}
							x1={35}
							y1={y}
							x2={235}
							y2={y}
							stroke="#999"
							strokeWidth={0.3}
							strokeDasharray="3 3"
						/>
						);
					})}
					<text orientation="left" 
						stroke="none" 
						font-size="10" 
						className="recharts-text recharts-cartesian-axis-tick-value" textAnchor="end" fill="#333">
							<tspan x="30" y="25">100%</tspan>
					</text>
					
					<text orientation="left" 
						stroke="none" 
						font-size="10" 
						className="recharts-text recharts-cartesian-axis-tick-value" textAnchor="end" fill="#333">
						<tspan x="30" y="180">0</tspan>
					</text>

					<text orientation="left" 
						stroke="none" 
						font-size="10" 
						className="recharts-text recharts-cartesian-axis-tick-value" textAnchor="end" fill="#333">
						<tspan x="250" y="180">50000</tspan>
					</text>

					<line
						stroke="black"
						fill="none"
						x1={35}
						y1={20}
						x2={35}
						y2={165}
						strokeWidth={0.2}
					/>

					<line
						stroke="black"
						fill="none"
						x1={235}
						y1={165}
						x2={35}
						y2={165}
						strokeWidth={0.2}
					/>

					{
						data.map((a,i)=>{

							let x = toX(a.speed_mm_s)
							let y = toY(a.fill_percent)

							return(
								<g onMouseDown={ ()=>{}} 
									key={i}>
									<circle
										r={5}
										stroke={'black'}
										fill={'orangered'}
										strokeWidth="1"
										cx={x}
										cy={y}
										className={`recharts-dot recharts-line-dot dot-glow`}
									/>
								</g>
							)

						})
					}
					
				</svg>
		</div>
	)
});


export default CustomChartinFill;