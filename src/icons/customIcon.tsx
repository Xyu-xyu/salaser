import React from 'react';
import icons from './icons';

type IconName = keyof typeof icons;

interface CustomIconProps {
	icon: IconName;
	width?: number | string;
	height?: number | string;
	color?: string;
	strokeWidth?: number;
	className?: string;
	style?: React.CSSProperties; // Правильный тип для стилей
	viewBox?: string;
	fill?: string;
}

const CustomIcon: React.FC<CustomIconProps> = ({
	icon,
	width = 36,
	height = 36,
	color = "currentColor",
	strokeWidth = 1,
	className,
	style,
	viewBox = '0 0 24 24',
	fill = "none"
}) => {
	const pathData = icons[icon];

	if (!pathData) {
		console.warn(`Icon "${icon}" not found`);
		return null;
	}

	// Если color не передан, то используем тот, что передан через style
	const iconStyle = style || {};

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox={viewBox}
			fill={fill}
			stroke={color} // Применяем переданный или дефолтный цвет
			strokeWidth={strokeWidth}

			className={className}
			style={iconStyle} // Применяем все стили, переданные через style
			role="img"
			aria-hidden="true"
		>
			<path d={pathData} />
		</svg>
	);
};

export default CustomIcon;
