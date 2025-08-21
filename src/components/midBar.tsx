import { observer } from "mobx-react-lite";
import laserStore from "../store/laserStore";
import { useEffect } from "react";
import axios from "axios";


const MidBar = observer(() => {
	let params = [
		{ name: 'N2', measure: 'bar', val: 4.8 },
		{ name: 'Nd', measure: 'mm', val: 12.7 },
		{ name: 'f', measure: 'kHz', val: 88.7 },
	]

	let paramsLimit = [
		{ name: 'X', measure: 'mm', val: 1250.44 },
		{ name: 'Y', measure: 'mm', val: 44.777 },
		{ name: 'Z', measure: 'mm', val: 28.77 },
	]

	const { carouselInPlan, tasks } = laserStore



	useEffect(() => {
		const fetchTasks = async () => {
			laserStore.setLoading(true);
			try {
				const response = await axios.get("http://127.0.0.1/tasks-info");
				laserStore.setTasks(response.data);
			} catch (error: any) {
				laserStore.setError(error.message);
			} finally {
				laserStore.setLoading(false);
			}
		};

		fetchTasks();
	}, []);



	return (

		<>
			{!carouselInPlan && <div className="d-flex flex-column">
				<div className="d-flex mx-2 flex-wrap">
					{
						paramsLimit.map((item, i) => {
							return (
								<div className="currentPlanMeasureWpapperWpapper d-flex" key={i}>
									<div className="currentPlanMeasureWpapper">
										<div className="currentPlanMeasure">

											<div className="currentPlanMeasureNameCont">
												<div className="currentPlanMeasureName">
													{item.name}
												</div>
											</div>

											<div className="currentPlanMeasureValConainer d-flex align-items-center">
												<div className="currentPlanMeasureValue">
													{item.val.toFixed(2)}
												</div>
												<div className="currentPlanMeasureItem mx-1">
													{item.measure}
												</div>
											</div>
										</div>
									</div>
									<div className="currentPlanLimits my-2 ms-2">
										<div className="d-flex flex-column">
											<div className="d-flex  align-items-center mb-1">
												<div className="led-green-medium">
												</div>
												<div className="limitText">
													Limit-
												</div>
											</div>
											<div className="d-flex  align-items-center">
												<div className="led-gray-medium">
												</div>
												<div className="limitText">
													Limit+
												</div>
											</div>
										</div>
									</div>
								</div>
							)

						})
					}
				</div>
				<div className="d-flex mx-2 flex-wrap">
					{
						params.map((item, i) => {
							return (
								<div className="currentPlanMeasureWpapperWpapper d-flex" key={i}>
									<div className="currentPlanMeasureWpapper">
										<div className="currentPlanMeasure">

											<div className="currentPlanMeasureNameCont">
												<div className="currentPlanMeasureName">
													{item.name}
												</div>
											</div>

											<div className="currentPlanMeasureValConainer d-flex align-items center">
												<div className="currentPlanMeasureValue">
													{item.val.toFixed(2)}
												</div>
												<div className="currentPlanMeasureItem mx-1">
													{item.measure}
												</div>
											</div>
										</div>
									</div>
									<div className="currentPlanLimits">
									</div>
								</div>
							)

						})
					}
				</div>

				{!carouselInPlan && <div className="d-flex w-100 h-100 flex-start p-3">
					<img src="/images/06.08 1,5мм-01.svg" alt="Plan Image" />
				</div>}

			</div>}
			{carouselInPlan && <div>
			{/*{ <pre>{JSON.stringify( tasks.categories.active.items, null, 2)}</pre> }*/}
				{ Object.keys(tasks.categories.active.items).map((key)=>{
					return (<h4>{ key}</h4>)
				}) }
				
			</div>
			}
		</>

	)
});

export default MidBar;
