import React, { useRef } from "react";
import constants from "../store/constants";
import { observer } from "mobx-react-lite";
import macrosStore from "../store/macrosStore";
import utils from "../scripts/util";
import { showToast } from "../components/toast";
import CustomIcon from "../icons/customIcon";

interface Preset {
	// Определите структуру пресета, если она известна
	[key: string]: any;
}

export const uploadPresetFromFile = observer(() => {
	const fileInputRef = useRef<HTMLInputElement>(null);
 	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target;
		const file = input.files?.[0];
		if (!file) return;

		console.log("📂 Selected file:", file);

		const reader = new FileReader();
		reader.readAsText(file);

		reader.onload = async (readerEvent: ProgressEvent<FileReader>) => {
			const content = readerEvent.target?.result;
			console.log (content)
			if (typeof content === "string") {
				const result = utils.validateCuttingSettings(JSON.parse(content));
				if (result?.errors.length === 0) {
					try {
						await addPreset(JSON.parse(content)); // Преобразуем строку в объект
					} catch (error) {
						console.error("Ошибка при парсинге JSON:", error);
  					}
				} else {
					// Обработка ошибок валидации
					console.log("Ошибки валидации:", result?.errors);
 				}
			}
		};

		reader.onerror = (error) => {
			console.error("Ошибка при чтении файла:", error);
 		};
	};

	const addPreset = async (preset: Preset) => {
		try {
			const response = await fetch(constants.SERVER_URL + `/db/savepreset`, {
				method: "POST",
				headers: {
					/*"Content-Type": "application/json",*/
				},
				body: JSON.stringify(preset),
			});

			if (response.ok) {
				macrosStore.fetchPresets();
				showToast({
					type: 'success',
					message: "Success in save preset",
					position: 'bottom-right',
					autoClose: 2500
				});

			 	
			} else {
				console.error("Ошибка при сохранении пресета:", response.statusText);
				// showToast("Ошибка при сохранении пресета", "error");
			}
		} catch (error) {
			console.error("Ошибка при отправке запроса:", error);
			// showToast("Ошибка при отправке запроса", "error");
		}
	};

	return (
		<>
			<button
				onClick={handleClick}
				className="violet_button navbar_button small_button40 ms-1"
			>
				<div className="d-flex align-items-center justify-content-center">
					<CustomIcon
						icon="upload"
						width="36"
						height="36"
						color='white'
						fill="white"
					/>
				</div>
			</button>

			{/* скрытый input */}
			<input
				type="file"
				ref={fileInputRef}
				hidden
				accept=".json" // только файлы с расширением .json
				onChange={handleFileChange}
			/>
		</>
	);
});

export default uploadPresetFromFile;
