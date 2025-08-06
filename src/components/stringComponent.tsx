import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useState } from 'react';
import utils from '../scripts/util';

interface StringComponentInt {
	param:string;
	keyParam:string
}

type ResultItem = {
	name: string;
	'focus, mm'?: number,
	'height, mm'?: number,
	'pressure, bar'?: number,
	'power, kWt'?: number,
	'enabled': boolean;
	'power': number,
	'power_W_s': number,
	'delay_s':number	
};


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


    const stageTime: number[] = [];
	const data: ResultItem[] = utils.getChartData(selectedPiercingMacro);
	data.forEach(a => {
		stageTime.push(a.power_W_s / a.power || 0 );
	});
	
    const totalTime = data.reduce((acc, item) => {
        if (!item.enabled) return acc; // пропускаем неактивные элементы
        const time = item.delay_s + (item.power_W_s / item.power || 0);
        return acc + time;
    }, 0);

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
                { viewStore.getTecnologyValue('stages', 'piercingMacros', selectedPiercingMacro).length}&nbsp;stages,&nbsp; 
                { totalTime.toFixed(1) }&nbsp;seconds 
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
                    className={`form-control stringComponent ${error ? 'is-invalid' : ''}`} 
                />
            </div>

        </div>
            );
});

export default StringComponent;