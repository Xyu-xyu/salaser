import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';


const NavigationModal = observer(() => {

  	const { carouselMode, selectedSlide  } = viewStore
 
	const cloneThis = () => {
		//viewStore.AddAndUpdate('modulationMacros', selectedSlide, 'modulationMacro' ) 
		viewStore.setModalProps ({
			show:true,
 			modalBody: 'Хотите скопировать этот чудесный макрос ?',
			confirmText: 'Clone',
			cancelText:'Cancel',
			func: viewStore.AddAndUpdate,
			args:['modulationMacros', viewStore.selectedSlide, 'modulationMacro']
		})
	}

	const deleteThis = () => {
		//viewStore.deleteAndUpdate('modulationMacros', selectedSlide, 'modulationMacro') 
		viewStore.setModalProps ({
			show:true,
 			modalBody: 'Хотите удалить этот чудесный макрос ?',
			confirmText: 'Delete',
			cancelText:'Cancel',
			func: viewStore.deleteAndUpdate,
			args:['modulationMacros', viewStore.selectedSlide, 'modulationMacro']
		})
	}

	const carousel = () =>{
		viewStore.setCarouselMode ( !carouselMode)
	}

	const setThis =() =>{
		viewStore.setTecnologyValue( selectedSlide, 'modulationMacro', 'macros', 0, 15, false  )
	}

	return (
		<>
			<div className="mt-2">
				<button className="carousel_btn violet_button m-2">
					<div className="d-flex align-items-center justify-content-center"
							onMouseDown={ carousel }>
						{ carouselMode ?  
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
				{ carouselMode && <button className="carousel_btn violet_button m-2">
					<div className="d-flex align-items-center justify-content-center"
						onMouseDown={ setThis }>
						<Icon
							icon="charm:square-tick"
							width="48"
							height="48"
							style={{ color: 'white' }}/>
						
					</div>
				</button>}
				{ carouselMode && <button className="carousel_btn violet_button m-2">
					<div className="d-flex align-items-center justify-content-center"
						onMouseDown={ cloneThis }>
						<Icon icon="fa-regular:clone"
							width="36"
							height="48"
							style={{ color: 'white' }} />
					</div>
				</button>}				
				{ carouselMode && <button className="carousel_btn  m-2">
					<div className="d-flex align-items-center justify-content-center"
						onMouseDown={ deleteThis }>
						<Icon
							icon="ic:twotone-delete-outline"
							width="48"
							height="48"
							style={{ color: 'white' }}/>
						
					</div>
				</button>}
			</div>
		</>
	)
});

export default NavigationModal;
