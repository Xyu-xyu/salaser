import { observer } from "mobx-react-lite";
import laserStore from "../store/laserStore";
import svgStore from "../store/svgStore";
import { toJS } from "mobx";
 

const LaserMarker = observer(() => {
 	const {  paramsLimit } = laserStore
 
	const genererateLaserMarker = () => {
		//console.log (toJS(paramsLimit))
		const axisMap = Object.fromEntries(
		  paramsLimit.map(a => [a.name, a])
		)

		const { loadResult   } = laserStore
		const data = JSON.parse(loadResult)

 		let height = 500
		let width = 500

		try {

 			height = Number(data.result.jobinfo.attr?.dimx)
			width = Number(data.result.jobinfo.attr?.dimy)
			
		} catch (e) {
			
			//console.log ("ЕБАТЬ")		
	
		}
		
	  
		const X = axisMap.X?.val||0
		const Y = (height - axisMap.Y?.val)||0
	  
		if (typeof X !== "number" || typeof Y !== "number") return null
	  
		const size = 12   // длина линий прицела
		const gap  = 4    // зазор в центре
	  
		const d = `
		  M ${X - size} ${Y} H ${X - gap}
		  M ${X + gap} ${Y} H ${X + size}
		  M ${X} ${Y - size} V ${Y - gap}
		  M ${X} ${Y + gap} V ${Y + size}
		`
	  
		return (
		  <path
			d={d}
			stroke="green"
			strokeWidth="2"
			fill="none"
			pointerEvents="none"
		  />
		)
	  }

	return (
		<>
			{genererateLaserMarker()}
		</>
	)						
});

export default LaserMarker