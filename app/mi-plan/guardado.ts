"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/** De quién es la app abierta y si se guarda en su cuenta (no en la vista previa de Cecy ni en el demo). */
export const Cuenta = createContext<{ pid: string; remoto: boolean }>({ pid: "demo", remoto: false });
export const useCuenta = () => useContext(Cuenta);

/**
 * Un objeto que se guarda en el teléfono y, si ya entró con su cuenta, también en la página
 * (para no perderlo si borra el acceso o cambia de celular). `semilla` trae lo que tenía guardado antes con otro nombre.
 */
export function useGuardado<T extends object>(clave: string, pid: string, remoto: boolean, semilla?: () => T) {
  const [v, setV] = useState<T>({} as T);
  useEffect(() => {
    let l = {} as T;
    try {
      const g = localStorage.getItem(clave);
      l = g ? JSON.parse(g) : (semilla?.() ?? ({} as T));
    } catch {}
    setV(l);
    if (!remoto) return;
    supabaseBrowser().from("preferencias").select("data").eq("patient_id", pid).eq("clave", clave).maybeSingle().then(({ data, error }) => {
      if (error) return;
      if (data) { setV(data.data as T); try { localStorage.setItem(clave, JSON.stringify(data.data)); } catch {} }
      else if (Object.keys(l).length) subir(l); // lo que ya tenía solo en su teléfono se sube la primera vez
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, pid, remoto]);
  const subir = (n: T) => { if (remoto) supabaseBrowser().from("preferencias").upsert({ patient_id: pid, clave, data: n, updated_at: new Date().toISOString() }).then(() => {}); };
  const cambiar = (f: (old: T) => T) =>
    setV((old) => {
      const n = f(old);
      try { localStorage.setItem(clave, JSON.stringify(n)); } catch {}
      subir(n);
      return n;
    });
  return [v, cambiar] as const;
}

/** Igual, pero toma la cuenta del contexto. */
export function useGuardadoCuenta<T extends object>(clave: string, semilla?: () => T) {
  const { pid, remoto } = useCuenta();
  return useGuardado<T>(clave, pid, remoto, semilla);
}

type Ajustes = { pais?: string; sinlactosa?: boolean; unidad?: "kg" | "lb"; stats?: "semana" | "mes"; superModo?: string; guia?: boolean };
const AJUSTES_VIEJOS = (): Ajustes => {
  const a: Ajustes = {};
  try {
    const pais = localStorage.getItem("pais"); if (pais) a.pais = pais;
    if (localStorage.getItem("sinlactosa") === "1") a.sinlactosa = true;
    const u = localStorage.getItem("unidad"); if (u === "kg" || u === "lb") a.unidad = u;
    const s = localStorage.getItem("stats-periodo"); if (s === "semana" || s === "mes") a.stats = s;
    const m = localStorage.getItem("super-modo"); if (m) a.superModo = m;
  } catch {}
  return a;
};

/** Sus elecciones de la app (país, sin lactosa, kg/lb…), guardadas en su cuenta. Un solo objeto para todas las pantallas. */
export const AjustesApp = createContext<readonly [Ajustes, (k: keyof Ajustes, v: Ajustes[keyof Ajustes]) => void]>([{}, () => {}]);
export const useAjustesApp = () => useContext(AjustesApp);
export function useAjustesGuardados(pid: string, remoto: boolean) {
  const [v, cambiar] = useGuardado<Ajustes>(`ajustes-${pid}`, pid, remoto, AJUSTES_VIEJOS);
  const set = (k: keyof Ajustes, x: Ajustes[keyof Ajustes]) => cambiar((o) => ({ ...o, [k]: x }));
  return [v, set] as const;
}
