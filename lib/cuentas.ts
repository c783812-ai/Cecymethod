// Cuentas de Cecy para recibir transferencias (ella pidió que se vean en la página). El comprobante se manda por WhatsApp.
export type Cuenta = { pais: string; bandera: string; moneda: string; filas: [string, string][] };

export const CUENTAS: Cuenta[] = [
  {
    pais: "Alemania (euros)", bandera: "🇩🇪", moneda: "EUR",
    filas: [["Titular", "YOKEBED CECILIA RIVERA ALAMILLO"], ["IBAN", "DE53 1001 1001 2412 0503 30"], ["BIC", "NTSBDEB1XXX"]],
  },
  // México: pendiente, Cecy la manda.
];
