const constants = {
	
	SERVER_URL:import.meta.env.DEV ? 'http://localhost:5005' : '',
	languages: [
		{ lang: 'ru', name: 'Русский' },
		{ lang: 'en', name: 'English' },
		{ lang: 'zh', name: '中国人' }
	],
	code:[`(<Part id="4" offsetx="0.000" offsety="0.000" rotation="0.000" color="#d85b63" part_id="4" originx="112.000000" originy="200.000000">)`, 
	`(<Part_attr code="30___10__4">)`, 
	`(<Part_attr uuid="n4-170fb4da-adea-4bef-b486-01a8ad4a3ea5">)`, 
	`(<slow>)`, 
	`(<Inlet mode="outer" contour_id="0" c_contour_id="0" pard_id="4" macro="1" pulse="0">)`, 
	`G0 x2 y95.38`, 
	`(<laser_on>)`, 
	`G1 x7.333333 y97.265618`, 
	`G2 x10 y95.38 i.666667 j-1.885618`, 
	`(<Contour mode="outer" contour_id="0" c_contour_id="0" pard_id="4" macro="0" closed="1" overcut="9.600,42.040" >)`, 
	`G1 x10 y95.38`, 
	`G1 y42.04`, 
	`G1 x0`, 
	`G1 y13.168`, 
	`G1 x10`, 
	`G1 y0`, 
	`G1 x102`, 
	`G1 y13.168`, 
	`G1 x112`, 
	`G1 y42.04`, 
	`G1 x102`, 
	`G1 y103`, 
	`G1 x112`, 
	`G1 y148.731`, 
	`G1 x102`, 
	`G1 y200`, 
	`G1 x10`, 
	`G1 y148.731`, 
	`G1 x0`, 
	`G1 y103`, 
	`G1 x10`, 
	`G1 y95.38`, 
	`(<laser_off>)`, 
	`(</Contour part_id="4" contour_id="0" c_contour_id="0" >)`, 
	`(</Part id="4" part_id="4">)`],
	fontSize:11.88,
	kerning:1,
	defaultInletIntend: 1,
	defaultInletLength: 12,
	defaultStringInterval:18,
	defaultJointSize: 0.2,
    contourTypes:['engraving', 'inner', 'outer'],
    operatingModes:['macro0', 'macro1','macro2', 'macro3', 'macro4', 'macro5','macro6', 'macro7' ],
    piercingModes: {'normal':0, 'without_time':-1, 'pulse':1},
	shapes:[
		"M10 5 A5 5 0 0 0 0 5 A5 5 0 0 0 5 10 A5 5 0 0 0 10 5",
		"M5 0 H10 V10 H0 L0 0 L5 0",
		"M5 8.66  L0 8.66 L5 0 L10 8.66 L5 8.66",
		"M4.86 9.27 L 1.78 9.27 L 0 3.54 L 4.86 0 L 9.72 3.54 L 7.94 9.27 L 4.86 9.27",
		"M9.41 5 9.41 7.5 5.08 10 .75 7.5.75 2.5 5.08 0 9.41 2.5 9.41 5"],
    panelPostions:	{
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
				zIndex:2
			}
		},
		sheetToolsPopup: {
			mini: false,
			style: {
				top: 40,
				left: 300,
				width: 125,
				height: 380,
				zIndex:2
			}
		},
		contourModesPopup: {
			mini: true,
			style: {
				top: 80,
				left: 12,
				width: 350,
				height: 300,
				zIndex:3
			}
		},
		contourPopup: {
			mini: true,
			style: {
				top: 120,
				left: 12,
				width: 350,
				height: 600,
				zIndex:5
			}
		},
		partPopup: {
			mini: true,
			style: {
				top: 160,
				left: 12,
				width: 350,
				height: 300,
				zIndex:6
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
	svg:{
		"width":189,
		"height":200,
		"params":{
			"code": "22___10__1",
			"uuid": "n6-2490d6d3-c0ff-4508-948e-3cc3a822512c"
		},
		"code":[
			{
				"cid": 6,
				"class": "inlet outer macro1 pulse0",
				"path": "M6 66.356 L7.885618 71.689333 A2 2 0 0 1 6 74.356 ",
				"stroke": "red",
				"strokeWidth": 0.2
			},
			{
				"cid": 6,
				"class": "contour outer macro0 closed1",
				"path": "M6 74.356 H0 V125.689 H12 V150.286 H0 V187.286 H12 V200 H177 V187.286 H189 V150.286 H177 V125.689 H189 V74.356 H177 V54.678 H189 V19.678 H177 V0 H12 V19.678 H0 V54.678 H12 V74.356 H6 ",
				"stroke": "red",
				"strokeWidth": 0.2,
				"selected": false
			},
			{
				"cid": 0,
				"class": "contour engraving macro2 closed0",
				"path": "M22.379605 13.566936 A6.428571 6.428571 0 0 1 28.808176 7.138365 H35.236748 A6.428571 6.428571 0 0 1 41.665319 13.566936 V15.709793 A6.429153 6.429153 0 0 1 39.434502 20.577608 L22.379605 37.138365 H41.665319 ",
				"stroke": "red",
				"strokeWidth": 0.2,
				"selected": false
			},
			{
				"cid": 1,
				"class": "contour engraving macro2 closed0",
				"path": "M45.951033 13.566936 A6.428571 6.428571 0 0 1 52.379605 7.138365 H58.808176 A6.428571 6.428571 0 0 1 65.236748 13.566936 V15.709793 A6.429154 6.429154 0 0 1 63.005931 20.577608 L45.951033 37.138365 H65.236748 ",
				"stroke": "red",
				"strokeWidth": 0.2,
				"selected": false
			},
			{
				"cid": 2,
				"class": "contour inner macro0 closed1",
				"path": "M143.888304 135.497087 A5.49998 5.49998 0 0 1 149.388303 129.997125 H153.388303 A5.499964 5.499964 0 0 1 153.388303 140.997049 H149.388303 A5.49998 5.49998 0 0 1 143.888304 135.497087 ",
				"stroke": "red",
				"strokeWidth": 0.2,
				"selected": false
			},
			{
				"cid": 3,
				"class": "contour inner macro0 closed1",
				"path": "M21.5 135.496 A5.5 5.5 0 0 1 27 129.996 H31 A5.5 5.5 0 0 1 31 140.996 H27 A5.5 5.5 0 0 1 21.5 135.496 ",
				"stroke": "red",
				"strokeWidth": 0.2,
				"selected": false
			},
			{
				"cid": 4,
				"class": "contour inner macro0 closed1",
				"path": "M98.1604 135.497788 A5.500042 5.500042 0 0 1 103.660438 129.997743 H107.660466 A5.500045 5.500045 0 0 1 107.660466 140.997834 H103.660438 A5.500042 5.500042 0 0 1 98.1604 135.497788 ",
				"stroke": "red",
				"strokeWidth": 0.2,
				"selected": false
			},
			{
				"cid": 5,
				"class": "contour inner macro0 closed1",
				"path": "M60.741379 135.503244 A5.500037 5.500037 0 0 1 66.241377 130.003167 H70.241376 A5.500076 5.500076 0 0 1 70.241376 141.00332 H66.241377 A5.500037 5.500037 0 0 1 60.741379 135.503244 H66.741379 H60.741379 ",
				"stroke": "red",
				"strokeWidth": 0.2,
				"selected": false
			},
			{
				"cid": 2,
				"class": "inlet inner macro1 pulse0",
				"path": "M149.388304 135.497089 A2.75 2.75 0 0 1 143.888304 135.497087 ",
				"stroke": "red",
				"strokeWidth": 0.2
			},
			{
				"cid": 4,
				"class": "inlet inner macro1 pulse0",
				"path": "M103.6604 135.497784 L99.993735 136.794149 A1.375 1.375 0 0 1 98.1604 135.497788 ",
				"stroke": "red",
				"strokeWidth": 0.2
			},
			{
				"cid": 5,
				"class": "inlet inner macro1 pulse0",
				"path": "M66.241379 135.503244 H60.741379 ",
				"stroke": "red",
				"strokeWidth": 0.2
			},
			{
				"cid": 2,
				"class": "outlet inner macro0",
				"path": "M143.888304 135.497087 A3 3 0 0 1 149.888304 135.497089 ",
				"stroke": "lime",
				"strokeWidth": 0.2
			},
			{
				"cid": 4,
				"class": "outlet inner macro0",
				"path": "M98.1604 135.497788 A1.5 1.5 0 0 1 100.160399 134.083573 L104.1604 135.497784 ",
				"stroke": "lime",
				"strokeWidth": 0.2
			},
			{
				"cid": 6,
				"class": "outlet outer macro0 closed1",
				"path": "",
				"stroke": "red",
				"strokeWidth": 0.2
			},
			{
				"cid": 3,
				"class": "inlet inner macro0 closed1",
				"path": "",
				"stroke": "red",
				"strokeWidth": 0.2
			},
			{
				"cid": 3,
				"class": "outlet inner macro0 closed1",
				"path": "",
				"stroke": "red",
				"strokeWidth": 0.2
			},
			{
				"cid": 5,
				"class": "outlet inner macro0 closed1",
				"path": "",
				"stroke": "red",
				"strokeWidth": 0.2
			}
		]
	}
}

export default constants
