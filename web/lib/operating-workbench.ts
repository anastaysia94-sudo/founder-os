import type { EvidenceClass, EvidenceLink } from './fdos';

export type FinancialAssumptionKind = 'Revenue' | 'Cost' | 'Price' | 'Margin' | 'Cash' | 'Funding' | 'Other';

export type FinancialAssumption = {
  id: string;
  title: string;
  kind: FinancialAssumptionKind;
  value: string;
  confidence: number;
  evidence: EvidenceClass;
  createdAt?: string;
} & EvidenceLink;

export type OfferStatus = 'Draft' | 'Testing' | 'Active' | 'Retired';

export type OfferHypothesis = {
  id: string;
  name: string;
  customer: string;
  problem: string;
  promise: string;
  delivery: string;
  price: string;
  status: OfferStatus;
  evidence: EvidenceClass;
  createdAt?: string;
} & EvidenceLink;

export type InitiativeStatus = 'Planned' | 'Active' | 'Blocked' | 'Done';

export type Initiative = {
  id: string;
  title: string;
  outcome: string;
  status: InitiativeStatus;
  priority: number;
  owner: string;
  dueDate?: string;
  evidence: EvidenceClass;
  createdAt?: string;
} & EvidenceLink;

export type OperatingWorkbenchRecord = {
  financialAssumptions: FinancialAssumption[];
  offers: OfferHypothesis[];
  initiatives: Initiative[];
};

export const blankOperatingWorkbench: OperatingWorkbenchRecord = {
  financialAssumptions: [],
  offers: [],
  initiatives: [],
};

export function getOperatingSignals(workbench: OperatingWorkbenchRecord, revenueModel: string) {
  const assumptions = workbench.financialAssumptions;
  const offers = workbench.offers;
  const initiatives = workbench.initiatives;
  const highConfidenceAssumptions = assumptions.filter((item) => item.confidence >= 70).length;
  const testingOffers = offers.filter((item) => item.status === 'Testing').length;
  const activeOffers = offers.filter((item) => item.status === 'Active').length;
  const activeInitiatives = initiatives.filter((item) => item.status === 'Active').length;
  const blockedInitiatives = initiatives.filter((item) => item.status === 'Blocked').length;

  const moneyScore = Math.min(100, (revenueModel.trim() ? 35 : 0) + Math.min(45, assumptions.length * 15) + Math.min(20, highConfidenceAssumptions * 10));
  const offerScore = Math.min(100, Math.min(60, offers.length * 20) + Math.min(25, testingOffers * 15) + Math.min(35, activeOffers * 20));
  const executionScore = Math.min(100, Math.min(45, initiatives.length * 10) + Math.min(35, activeInitiatives * 15) + Math.min(20, initiatives.filter((item) => item.status === 'Done').length * 10) - Math.min(25, blockedInitiatives * 10));

  return {
    moneyScore: Math.max(0, moneyScore),
    offerScore: Math.max(0, offerScore),
    executionScore: Math.max(0, executionScore),
    highConfidenceAssumptions,
    testingOffers,
    activeOffers,
    activeInitiatives,
    blockedInitiatives,
  };
}
