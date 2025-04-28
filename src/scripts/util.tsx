class Utils {
    // Метод для преобразования полярных координат в декартовы
    polarToCartesian(radius: number, angle: number, center:{x:number, y:number}={x:50, y:50}) {
        const rad = (angle - 90) * (Math.PI / 180); // SVG 0° вверх
		return {
			x: center.x + radius * Math.cos(rad),
			y: center.y + radius * Math.sin(rad),
		};
    }

    // Метод для получения пути
    getPath(
        selectedMacros: number,
        minimum: number,
        maximum: number,
        sweepAngle: number,
        r1: number,
        r2: number,
        startAngle: number
    ): string {
        const percentage = (selectedMacros - minimum) / (maximum - minimum);
        const angle = sweepAngle * percentage;

        const startOuter = this.polarToCartesian(r2, startAngle);
        const endOuter = this.polarToCartesian(r2, startAngle + angle);
        const startInner = this.polarToCartesian(r1, startAngle);
        const endInner = this.polarToCartesian(r1, startAngle + angle);

        // Определяем, нужен ли флаг large-arc (больше 180°)
        const largeArcFlag = angle > 180 ? 1 : 0;

        const arcOuter = `A ${r2} ${r2} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`;
        const arcInner = `A ${r1} ${r1} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`;

        // Возвращаем замкнутый сектор
        return `
            M ${startOuter.x} ${startOuter.y}
            ${arcOuter}
            L ${endInner.x} ${endInner.y}
            ${arcInner}
            Z
        `;
    }

    getTicks(
        minimum: number,
        maximum: number,
        stepBig: number,
        r1: number,
        r2: number
    ) {
        const totalSteps = Math.floor((maximum - minimum) / stepBig);
        const anglePerStep = 270 / totalSteps;
        const startAngle = 225;
        const endAngle = startAngle + 270;

        // Построение кольцевого сегмента от 225° до 135°
        const startOuter = this.polarToCartesian(r2, startAngle);
        const endOuter = this.polarToCartesian(r2, endAngle);
        const startInner = this.polarToCartesian(r1, endAngle);
        const endInner = this.polarToCartesian(r1, startAngle);

        const ringPath = `
                M ${startOuter.x} ${startOuter.y}
                A ${r2} ${r2} 0 1 1 ${endOuter.x} ${endOuter.y}
                L ${startInner.x} ${startInner.y}
                A ${r1} ${r1} 0 1 0 ${endInner.x} ${endInner.y}
                Z
            `;

        const ticks = Array.from({ length: totalSteps + 1 }).map((_, i) => {
            const angle = startAngle + i * anglePerStep;
            const r = (r1 + r2) / 2;
            const pos = this.polarToCartesian(r, angle);

            return (
                <circle
                    key={i}
                    cx={pos.x}
                    cy={pos.y}
                    r={1}
                    fill={'#aaa'}
                />
            );
        });

        return (
            <>
                {/* Кольцевая дуга */}
                <path
                    d={ringPath}
                    fill="rgba(0,0,0,0.05)"
                />

                {/* Декоративные точки */}
                {ticks}
            </>
        );
    }
}

const utils = new Utils();
export default utils;