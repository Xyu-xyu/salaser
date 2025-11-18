import React from "react";

interface CustomIconProps {
  size?: number;        // размер иконки
  color?: string;       // цвет обводки
  strokeWidth?: number; // толщина линии
}

const LaserIncut: React.FC<CustomIconProps> = ({
  size = 36,
  color = "white",
  strokeWidth = 1.5,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      width={size}
      height={size}
      viewBox="0 0 36 36"
    >
      <path
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        d="M16 21 L8 24 L19 28 L30 24 L22 21 M15 9V18L19 23 23 18V17L15 17M23 9V18L19 23 "
      />
    </svg>
  );
};

export default LaserIncut;
