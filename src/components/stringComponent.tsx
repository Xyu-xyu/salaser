import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useState } from 'react';

interface StringComponentInt {
	param:string;
	keyParam:string
}


const StringComponent: React.FC = observer(() => {
    const [error, setError] = useState<boolean>(false);
	const { selectedPiercingMacro } = viewStore

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        if (newValue.length < 1) {
            setError( true);
			return
        } else if (newValue.length > 32) {
            setError( true);
			return
        } else {
            setError( false);
        }
        viewStore.setValString('name', newValue, 'piercingMacros')
    };


	let value = viewStore.getTecnologyValue('name', 'piercingMacros')

	useEffect (()=>{
		value = viewStore.getTecnologyValue('name', 'piercingMacros')
		if (value.length < 1) {
            setError( true);
			return
        } else if (value.length > 32) {
            setError( true);
			return
        } else {
            setError( false);
        }

	},[ selectedPiercingMacro ])

    return (
        <div className='stringComponentContainer px-2'>
			<div className='stringComponentLabel mx-2' >
				{'Name:'}
			</div>
            <input 
                type="text" 
                value={value} 
                onChange={handleChange} 
                placeholder="Введите строку" 
				className={`form-control stringComponent ${error ? 'is-invalid' : ''}`} // Bootstrap styling for inputs
            />
         </div>
    );
});

export default StringComponent;