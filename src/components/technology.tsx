import cut_settings_schema from "../store/cut_settings_schema";
import { useTranslation } from 'react-i18next';
  

const getAllEntries = (obj: any, parentKey = ''): { path: string, value: any }[] => {
    const entries: { path: string, value: any }[] = [];

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const fullPath = parentKey ? `${parentKey}.${key}` : key;
            const value = obj[key];

            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                entries.push(...getAllEntries(value, fullPath));
            } else {
                if (key === 'title') {
                    entries.push({ path: fullPath, value });
                }
                
            }
        }
    }

    return entries;
};

const Technology = () => {
    const entries = getAllEntries(cut_settings_schema.result);
    const {t} = useTranslation();

    return (
        <>
            <h1>{ t( "Technology" ) }</h1>
            <ul>
                {entries.map((entry, index) => (
                    <li key={index} className="text-black">
                        <strong>{entry.path}</strong>: {String(entry.value)}
                    </li>
                ))}
            </ul> 
        </>
    );
};

export default Technology;
