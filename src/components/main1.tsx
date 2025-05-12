import CustomKnob from "./customKnob";
import { observer } from "mobx-react-lite";
import viewStore from "../store/viewStore";
import MyForm from "./machineForm";
import MacrosSelector from "./macrosSelector";
import MacrosEditModalPanel from "./macrosEditModalPanel";
import Technology from "./technology";



const Main1 = observer(() => {

	const { knobMode } = viewStore

	return (
		<main id="main1" className="h-100 overlow-hidden d-flex w-100 h-100">	
			<div className={`h-100 d-flex flex-column fade-toggle ${knobMode ? 'visible ms-3 mt-3' : ''}`}>
					
				<div key={0} className="h-125 col-12 vidget">
					<MacrosSelector />
				</div>

				{
					[
						"pressure",
						"power_W_mm",
						//"gas": "AIR",
						"focus",
						//"enabled": false,
						"feedLimit_mm_s",
						//"cross_blow": false,
						//"type": "CW",
						"modulationMacro",
						"height",
						"modulationFrequency_Hz",
					].map((a: string, i: number) => (
						<div key={i} className="h-125 col-12 vidget">
							<CustomKnob index={i+1} param={a}/>
						</div>
					))
				}

				{/*
					- Давление газа
					- Энергия (мощность)
					- Фокус
					- Ограничение подачи
					- Тип импульсного режима, также рядом кнопка для изменения макроса в модальном окне
					- Высота сопла
					- Несущая частота
				*/} 
			
			</div>

			<div className="h-100 overflow-hidden">		
				<div className="d-flex h-60">
					<div className="col-8 h-100 p-3">
						<div className=" vidget col-12 h-100 overflow-y-scroll">
 							<Technology />
							</div>
							{/* <embed className='w-100 h-100 p-3'
							src="http://127.0.0.1/editor.html?filename=8339_geos_test.ncp"
						/>  */}
						</div>
					<div className="d-flex flex-column w-100">
						<div className="col-12 h-100 p-3">
							<div className=" vidget col-12 h-100 overflow-y-scroll">
 								<MyForm />
							</div>
						</div>
					</div>
				</div>	

				<div className="d-flex h-30">
					<div className="d-flex flex-column  h-100 col-4 ">
						<div className="col-12 h-50 p-3">
							<div className="vidget col-12 h-100 d-flex align-items-center justify-content-center">
						
							</div>
						</div>	
						<div className="col-12 h-50 p-3">
							<div className="vidget col-12 h-100">
 							</div>
						</div>					
					</div>

					<div className="d-flex flex-column  h-100 col-4 ">
						<div className="col-12 h-100 p-3">
							<div className="vidget col-12 h-100">
								<div className="w-100 h-100 d-flex align-items-center justify-content-center">
 								</div>

							</div>
						</div>				
					</div>

					<div className="d-flex flex-column h-100 col-4 ">
						<div className="col-12 h-60 p-3">
							<div className="vidget col-12 h-100">
							</div>
						</div>	
						<div className="col-12 h-40 p-3">
							<div className="vidget col-12 h-100">
							</div>
						</div>	
						
					</div>						
				</div>

				<div className="d-flex row h-15 p-3">
					<div className="col-12 h-100">
						<div className="vidget col-12 h-100">
						</div>
					</div>					
				</div>
			</div>
			<MacrosEditModalPanel />

		</main>
	);
});

export default Main1;
