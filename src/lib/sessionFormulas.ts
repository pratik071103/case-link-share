import type { SkillEntry } from '@/types/session';

/**
 * Calculate Target Cutoff:
 * (target_f_value * target_i_value * 5 * 0.6) + (target_s_value * 0.4)
 */
export function calculateTargetCutoff(entry: SkillEntry): number {
  const f = entry.target_f_value || 0;
  const i = entry.target_i_value || 0;
  const s = entry.target_s_value || 0;
  
  return (f * i * 5 * 0.6) + (s * 0.4);
}

/**
 * Calculate Actual Cutoff:
 * (actual_f_value * actual_i_value * 5 * 0.6) + (target_s_value + (target_s_value - actual_s_value)) * 0.4
 */
export function calculateActualCutoff(entry: SkillEntry): number {
  const targetS = entry.target_s_value || 0;
  const actualF = entry.actual_f_value || 0;
  const actualI = entry.actual_i_value || 0;
  const actualS = entry.actual_s_value || 0;
  
  return (actualF * actualI * 5 * 0.6) + (targetS + (targetS - actualS)) * 0.4;
}

/**
 * Calculate % FIST Achieved:
 * (actual_cutoff / target_cutoff) * 100
 */
export function calculateFistAchievedPercent(entry: SkillEntry): number {
  const targetCutoff = calculateTargetCutoff(entry);
  const actualCutoff = calculateActualCutoff(entry);
  
  if (targetCutoff === 0) return 0;
  return (actualCutoff / targetCutoff) * 100;
}

/**
 * Calculate Indicator Score:
 * (1 - (target_cutoff - actual_cutoff)/10) * activity_impact_score * activity_level_score
 */
export function calculateIndicatorScore(entry: SkillEntry): number {
  const targetCutoff = calculateTargetCutoff(entry);
  const actualCutoff = calculateActualCutoff(entry);
  const impactScore = entry.activity_impact_score || 0;
  const levelScore = entry.activity_level_score || 0;
  
  return (1 - (targetCutoff - actualCutoff) / 10) * impactScore * levelScore;
}

/**
 * Calculate KSA Score:
 * (indicator_score_calculation * ksa_weightage) / 10
 */
export function calculateKsaScore(entry: SkillEntry): number {
  const indicatorScore = calculateIndicatorScore(entry);
  const ksaWeightage = entry.ksa_weightage || 0;
  
  return (indicatorScore * ksaWeightage) / 10;
}

/**
 * Update all calculated fields for a skill entry
 */
export function updateCalculatedFields(entry: SkillEntry): SkillEntry {
  return {
    ...entry,
    target_cutoff: calculateTargetCutoff(entry),
    actual_cutoff: calculateActualCutoff(entry),
    fist_achieved_percent: calculateFistAchievedPercent(entry),
    indicator_score_calculation: calculateIndicatorScore(entry),
    ksa_score_calculation: calculateKsaScore(entry),
  };
}
