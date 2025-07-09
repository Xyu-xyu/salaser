import './IosToggle.css';
import IosToggleForm from './iosToggleForm';
import { useTranslation  } from 'react-i18next';


const IosToggle3 = () => {
 	const { i18n  } = useTranslation();
	const changeLanguage = () => {
		const lng: string = i18n.language === 'en' ? 'ru' : 'en'
		localStorage.setItem('lng', lng)
		i18n.changeLanguage( lng );
	};
  
	return (
		<IosToggleForm id={'3'} checked={ Boolean(i18n.language === 'en')} onChange={changeLanguage} dataOff={'Ru'}  dataOn={'En'}/> 
	);
};

export default IosToggle3;