import { observer } from "mobx-react-lite";
import macrosStore from "../store/macrosStore";
import { useTranslation } from 'react-i18next';
  

const getAllEntries = (obj, parentKey = '') => {
    const entries = [];

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

const Technology = observer(() => {
    const { schema, cutSettingsSchemaStatus, cutSettingsSchemaError } = macrosStore;
    const {t} = useTranslation();

    if (cutSettingsSchemaStatus === 'pending') {
        return <p className="text-muted">{t("Загрузка схемы…")}</p>;
    }
    if (cutSettingsSchemaStatus === 'unavailable' || !schema) {
        return (
            <p className="text-warning" role="status">
                {cutSettingsSchemaError?.message || t("Схема настроек недоступна")}
            </p>
        );
    }

    const entries = getAllEntries(schema);
    return (
        <>
            <h1>{ t( "Technology" ) }</h1>
            <ul>
                {entries.map((entry, index) => (
                    <li key={index} className="text-black">
                        <strong>{entry.path}</strong>: {t(String(entry.value))}
                    </li>
                ))}
            </ul> 
        </>
    );
});

export default Technology;
