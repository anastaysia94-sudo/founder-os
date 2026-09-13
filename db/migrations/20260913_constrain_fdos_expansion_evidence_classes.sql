-- Keep E1-E8 evidence semantics enforceable at the database boundary.
-- The expanded Finance, Offer, Operations, Strategy, Customer, Distribution,
-- Asset, Scenario, Portfolio and Attention tables were created with evidence
-- defaults but should reject invalid evidence labels from any client.

alter table public.fdos_financial_assumptions
  drop constraint if exists fdos_financial_assumptions_evidence_class_check,
  add constraint fdos_financial_assumptions_evidence_class_check
    check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8'));

alter table public.fdos_offer_hypotheses
  drop constraint if exists fdos_offer_hypotheses_evidence_class_check,
  add constraint fdos_offer_hypotheses_evidence_class_check
    check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8'));

alter table public.fdos_initiatives
  drop constraint if exists fdos_initiatives_evidence_class_check,
  add constraint fdos_initiatives_evidence_class_check
    check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8'));

alter table public.fdos_business_model_elements
  drop constraint if exists fdos_business_model_elements_evidence_class_check,
  add constraint fdos_business_model_elements_evidence_class_check
    check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8'));

alter table public.fdos_customer_insights
  drop constraint if exists fdos_customer_insights_evidence_class_check,
  add constraint fdos_customer_insights_evidence_class_check
    check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8'));

alter table public.fdos_distribution_experiments
  drop constraint if exists fdos_distribution_experiments_evidence_class_check,
  add constraint fdos_distribution_experiments_evidence_class_check
    check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8'));

alter table public.fdos_business_assets
  drop constraint if exists fdos_business_assets_evidence_class_check,
  add constraint fdos_business_assets_evidence_class_check
    check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8'));

alter table public.fdos_scenarios
  drop constraint if exists fdos_scenarios_evidence_class_check,
  add constraint fdos_scenarios_evidence_class_check
    check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8'));

alter table public.fdos_portfolio_theses
  drop constraint if exists fdos_portfolio_theses_evidence_class_check,
  add constraint fdos_portfolio_theses_evidence_class_check
    check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8'));

alter table public.fdos_attention_blocks
  drop constraint if exists fdos_attention_blocks_evidence_class_check,
  add constraint fdos_attention_blocks_evidence_class_check
    check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8'));
