export type JobEconomicsInput = {
  providerPayout: number;
  fixedDirectCost: number;
  reserveRate: number;
  paymentRate: number;
  acquisitionRate: number;
  targetMarginRate: number;
  minimumContribution: number;
  ownerMinutes: number;
  ownerHourlyValue: number;
  vatRate: number;
};

export function calculateJobEconomics(input: JobEconomicsInput) {
  const variableRate = input.reserveRate + input.paymentRate + input.acquisitionRate;
  const marginDenominator = Math.max(0.01, 1 - variableRate - input.targetMarginRate);
  const costDenominator = Math.max(0.01, 1 - variableRate);
  const netPrice = Math.max(
    (input.providerPayout + input.fixedDirectCost) / marginDenominator,
    (input.providerPayout + input.fixedDirectCost + input.minimumContribution) / costDenominator,
  );
  const reserve = netPrice * input.reserveRate;
  const payment = netPrice * input.paymentRate;
  const acquisition = netPrice * input.acquisitionRate;
  const contributionBeforeOwner = netPrice - input.providerPayout - input.fixedDirectCost - reserve - payment - acquisition;
  const ownerCost = (input.ownerMinutes / 60) * input.ownerHourlyValue;
  const contributionAfterOwner = contributionBeforeOwner - ownerCost;
  const contributionAfterOwnerRate = netPrice ? contributionAfterOwner / netPrice : 0;
  return {
    netPrice,
    grossPrice: netPrice * (1 + input.vatRate),
    reserve,
    payment,
    acquisition,
    contributionBeforeOwner,
    contributionAfterOwner,
    contributionBeforeOwnerRate: netPrice ? contributionBeforeOwner / netPrice : 0,
    contributionAfterOwnerRate,
    providerShare: netPrice ? input.providerPayout / netPrice : 0,
    healthy: contributionBeforeOwner >= input.minimumContribution && contributionAfterOwnerRate >= 0.08,
  };
}

export function calculatePartnerRevenue(monthlyFee: number, completedReferrals: number, feePerReferral: number, vatRate: number) {
  const net = monthlyFee + completedReferrals * feePerReferral;
  return { net, vat: net * vatRate, gross: net * (1 + vatRate) };
}
