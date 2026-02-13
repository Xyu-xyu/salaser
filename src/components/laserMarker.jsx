import { observer } from "mobx-react-lite";
import laserStore from "../store/laserStore";
 

const LaserMarker = observer(() => {
 	const {  paramsLimit } = laserStore
 
	const genererateLaserMarker = () => {
		const axisMap = Object.fromEntries(
		  paramsLimit.map(a => [a.name, a])
		)
	  
		const X = axisMap.X?.value||0
		const Y = axisMap.Y?.value||0
	  
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
			stroke="red"
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