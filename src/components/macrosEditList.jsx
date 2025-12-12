import { ListGroup, Form } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import macrosStore from '../store/macrosStore';

  
const MacrosEditList = observer(({ param, keyParam }) => {

	const { macrosProperties } = macrosStore
	let val = macrosStore.getTecnologyValue(param, keyParam)
	
	let property = macrosProperties.cutting.properties[param];
	const { title } = property;	
	const setSelectedOption =(val) =>{
 		macrosStore.setValString ( param, val, keyParam)
	}


	return (
		<div className='listMacrosEdit w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 h-100 d-flex flex-column'>
	
{/* 				<div className='listMacrosEdit_title'>{title}</div>
 */}			
				<ListGroup>
					{property.enum.map((option="") => (
						<ListGroup.Item key={"list_3"+option}>
							<Form.Check
								type="radio"
								id={`radio-${option}-${title}-${keyParam}`}
								label={option}
								name={`${title}-Options-${keyParam}`}
								value={option}
								checked={val === option}
								onChange={(e) => setSelectedOption(e.target.value)}
							/>
						</ListGroup.Item>
					))}
				</ListGroup>
			</div>
		</div>

	);
});

export default MacrosEditList;
