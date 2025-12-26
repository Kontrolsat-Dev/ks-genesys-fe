// src/helpers/priceRounding.ts
// Funções centralizadas de arredondamento de preços

/**
 * Taxa de IVA em Portugal
 */
export const VAT_RATE = 0.23;

/**
 * Arredonda preço com IVA para .40 ou .90 (o mais próximo)
 * 
 * Regra:
 * - cents <= 0.15 → .90 do euro anterior
 * - cents <= 0.65 → .40
 * - cents > 0.65  → .90
 * 
 * @param priceWithVat Preço com IVA incluído
 * @returns Preço arredondado com IVA
 */
export function roundToPrettyPrice(priceWithVat: number): number {
  const euros = Math.floor(priceWithVat);
  const cents = priceWithVat - euros;

  if (cents <= 0.15) {
    // Mais perto do .90 do euro anterior
    return euros > 0 ? euros - 1 + 0.90 : 0.40;
  } else if (cents <= 0.65) {
    // Mais perto de .40
    return euros + 0.40;
  } else {
    // Mais perto de .90
    return euros + 0.90;
  }
}

/**
 * Calcula preço com margem e arredondamento
 * 
 * @param basePrice Preço base (custo)
 * @param marginDecimal Margem em decimal (0.25 = 25%)
 * @param withVat Se deve aplicar IVA e arredondamento
 * @returns Preço calculado
 */
export function calculatePriceWithRounding(
  basePrice: number,
  marginDecimal: number,
  withVat: boolean
): number {
  const priceWithMargin = basePrice * (1 + marginDecimal);
  
  if (withVat) {
    const priceWithVat = priceWithMargin * (1 + VAT_RATE);
    return roundToPrettyPrice(priceWithVat);
  }
  
  return priceWithMargin;
}

/**
 * Calcula preview completo do preço com arredondamento
 * 
 * @param cost Custo base
 * @param marginPercent Margem em percentagem (ex: 25 para 25%)
 * @returns Objeto com todos os valores calculados
 */
export function calculatePricePreview(cost: number, marginPercent: number) {
  const marginDecimal = marginPercent / 100;
  const rawPrice = cost * (1 + marginDecimal);
  const rawPriceVat = rawPrice * (1 + VAT_RATE);
  const roundedVat = roundToPrettyPrice(rawPriceVat);
  const finalPrice = roundedVat / (1 + VAT_RATE);

  return {
    rawPrice,
    rawPriceVat,
    roundedVat,
    finalPrice,
  };
}
