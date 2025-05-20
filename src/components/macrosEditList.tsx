import { ListGroup, Form } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';

interface MacrosEditListInt {
	param: string;
	keyParam: string;
}
  
const MacrosEditList: React.FC<MacrosEditListInt> = observer(({ param, keyParam }) => {

	const { macrosProperties } = viewStore
	let val:string = viewStore.getTecnologyValue(param, keyParam)
	
	let property = macrosProperties.cutting.properties[param as keyof typeof macrosProperties.cutting.properties];
	const { title } = property;	
	const setSelectedOption =(val:string) =>{
 		viewStore.setValString ( param, val, keyParam)
	}


	return (
		<div className='listMacrosEdit w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 h-100 d-flex flex-column'>
	
{/* 				<div className='listMacrosEdit_title'>{title}</div>
 */}			
				<ListGroup>
					{property.enum.map((option="") => (
						<ListGroup.Item key={option}>
							<Form.Check
								type="radio"
								id={`radio-${option}-${title}`}
								label={option}
								name={`${title}Options`}
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
