import React from "react";

interface CustomIconProps {
  size?: number;        // размер иконки
  color?: string;       // цвет обводки
  strokeWidth?: number; // толщина линии
}

const LaserComplete: React.FC<CustomIconProps> = ({
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
        d="M30 24 19 20 8 24 19 28 30 24M25 16 27 19 30 12"
      />
    </svg>
  );
};

export default LaserComplete;
