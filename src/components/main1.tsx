//import { useState } from "react";
import CardExample from "../bootstrap/card";
//import List from "../bootstrap/list";
//import Spinners from "../bootstrap/spinners";
import BasicTable from "../bootstrap/table";
import BasicToast from "../bootstrap/toast";
import Example from "../bootstrap/xxx";
import BasicTabs from "./../bootstrap/tabs";
//import ProgressBarContainer from "./progressBarContainer";
import CustomKnob from "./customKnob1";
import CustomKnob1 from "./customKnob0";
import CustomKnob2 from "./customKnob2";
import { observer } from "mobx-react-lite";
import viewStore from "../store/viewStore";



const Main1 = observer(() => {

	const { knobMode } = viewStore

	return (
		<main id="main1" className="h-100 overflow-hidden d-flex">	
			<div className={`h-100 d-flex flex-column fade-toggle ${knobMode ? 'visible' : ''}`}>
				<div className="h-125 col-12"></div>
				<div className="h-125 col-12"></div>
				<div className="h-125 col-12"></div>
				<div className="h-125 col-12"></div>
				<div className="h-125 col-12"></div>
				<div className="h-125 col-12"></div>
				<div className="h-125 col-12"></div>
				<div className="h-125 col-12"></div>
				<div className="h-125 col-12"></div>

			</div>

			<div className="h-100 overflow-hidden">		
				<div className="d-flex h-60"> 
					
					<div className="col-8 h-100">
						<embed className='w-100 h-100 p-3'
						src="http://127.0.0.1/editor.html?filename=8339_geos_test.ncp"
					/>
					</div>
					<div className="d-flex flex-column w-100">
						<div className="col-12 h-60 p-3">
							<div className=" vidget col-12 h-100">
								<BasicTable />
							</div>
						</div>
						<div className=" col-12 h-40 p-3">
							<div className=" vidget  col-12 h-100">
								<BasicTable />
							</div>
						</div>
					</div>
				</div>	

				<div className="d-flex h-30">
					<div className="d-flex flex-column  h-100 col-4 ">
						<div className="col-12 h-50 p-3">
							<div className="vidget col-12 h-100 d-flex align-items-center justify-content-center">
							<CustomKnob />
							</div>
						</div>	
						<div className="col-12 h-50 p-3">
							<div className="vidget col-12 h-100">
								<CardExample />
							</div>
						</div>					
					</div>

					<div className="d-flex flex-column  h-100 col-4 ">
						<div className="col-12 h-100 p-3">
							<div className="vidget col-12 h-100">
								<div className="w-100 h-100 d-flex align-items-center justify-content-center">
									<CustomKnob1 />
								</div>

							</div>
						</div>				
					</div>

					<div className="d-flex flex-column h-100 col-4 ">
						<div className="col-12 h-60 p-3">
							<div className="vidget col-12 h-100 knob_body">
								<CustomKnob2 />
							</div>
						</div>	
						<div className="col-12 h-40 p-3">
							<div className="vidget col-12 h-100">
								<BasicToast />
							</div>
						</div>	
						
					</div>						
				</div>

				<div className="d-flex row h-15 p-3">
					<div className="col-12 h-100">
						<div className="vidget col-12 h-100">
							<BasicTabs />
						</div>
					</div>					
				</div>
			</div>

		</main>
	);
});

export default Main1;
