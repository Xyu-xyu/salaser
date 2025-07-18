const SvgDefs = () => (
	<svg width="0" height="0" style={{ position: 'absolute' }}>
		<defs>
			<linearGradient id="circleGradient" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#fff" />
				<stop offset="100%" stopColor="#ccc" />
			</linearGradient>
			<clipPath id="recharts1-clip">
				<rect x="80" y="20" height="165" width="490"></rect>
			</clipPath>
		</defs>
	</svg>
);

export default SvgDefs;
