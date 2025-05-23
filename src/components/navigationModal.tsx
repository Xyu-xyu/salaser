import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';

 
const NavigationModal = observer(() => {

  	const { carouselMode } = viewStore
 	const stepBig = 1

	const increase = () => {
	}

	const decrease = () => {
	}

	const carousel = () =>{
		viewStore.setCarouselMode ( !carouselMode)
	}

	return (
		<>
			<div className="mt-2">
			{ !carouselMode && <button className="carousel_btn grey_button m-2">
					<div className="d-flex align-items-center justify-content-center"
						onMouseDown={ decrease }>
						<Icon icon="icon-park:left"
							width="48"
							height="48"
							style={{ color: 'white' }} />
					</div>
				</button>}
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
				{ !carouselMode && <button className="carousel_btn grey_button m-2">
					<div className="d-flex align-items-center justify-content-center"
						onMouseDown={ increase }>
						<Icon
							icon="icon-park:right"
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
