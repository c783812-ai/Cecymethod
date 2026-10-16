"use client";
import { useEffect, useRef, useState } from "react";
import { TESTIMONIOS } from "@/lib/testimonios";

/** Carrusel de reseñas: se desliza con el dedo y avanza solo cada 6 s, en loop. */
export default function Testimonios() {
  const pista = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const pausa = useRef(false);
  const [abierta, setAbierta] = useState<string | null>(null);

  const ir = (i: number) => {
    const el = pista.current;
    if (!el) return;
    const n = TESTIMONIOS.length;
    const idx = ((i % n) + n) % n;
    const card = el.children[idx] as HTMLElement | undefined;
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const alMover = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      let mejor = 0;
      let dist = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - el.offsetLeft - el.scrollLeft);
        if (d < dist) { dist = d; mejor = i; }
      });
      setActual(mejor);
    };
    el.addEventListener("scroll", alMover, { passive: true });
    return () => el.removeEventListener("scroll", alMover);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => { if (!pausa.current) ir(actual + 1); }, 6000);
    return () => clearInterval(t);
  }, [actual]);

  const pausar = (v: boolean) => () => { pausa.current = v; };

  return (
    <div className="carrusel" onPointerDown={pausar(true)} onPointerUp={pausar(false)} onMouseEnter={pausar(true)} onMouseLeave={pausar(false)} onTouchStart={pausar(true)} onTouchEnd={pausar(false)}>
      <div className="pista" ref={pista}>
        {TESTIMONIOS.map((t) => (
          <figure key={t.nombre} className="testi" lang={t.ingles ? "en" : undefined}>
            <blockquote className={t.texto.length > 220 && abierta !== t.nombre ? "corto" : undefined}>{t.texto}</blockquote>
            {t.texto.length > 220 && (
              <button type="button" className="leer" onClick={() => { pausa.current = abierta !== t.nombre; setAbierta(abierta === t.nombre ? null : t.nombre); }}>
                {abierta === t.nombre ? "Leer menos" : "Leer más"}
              </button>
            )}
            <figcaption><b>{t.nombre}</b> · {t.tema}</figcaption>
          </figure>
        ))}
      </div>
      <div className="puntos" aria-label="Reseñas">
        {TESTIMONIOS.map((t, i) => (
          <button key={t.nombre} type="button" aria-label={`Reseña ${i + 1}`} aria-current={i === actual} onClick={() => ir(i)} />
        ))}
      </div>
    </div>
  );
}
