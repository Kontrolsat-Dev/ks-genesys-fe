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
 * Calcula preview completo do preço com arredondamento
 * 
 * Fórmula: (custo × (1 + margem)) + ecotax + taxas → arredondar c/ IVA
 * 
 * @param cost Custo base
 * @param marginPercent Margem em percentagem (ex: 25 para 25%)
 * @param ecotax Ecotax a adicionar
 * @param extraFees Taxas adicionais a adicionar
 * @returns Objeto com todos os valores calculados
 */
export function calculatePricePreview(
  cost: number,
  marginPercent: number,
  ecotax: number = 0,
  extraFees: number = 0
) {
  const marginDecimal = marginPercent / 100;
  
  // Preço com margem (sem ecotax/taxas)
  const priceWithMargin = cost * (1 + marginDecimal);
  
  // Preço bruto sem IVA = margem + eco + taxas
  const rawPriceNoVat = priceWithMargin + ecotax + extraFees;
  
  // Preço bruto com IVA
  const rawPriceVat = rawPriceNoVat * (1 + VAT_RATE);
  
  // Arredondar para .40/.90 com IVA
  const roundedVat = roundToPrettyPrice(rawPriceVat);
  
  // Preço final sem IVA (para enviar ao PrestaShop)
  const finalPriceNoVat = roundedVat / (1 + VAT_RATE);

  return {
    // Valores base
    cost: round2(cost),
    priceWithMargin: round2(priceWithMargin),
    ecotax: round2(ecotax),
    extraFees: round2(extraFees),
    
    // Valores brutos (antes de arredondamento)
    rawPriceNoVat: round2(rawPriceNoVat),
    rawPriceVat: round2(rawPriceVat),
    
    // Valores arredondados
    roundedVat,
    finalPriceNoVat: round2(finalPriceNoVat),
    
    // Diferença do arredondamento
    roundingDiff: round2(roundedVat - rawPriceVat),
  };
}

/** Arredonda para 2 casas decimais */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
