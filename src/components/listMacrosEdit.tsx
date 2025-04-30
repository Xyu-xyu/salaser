import { useState } from 'react';
import { ListGroup, Form } from 'react-bootstrap';


const listMacrosEdit = () => {
	const [selectedOption, setSelectedOption] = useState("AIR");

	const options = [
		"AIR",
		"O2",
		"N2"
	];

	return (
		<div className='listMacrosEdit w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 h-100 d-flex flex-column'>
	
				<div className='listMacrosEdit_title'>{'Газ'}</div>
			
				<ListGroup>
					{options.map((option) => (
						<ListGroup.Item key={option}>
							<Form.Check
								type="radio"
								id={`radio-${option}`}
								label={option}
								name="gasOptions"
								value={option}
								checked={selectedOption === option}
								onChange={(e) => setSelectedOption(e.target.value)}
							/>
						</ListGroup.Item>
					))}
				</ListGroup>
			</div>
		</div>

	);
};

export default listMacrosEdit;
