import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useState } from 'react';

interface StringComponentInt {
	param:string;
	keyParam:string
}


const StringComponent: React.FC<StringComponentInt> = observer(({param, keyParam}) => {
    const [error, setError] = useState<boolean>(false);
	const { selectedPiercingMacro, selectedModulationMacro } = viewStore

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
        viewStore.setValString( param, newValue, keyParam)
    };

	let value = viewStore.getTecnologyValue( param, keyParam)

	useEffect (()=>{
		value = viewStore.getTecnologyValue( param, keyParam)
		if (value.length < 1) {
            setError( true);
			return
        } else if (value.length > 32) {
            setError( true);
			return
        } else {
            setError( false);
        }

	},[ selectedPiercingMacro, selectedModulationMacro ])

    return (
        <div className='d-flex flex-column moderat'>
            { keyParam === 'modulationMacros' && <div className='text-center'>
                <p className="modulatiomNacroName">
                { viewStore.getTecnologyValue('name', 'modulationMacros',selectedModulationMacro )}:&nbsp;  
                { viewStore.getTecnologyValue('pulseFill_percent', 'modulationMacros', selectedModulationMacro)}%,&nbsp; 
                { viewStore.getTecnologyValue('pulseFrequency_Hz', 'modulationMacros', selectedModulationMacro)}Hz
                </p>
            </div>}
            { keyParam === 'piercingMacros' && <div className='text-center'>
                <p className="modulatiomNacroName">
                { viewStore.getTecnologyValue('name', 'piercingMacros',selectedPiercingMacro )}:&nbsp;  
                { viewStore.getTecnologyValue('initial_modulationFrequency_Hz', 'piercingMacros', selectedPiercingMacro)}&nbsp;Hz,&nbsp;
                { viewStore.getTecnologyValue('stages', 'piercingMacros', selectedPiercingMacro).length}&nbsp;stages 
                </p>
            </div>}
            <div className='stringComponentContainer px-2'>
                <div className='stringComponentLabel mx-2' >
                    {'Name'}
                </div>
                <input 
                    type="text" 
                    value={value} 
                    onChange={handleChange} 
                    placeholder="Введите строку" 
                    className={`form-control stringComponent ${error ? 'is-invalid' : ''}`} 
                />
            </div>

        </div>
            );
});

export default StringComponent;