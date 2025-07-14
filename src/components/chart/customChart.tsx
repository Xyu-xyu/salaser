import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import utils from '../../scripts/util';

interface ComponentInt {
	keyInd: number;
	height: number;
}

export const CustomChart: React.FC<ComponentInt> = observer(({ keyInd, height }) => {

	const data = utils.getChartData(keyInd)
	console.log(data + ' ' + height)

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
							{ param: 'focus, mm', color: '#8884d8' },
							{ param: 'height, mm', color: '#82ca9d' },
							{ param: 'pressure, bar', color: '#ffc658' },
							{ param: 'power, kWt', color: '#ff7300' }
						].map((p) => {

							return (<g className="recharts-layer recharts-line">
								<path
									stroke={p.color}
									fill="none"
									stroke-width="1"
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

											<circle
												key={index}
												r="3"
												stroke={p.color}
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
				</svg>
			</div>
		</div>

	)


});


export default CustomChart;


{
	<div xmlns="http://www.w3.org/1999/xhtml" tabindex="-1"
	class="recharts-tooltip-wrapper recharts-tooltip-wrapper-left recharts-tooltip-wrapper-top"
	style="visibility: visible; pointer-events: none; position: absolute; top: 0px; left: 0px; font-size: 16px; padding: 2px; margin: 0px; transition: transform 400ms ease 0s; transform: translate(80px, 20px);">
	<div class="recharts-default-tooltip" role="status" aria-live="assertive"
		style="margin: 0px; padding: 10px; background-color: rgb(255, 255, 255); border: 1px solid rgb(204, 204, 204); white-space: nowrap;">
		<p class="recharts-tooltip-label" style="margin: 0px;">5</p>
		<ul class="recharts-tooltip-item-list" style="padding: 0px; margin: 0px;">
			<li class="recharts-tooltip-item"
				style="display: block; padding-top: 4px; padding-bottom: 4px; color: rgb(136, 132, 216);"><span
					class="recharts-tooltip-item-name">focus, mm</span><span class="recharts-tooltip-item-separator"> :
				</span><span class="recharts-tooltip-item-value">60</span><span
					class="recharts-tooltip-item-unit"></span></li>
			<li class="recharts-tooltip-item"
				style="display: block; padding-top: 4px; padding-bottom: 4px; color: rgb(130, 202, 157);">
				<span class="recharts-tooltip-item-name">height, mm</span>
				<span class="recharts-tooltip-item-separator"> : </span>
				<span class="recharts-tooltip-item-value">19.597989949748744</span>
				<span class="recharts-tooltip-item-unit"></span>
			</li>
			<li class="recharts-tooltip-item"
				style="display: block; padding-top: 4px; padding-bottom: 4px; color: rgb(255, 115, 0);">
				<span class="recharts-tooltip-item-name">power, kWt</span>
				<span class="recharts-tooltip-item-separator"> : </span>
				<span class="recharts-tooltip-item-value">0.9900990099009901</span><span
					class="recharts-tooltip-item-unit"></span>
			</li>
			<li class="recharts-tooltip-item"
				style="display: block; padding-top: 4px; padding-bottom: 4px; color: rgb(255, 198, 88);">
				<span class="recharts-tooltip-item-name">pressure, bar</span>
				<span class="recharts-tooltip-item-separator"> : </span>
				<span class="recharts-tooltip-item-value">5.444126074498568</span>
				<span class="recharts-tooltip-item-unit"></span>
			</li>
		</ul>
	</div>
</div>
}