const constants = {
	/** Расширения файлов для загрузки деталей (part mode) */
	PART_UPLOAD_EXTENSIONS: ['ncp', 'dxf'],
	/** Значение атрибута accept для input type="file" */
	PART_UPLOAD_ACCEPT: '.ncp,.dxf',

	SERVER_URL: import.meta.env.DEV
		? 'http://localhost:5005'
		: typeof window !== 'undefined'
			? window.location.origin
			: '',
	languages: [
		{ lang: 'ru', name: 'Русский' },
		{ lang: 'en', name: 'English' },
		{ lang: 'zh', name: '中国人' }
	],
	fontSize:11.88,
	defaultAngle:90,
	kerning:1,
	defaultIntend:1,
	defaultInletIntend: 0.2,
	defaultInletLength: 6,
	defaultStringInterval:18,
	defaultJointSize: 0.2,
    contourTypes:['engraving', 'inner', 'outer'],
    operatingModes:['macro0', 'macro1','macro2', 'macro3', 'macro4', 'macro5','macro6', 'macro7' ],
    piercingModes: {'normal':0, 'without_time':-1, 'pulse':1},
	shapes:[
		"M10 5 A5 5 0 0 0 0 5 A5 5 0 0 0 5 10 A5 5 0 0 0 10 5",
		"M5 0 L10 0 L10 10 L0 10 L0 0 L5 0",
		"M5 8.66  L0 8.66 L5 0 L10 8.66 L5 8.66",
		"M4.86 9.27 L 1.78 9.27 L 0 3.54 L 4.86 0 L 9.72 3.54 L 7.94 9.27 L 4.86 9.27",
		"M9.41 5 9.41 7.5 5.08 10 .75 7.5.75 2.5 5.08 0 9.41 2.5 9.41 5"],
    panelPostions:	{
		sheetLogPopup: {
			mini: true,
			style: {
				top: 40,
				left: 12,
				width: 350,
				height: 300,
				zIndex:1
			}
		},
		logPopup: {
			mini: true,
			style: {
				top: 40,
				left: 12,
				width: 350,
				height: 300,
				zIndex:1
			}
		},
		toolsPopup: {
			mini: false,
			style: {
				top: 40,
				left: 300,
				width: 125,
				height: 380,
				zIndex:1
			}
		},
		sheetToolsPopup: {
			mini: false,
			style: {
				top: 40,
				left: 300,
				width: 125,
				height: 380,
				zIndex:1
			}
		},
		sheetAlignPopup: {
			mini: false,
			style: {
				top: 200,
				left: 300,
				width: 125,
				height: 380,
				zIndex:1
			}
		},
		sheetCutPopup: {
			mini: true,
			style: {
				top: 360,
				left: 12,
				width: 350,
				height: 120,
				zIndex:1
			}
		},
		sheetResidualCutPopup: {
			mini: true,
			style: {
				top: 490,
				left: 12,
				width: 260,
				height: 185,
				zIndex: 1
			}
		},
		sheetPopup: {
			mini: false,
			style: {
				top: 80,
				left: 300,
				width: 125,
				height: 380,
				zIndex:1
			}
		},
		contourModesPopup: {
			mini: true,
			style: {
				top: 80,
				left: 12,
				width: 350,
				height: 300,
				zIndex:1
			}
		},
		contourPopup: {
			mini: true,
			style: {
				top: 120,
				left: 12,
				width: 350,
				height: 520,
				zIndex:1
			}
		},
		alignAngleRoundPopup: {
			mini: true,
			style: {
				top: 120,
				left: 370,
				width: 350,
				height: 520,
				zIndex:1
			}
		},
		partPopup: {
			mini: true,
			style: {
				top: 160,
				left: 12,
				width: 350,
				height: 300,
				zIndex:1
			}
		},
		outletPopup: {
			mini: true,
			style: {
				top: 200,
				left: 12,
				width: 350,
				height: 360,
				zIndex:1
			}
		},
		inletPopup: {
			mini: true,
			style: {
				top: 240,
				left: 12,
				width: 350,
				height: 400,
				zIndex:1
			}
		},
		pointPopup: {
			mini: true,
			style: {
				top: 200,
				left: 500,
				width: 400,
				height: 120,
				zIndex:1
			}
		},
		edgePopup: {
			mini: true,
			style: {
				top: 100,
				left: 500,
				width: 350,
				height: 120,
				zIndex:1
			}
		},
		textPopup: {
			mini: true,
			style: {
				top: 280,
				left: 12,
				width: 350,
				height: 120,
				zIndex:1
			}
		},
		jointPopup: {
			mini: true,
			style: {
				top: 320,
				left: 12,
				width: 350,
				height: 120,
				zIndex:1
			}
		},
		cutPopup: {
			mini: true,
			style: {
				top: 360,
				left: 12,
				width: 350,
				height: 120,
				zIndex:1
			}
		},
		formsPopup: {
			mini: true,
			style: {
				top: 360,
				left: 12,
				width: 350,
				height: 120,
				zIndex:1
			}
		},
    },
	lines:
	`%
	(<NcpProgram Version="1.0" Units="Metric">)
	(<MaterialInfo Label="Mild steel" MaterialCode="S235JR" Thickness="2" FormatType="Sheet" DimX="250" DimY="125"/>)
	(<ProcessInfo CutTechnology="Laser" Clamping="False"/>)
	(<Plan JobCode="1683027664_1683027633_0_23348__S235JR_2.0mm_1_owner">)
	(<Plan>)
	N1G29X110Y118P1H1A1
	N2G52X10Y10L1C0
	N3G99
	(</Plan>)
	(<Part PartCode="box" Debit="1">)
	N4G28X100Y108L1P1
	N5G0X50Y108
	N6G10S0
	N7G1X51.885618Y102.666667M4
	N8G42
	N9G2X50Y100I50J102
	(<Contour>)
	N10G1X0
	N11Y0
	N12X100
	N13Y100
	N14X50M5
	N15G40
	(</Contour>)
	N16G98
	(</Part>)
	(</NcpProgram>)
	&`,


	
}

export default constants
