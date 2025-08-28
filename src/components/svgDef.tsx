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
			<linearGradient id="color-0" /* bx: pinned="true" */>
				<stop style={{ stopColor: "rgb(72, 70, 70)" }} offset={0} />
				<stop offset="0.48" style={{ stopColor: "rgb(241, 243, 244)" }} />
				<stop style={{ stopColor: "rgb(131, 131, 131)" }} offset={1} />
			</linearGradient>
			<linearGradient
				id="color-0-0"
				gradientUnits="userSpaceOnUse"
				x1={75}
				y1="2.79"
				x2={75}
				y2="79.078"
				gradientTransform="matrix(-0.01421, 1.046308, -0.89029, -0.013239, 112.669792, -40.818367)"
				xlinkHref="#color-0"
			/>
			<linearGradient
				id="color-0-1"
				gradientUnits="userSpaceOnUse"
				x1={75}
				y1="2.79"
				x2={75}
				y2="79.078"
				gradientTransform="matrix(-0.010891, 0.822704, -0.682279, -0.010409, 103.546577, 45.456978)"
				xlinkHref="#color-0"
			/>
			<linearGradient id="color-1"/*  pinned="true" */>
				<stop style={{ stopColor: "rgb(255, 0, 30)" }} offset={0} />
				<stop offset="0.107" style={{ stopColor: "rgba(255, 0, 25, 0.89)" }} />
				<stop style={{ stopColor: "rgba(255, 26, 0, 0.61)" }} offset={1} />
			</linearGradient>
			<linearGradient
				id="color-1-0"
				gradientUnits="userSpaceOnUse"
				x1={75}
				y1={0}
				x2={75}
				y2={195}
				gradientTransform="matrix(-0.999994, -0.003973, 0.003301, -1.189324, 149.999603, 232.909463)"
				xlinkHref="#color-1"
			/>
			<linearGradient
				id="color-0-2"
				gradientUnits="userSpaceOnUse"
				x1={75}
				y1="2.79"
				x2={75}
				y2="79.078"
				gradientTransform="matrix(-0.008257, 0.340399, -0.517282, -0.004307, 97.191063, 126.303741)"
				xlinkHref="#color-0"
			/>
			<marker id="arrow"
				viewBox="0 0 1000 1000"
				refX="1000" refY="250"
				markerWidth="10" markerHeight="10"
				orient="auto"
				markerUnits="strokeWidth">
				<path d="M 0 0 L 1000 250 L 0 500 z" fill="var(--violet)" />
			</marker>
		</defs>
		<svg className="sgn_grid_pattern">
			{/* 		<pattern id="small_grid_pattern" width="2500" height="2500" fill="white" patternUnits="userSpaceOnUse">
					<path d="M 0 0 2500 0 2500 2500 0 2500 0 0" fill="none" stroke="black" strokeWidth="1000"></path>
				</pattern> */}
			<pattern id="medium_grid_pattern" width="25000" height="25000" patternUnits="userSpaceOnUse">
				<rect width="250000" height="250000" fill="var(--grey-main)"/* fill="url(#small_grid_pattern)" */></rect>
				<path d="M 25000 0 L 0 0 0 25000" fill="none" stroke="var(--gridColorStroke)" strokeWidth="2000"></path>
			</pattern>
			<pattern id="grid_pattern" width="250000" height="250000" patternUnits="userSpaceOnUse">
				<rect width="250000" height="250000" fill="url(#medium_grid_pattern)"></rect>
				<path d="M 250000 0 L 0 0 0 250000" fill="none" stroke="var(--gridColorStroke)" strokeWidth="4000"></path>
			</pattern>
		</svg>
	</svg>
);

export default SvgDefs;
