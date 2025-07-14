import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';


const NavigationModalinStages = observer(() => {

  	const { carouselModeInPiercing, selectedSlide  } = viewStore
 
	const cloneThis = () => {
		if (carouselModeInPiercing) {
			viewStore.setModalProps ({
				show:true,
				 modalBody: 'Do you want to copy and add this piercing macro?',
				confirmText: 'Clone',
				cancelText:'Cancel',
				func: viewStore.AddAndUpdate,
				args:['piercingMacros', viewStore.selectedSlide, 'piercingMacro']
			})
		} else {
			viewStore.setModalProps ({
				show:true,
				modalBody: 'Do you want to copy and add this piercing macro step?',
				confirmText: 'Clone',
				cancelText:'Cancel',
				func: viewStore.addStage,
				args:[]
			})
		}
	}

	const deleteThis = () => {
		if (carouselModeInPiercing) {
			viewStore.setModalProps ({
				show:true,
				modalBody: 'Do you want to delete piercing macro?',
				confirmText: 'Delete',
				cancelText:'Cancel',
				func: viewStore.deleteAndUpdate,
				args:['piercingMacros', viewStore.selectedSlide, 'piercingMacro']
			})
		} else {
			viewStore.setModalProps ({
				show:true,
				modalBody: 'Do you want to delete this piercing macro step?',
				confirmText: 'Delete',
				cancelText:'Cancel',
				func: viewStore.deleteStage,
				args:[]
			})
		}	 
	}

	const carousel = () =>{
		viewStore.setCarouselModeInPiercing ( !carouselModeInPiercing)
	}

	const setThis =() =>{
		viewStore.setTecnologyValue( selectedSlide, 'piercingMacro', 'macros', 0, 7, false  )
	}

	return (
		<>
			<div className="mt-2">
				<button className="carousel_btn violet_button m-2">
					<div className="d-flex align-items-center justify-content-center"
							onMouseDown={ carousel }>
						{ carouselModeInPiercing ?  
							<Icon
							icon="material-symbols:rectangle-outline-rounded"
							width="48"
							height="48"
							style={{ color: 'white' }}/>
							:
						<Icon icon="hugeicons:carousel-horizontal-02"
							width="48"
							height="48"
							style={{ color: 'white' }} />
						}
					</div>
				</button>	
				<button className="carousel_btn violet_button m-2">
					<div className="d-flex align-items-center justify-content-center"
						onMouseDown={ setThis }>
						<Icon
							icon="charm:square-tick"
							width="48"
							height="48"
							style={{ color: 'white' }}/>
						
					</div>
				</button>
				<button className="carousel_btn violet_button m-2">
					<div className="d-flex align-items-center justify-content-center"
						onMouseDown={ cloneThis }>
						<Icon icon="fa-regular:clone"
							width="36"
							height="48"
							style={{ color: 'white' }} />
					</div>
				</button>				
				<button className="carousel_btn  m-2">
					<div className="d-flex align-items-center justify-content-center"
						onMouseDown={ deleteThis }>
						<Icon
							icon="ic:twotone-delete-outline"
							width="48"
							height="48"
							style={{ color: 'white' }}/>
						
					</div>
				</button>
			</div>
		</>
	)
});

export default NavigationModalinStages;
