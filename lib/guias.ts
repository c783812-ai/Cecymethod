import { dinero, type Moneda } from "./pagos";

export type Guia = { id: string; titulo: string; descripcion: string | null; precio_eur: number; precio_usd: number; precio_mxn: number; gratis: boolean; activa: boolean; orden: number; storage_path: string | null };
export type Compra = { id: string; guia_id: string; nombre: string; email: string; telefono: string | null; moneda: Moneda; monto: number; estado: "pendiente" | "pagada"; token: string; descargas: number; created_at: string; pagada_at: string | null };

export const precioDe = (g: Guia, m: Moneda) => Number(m === "EUR" ? g.precio_eur : m === "USD" ? g.precio_usd : g.precio_mxn);
export const preciosTexto = (g: Guia) => (g.gratis ? "Gratis" : [dinero(Number(g.precio_eur), "EUR"), dinero(Number(g.precio_usd), "USD"), dinero(Number(g.precio_mxn), "MXN")].join(" · "));
export const SITIO = "https://cecymethod.com";
export const linkDescarga = (token: string) => `${SITIO}/descarga/${token}`;

/** Mensaje de WhatsApp para mandarle su guía. */
export const mensajeGuia = (c: Pick<Compra, "nombre" | "token">, titulo: string) =>
  `Hola ${c.nombre.split(" ")[0]} 💛 Gracias por tu compra. Aquí descargas tu guía “${titulo}”: ${linkDescarga(c.token)}\nGuárdala en tu teléfono. Cualquier duda, aquí estoy.`;
