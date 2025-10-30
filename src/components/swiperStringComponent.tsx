import { observer } from 'mobx-react-lite';
import macrosStore from '../store/macrosStore';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StringComponentInt {
	param:string;
	keyParam:string;
    keyInd: number|boolean;
}


const SwiperStringComponent: React.FC<StringComponentInt> = observer(({param, keyParam, keyInd}) => {
    const [error, setError] = useState<boolean>(false);
	const { selectedPiercingMacro, selectedModulationMacro } = macrosStore
    const { t } = useTranslation()
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
        macrosStore.setValString( param, newValue, keyParam, keyInd)
    };

	let value = macrosStore.getTecnologyValue( param, keyParam, keyInd)

	useEffect (()=>{
		value = macrosStore.getTecnologyValue( param, keyParam, keyInd)
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
        <div className='stringComponentContainer px-2 m-2'>
			<div className='stringComponentLabel mx-2' >
				{t('Name')}
			</div>
            <input 
                type="text" 
                value={value} 
                onChange={handleChange} 
 				className={`form-control stringComponent ${error ? 'is-invalid' : ''}`} 
            />
         </div>
    );
});

export default SwiperStringComponent;