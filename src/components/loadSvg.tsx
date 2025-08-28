import React, { useEffect, useState } from "react";
import SampleSvg from "./../store/sampleSvg";

const LoadSvg: React.FC = () => {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(); // ⏳ прерываем запрос через 2 сек
      setSvg(SampleSvg);  // fallback
    }, 2000);

    fetch("http://192.168.11.246/gcore/0/preview.svg", {
      signal: controller.signal,
    })
      .then((r) => r.text())
      .then((data) => {
        clearTimeout(timeoutId); // ответ успел прийти → отменяем таймер
        if (data) {
          setSvg(data);
        }/*  else {
          setSvg(SampleSvg);
        } */
      })
      .catch((e) => {
        console.error("Ошибка загрузки SVG:", e);
        clearTimeout(timeoutId);
        //setSvg(SampleSvg);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (!svg) return <div>Загрузка…</div>;

  return (
    <div
      id="workarea"
      className="planMain"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default LoadSvg;
