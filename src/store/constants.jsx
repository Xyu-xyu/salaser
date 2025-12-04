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
	`(</Part id="4" part_id="4">)`]

}

export default constants
