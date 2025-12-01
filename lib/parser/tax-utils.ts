/**
 * Tax extraction utilities for SRI documents
 */

import type { TotalImpuesto } from "@/types/sri-xml";
import { parseMoneyToCents } from "@/lib/parser/normalizers";
import { SRI_TAX_TYPE, SRI_IVA_RATE } from "@/constants/sri-codes";

/**
 * Tax totals extracted from SRI documents
 */
export interface TaxTotals {
  iva0: number;
  iva12: number;
  iva15: number;
  ivaTotal: number;
  iceTotal: number;
  irbpnrTotal: number;
}

/**
 * Extract tax totals from SRI document totals
 */
export function extractTaxTotals(totales: TotalImpuesto[]): TaxTotals {
  let iva0 = 0;
  let iva12 = 0;
  let iva15 = 0;
  let ivaTotal = 0;
  let iceTotal = 0;
  let irbpnrTotal = 0;

  for (const impuesto of totales) {
    const baseImponible = parseMoneyToCents(impuesto.baseImponible);
    const valor = parseMoneyToCents(impuesto.valor);

    switch (impuesto.codigo) {
      case SRI_TAX_TYPE.IVA:
        ivaTotal += valor;

        switch (impuesto.codigoPorcentaje) {
          case SRI_IVA_RATE.ZERO:
          case SRI_IVA_RATE.NO_OBJETO:
          case SRI_IVA_RATE.EXENTO:
            iva0 += baseImponible;
            break;
          case SRI_IVA_RATE.TWELVE:
            iva12 += baseImponible;
            break;
          case SRI_IVA_RATE.FOURTEEN:
          case SRI_IVA_RATE.FIFTEEN:
            iva15 += baseImponible;
            break;
        }

        break;
      case SRI_TAX_TYPE.ICE:
        iceTotal += valor;
        break;
      case SRI_TAX_TYPE.IRBPNR:
        irbpnrTotal += valor;
        break;
    }
  }

  return { iva0, iva12, iva15, ivaTotal, iceTotal, irbpnrTotal };
}
