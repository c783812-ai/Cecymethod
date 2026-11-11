// Cuentas de Cecy para recibir transferencias (ella pidió que se vean en la página). El comprobante se manda por WhatsApp.
export type Cuenta = { pais: string; bandera: string; moneda: string; filas: [string, string][] };

export const CUENTAS: Cuenta[] = [
  {
    pais: "Alemania (euros)", bandera: "🇩🇪", moneda: "EUR",
    filas: [["Titular", "YOKEBED CECILIA RIVERA ALAMILLO"], ["IBAN", "DE53 1001 1001 2412 0503 30"], ["BIC", "NTSBDEB1XXX"]],
  },
  {
    pais: "México (pesos)", bandera: "🇲🇽", moneda: "MXN",
    filas: [["Beneficiaria", "Yokebed Cecilia Rivera Alamillo"], ["CLABE", "170180019783335011"], ["Banco", "Revolut Bank, S.A., Institución de Banca Múltiple"]],
  },
];

/** Si la paciente tiene Revolut, puede pagar directo con este link. */
export const REVOLUT = "https://revolut.me/yokebedcecilia";
