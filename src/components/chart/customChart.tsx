import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import utils from '../../scripts/util';

interface ComponentInt {
	keyInd: number;
	height: number;
}

export const CustomChart: React.FC<ComponentInt> = observer(({ keyInd, height }) => {

	const data = utils.getChartData(keyInd)
	console.log(data)

	return (
		<div className="recharts-responsive-container" style={{ width: '100%', height: '250px', minWidth: '0px' }}>
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
							{ color: '#8884d8', label: 'focus, mm' },
							{ color: '#82ca9d', label: 'height, mm' },
							{ color: '#ff7300', label: 'power, kWt' },
							{ color: '#ffc658', label: 'pressure, bar' },
						].map((item, index) => (
							<li
								key={index}
								className={`recharts-legend-item legend-item-${index}`}
								style={{ display: 'inline-block', marginRight: '10px' }}
							>
								<svg
									aria-label={`${item.label} legend icon`}
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
										d="M0,16h10.666666666666666
                         A5.333333333333333,5.333333333333333,0,1,1,21.333333333333332,16
                         H32M21.333333333333332,16
                         A5.333333333333333,5.333333333333333,0,1,1,10.666666666666666,16"
										className="recharts-legend-icon"
									></path>
								</svg>
								<span
									className="recharts-legend-item-text"
									style={{ color: item.color }}
								>
									{item.label}
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
								Array.from({ length: 6 }).map((_, index) => (
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
										<text
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
											<tspan x="72" dy="0.355em">{index * 20}</tspan>
										</text>
									</g>
								))
							}
						</g>
					</g>
					{
						[
							{ param: 'focus, mm', color: 'red' },
							{ param: 'height, mm', color: 'green' },
							{ param: 'pressure, bar', color: 'blue' },
							{ param: 'power, kWt', color: 'red' }
						].map((p) => {

							return (<g className="recharts-layer recharts-line">
								<g className="recharts-layer recharts-line-dots">
									{data.map((a, index) => {
										const chartWidth = 490;
										const startX = 80;
										const step = chartWidth / (data.length);
										const x = startX + index * step;
										const y = 185 - Number(a[p.param])*1.65

										return (

											<circle
												key={index}
												r="3"
												stroke={ p.color}
												fill="#fff"
												strokeWidth="1"
												height="165"
												width="490"
												cx={x}
												cy={y}
												className="recharts-dot recharts-line-dot"
											/>
										)
									})
									}
								</g>
							</g>
							)
						})

					}


					{/* <g className="recharts-layer recharts-line">
						<path stroke="#8884d8" fill="none" stroke-width="1" height="165" width="490" className="recharts-curve recharts-line-curve" stroke-dasharray="426.5467529296875px 0px" d="M80,37.187C90.889,38.906,101.778,40.625,112.667,40.625C123.556,40.625,134.444,33.75,145.333,33.75C156.222,33.75,167.111,37.187,178,40.625M243.333,20C254.222,25.729,265.111,31.458,276,32.375C286.889,33.292,297.778,33.75,308.667,33.75C319.556,33.75,330.444,32.26,341.333,31.687C352.222,31.115,363.111,30.313,374,30.313C384.889,30.313,395.778,37.76,406.667,40.625C417.556,43.49,428.444,47.5,439.333,47.5C450.222,47.5,461.111,47.5,472,47.5C482.889,47.5,493.778,36.042,504.667,33.75C515.556,31.458,526.444,30.313,537.333,30.313C548.222,30.313,559.111,32.031,570,33.75"></path>
						<g className="recharts-layer recharts-line-dots">
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="80.00000000000003" cy="37.18749999999999" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="112.66666666666669" cy="40.625" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="145.33333333333337" cy="33.749999999999986" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="178.00000000000003" cy="40.625" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="243.33333333333334" cy="20" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="276" cy="32.37499999999999" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="308.6666666666667" cy="33.749999999999986" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="341.33333333333337" cy="31.68749999999998" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="374" cy="30.3125" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="406.66666666666663" cy="40.625" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="439.33333333333337" cy="47.500000000000014" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="472" cy="47.500000000000014" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="504.66666666666663" cy="33.749999999999986" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="537.3333333333334" cy="30.3125" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#8884d8" fill="#fff" stroke-width="1" height="165" width="490" cx="570" cy="33.749999999999986" className="recharts-dot recharts-line-dot"></circle>
						</g>
					</g>
					<g className="recharts-layer recharts-line">
						<path stroke="#82ca9d" fill="none" stroke-width="1" height="165" width="490" className="recharts-curve recharts-line-curve" stroke-dasharray="439.7048645019531px 0px" d="M80,136.495C90.889,136.149,101.778,135.804,112.667,134.422C123.556,133.04,134.444,124.058,145.333,124.058C156.222,124.058,167.111,129.24,178,134.422M243.333,103.329C254.222,115.421,265.111,127.513,276,130.276C286.889,133.04,297.778,134.422,308.667,134.422C319.556,134.422,330.444,129.585,341.333,128.204C352.222,126.822,363.111,126.131,374,126.131C384.889,126.131,395.778,134.422,406.667,134.422C417.556,134.422,428.444,129.24,439.333,129.24C450.222,129.24,461.111,131.831,472,134.422C482.889,137.013,493.778,144.786,504.667,144.786C515.556,144.786,526.444,129.24,537.333,129.24C548.222,129.24,559.111,131.831,570,134.422"></path>
						<g className="recharts-layer recharts-line-dots">
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="80.00000000000003" cy="136.49497487437185" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="112.66666666666669" cy="134.4221105527638" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="145.33333333333337" cy="124.05778894472363" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="178.00000000000003" cy="134.4221105527638" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="243.33333333333334" cy="103.32914572864323" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="276" cy="130.27638190954775" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="308.6666666666667" cy="134.4221105527638" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="341.33333333333337" cy="128.2035175879397" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="374" cy="126.13065326633166" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="406.66666666666663" cy="134.4221105527638" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="439.33333333333337" cy="129.23994974874373" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="472" cy="134.4221105527638" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="504.66666666666663" cy="144.78643216080403" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="537.3333333333334" cy="129.23994974874373" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#82ca9d" fill="#fff" stroke-width="1" height="165" width="490" cx="570" cy="134.4221105527638" className="recharts-dot recharts-line-dot"></circle>
						</g>
					</g>
					<g className="recharts-layer recharts-line">
						<path stroke="#ffc658" fill="none" stroke-width="1" height="165" width="490" className="recharts-curve recharts-line-curve" stroke-dasharray="482.284912109375px 0px" d="M80,97.063C90.889,105.928,101.778,114.792,112.667,120.702C123.556,126.612,134.444,129.567,145.333,132.521C156.222,135.476,167.111,136.954,178,138.431M243.333,132.521C254.222,130.552,265.111,128.582,276,126.612C286.889,124.642,297.778,122.672,308.667,120.702C319.556,118.732,330.444,116.762,341.333,114.792C352.222,112.822,363.111,110.852,374,108.883C384.889,106.913,395.778,104.943,406.667,102.973C417.556,101.003,428.444,97.063,439.333,97.063C450.222,97.063,461.111,97.063,472,97.063C482.889,97.063,493.778,143.75,504.667,143.75C515.556,143.75,526.444,97.063,537.333,97.063C548.222,97.063,559.111,97.063,570,97.063"></path>
						<g className="recharts-layer recharts-line-dots">
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="80.00000000000003" cy="97.06303724928367" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="112.66666666666669" cy="120.70200573065904" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="145.33333333333337" cy="132.52148997134668" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="178.00000000000003" cy="138.43123209169053" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="243.33333333333334" cy="132.52148997134668" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="276" cy="126.61174785100287" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="308.6666666666667" cy="120.70200573065904" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="341.33333333333337" cy="114.79226361031519" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="374" cy="108.88252148997135" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="406.66666666666663" cy="102.9727793696275" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="439.33333333333337" cy="97.06303724928367" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="472" cy="97.06303724928367" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="504.66666666666663" cy="143.75" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="537.3333333333334" cy="97.06303724928367" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ffc658" fill="#fff" stroke-width="1" height="165" width="490" cx="570" cy="97.06303724928367" className="recharts-dot recharts-line-dot"></circle>
						</g>
					</g>
					<g className="recharts-layer recharts-line">
						<path stroke="#ff7300" fill="none" stroke-width="1" height="165" width="490" className="recharts-curve recharts-line-curve" stroke-dasharray="415.7308654785156px 0px" d="M80,141.708C90.889,140.677,101.778,139.645,112.667,139.645C123.556,139.645,134.444,139.645,145.333,139.645C156.222,139.645,167.111,139.645,178,139.645M243.333,141.708C254.222,141.364,265.111,141.02,276,140.883C286.889,140.745,297.778,140.677,308.667,140.677C319.556,140.677,330.444,141.708,341.333,141.708C352.222,141.708,363.111,141.708,374,141.708C384.889,141.708,395.778,141.708,406.667,141.708C417.556,141.708,428.444,141.708,439.333,141.708C450.222,141.708,461.111,141.708,472,141.708C482.889,141.708,493.778,141.708,504.667,141.708C515.556,141.708,526.444,141.708,537.333,141.708C548.222,141.708,559.111,141.708,570,141.708"></path>
						<g className="recharts-layer recharts-line-dots">
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="80.00000000000003" cy="141.7079207920792" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="112.66666666666669" cy="139.64521452145215" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="145.33333333333337" cy="139.64521452145215" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="178.00000000000003" cy="139.64521452145215" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="243.33333333333334" cy="141.7079207920792" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="276" cy="140.8828382838284" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="308.6666666666667" cy="140.67656765676566" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="341.33333333333337" cy="141.7079207920792" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="374" cy="141.7079207920792" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="406.66666666666663" cy="141.7079207920792" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="439.33333333333337" cy="141.7079207920792" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="472" cy="141.7079207920792" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="504.66666666666663" cy="141.7079207920792" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="537.3333333333334" cy="141.7079207920792" className="recharts-dot recharts-line-dot"></circle>
							<circle r="3" stroke="#ff7300" fill="#fff" stroke-width="1" height="165" width="490" cx="570" cy="141.7079207920792" className="recharts-dot recharts-line-dot"></circle>
						</g>
					</g> */}
				</svg>
			</div>
		</div>

	)


});


export default CustomChart;
