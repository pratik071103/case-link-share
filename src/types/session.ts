// API Response Types
export interface ApiActivity {
  key: string;
  name: string;
  objective: string;
  instructions: string;
  materials: string;
  level: number;
  levelScore: number;
  fTarget: string;
  fTargetValue: number;
  iTarget: string;
  iTargetValue: number;
  sTarget: string;
  sTargetValue: number;
}

export interface ApiIndicator {
  indicatorName: string;
  activities: ApiActivity[];
}

export interface ApiSkill {
  skillName: string;
  indicators: ApiIndicator[];
}

export interface AssessmentData {
  success: boolean;
  user?: {
    name: string;
    parentName: string;
    ageGroup: string;
    gender: string;
  };
  skills: ApiSkill[];
  rawActivitiesCount: number;
  expertActivitiesCount: number;
}

// Session Detail Types
export interface SessionDetail {
  id: string;
  child_id: string;
  session_no: number;
  session_date: string;
  session_type: string;
  attendance: 'present' | 'absent' | 'late' | 'excused' | null;
  session_report_url: string | null;
  session_link_url: string | null;
  gemini_summary_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillEntry {
  id?: string;
  session_id?: string;
  skill_order: number;
  is_manual: boolean;
  
  // API-derived fields
  skill_name: string;
  indicator_name: string;
  activity_name: string;
  activity_objective: string;
  activity_instructions: string;
  activity_materials: string;
  activity_level: number;
  activity_level_score: number;
  target_f: string;
  target_f_value: number;
  target_i: string;
  target_i_value: number;
  target_s: string;
  target_s_value: number;
  
  // Manual entry fields
  icebreaker: string;
  incident_no: number | null;
  activity_impact_score: number | null;
  actual_f: string;
  actual_f_value: number | null;
  actual_i: string;
  actual_i_value: number | null;
  actual_s: string;
  actual_s_value: number | null;
  fist_remarks: string;
  indicator_score_growth: number | null;
  ksa_weightage: number | null;
  ksa_growth_percent: number | null;
  other_observations: string;
  
  // Calculated fields
  target_cutoff: number | null;
  actual_cutoff: number | null;
  fist_achieved_percent: number | null;
  indicator_score_calculation: number | null;
  ksa_score_calculation: number | null;
}

// Default empty skill entry
export const createEmptySkillEntry = (order: number, isManual = false): SkillEntry => ({
  skill_order: order,
  is_manual: isManual,
  skill_name: '',
  indicator_name: '',
  activity_name: '',
  activity_objective: '',
  activity_instructions: '',
  activity_materials: '',
  activity_level: 0,
  activity_level_score: 0,
  target_f: '',
  target_f_value: 0,
  target_i: '',
  target_i_value: 0,
  target_s: '',
  target_s_value: 0,
  icebreaker: '',
  incident_no: null,
  activity_impact_score: null,
  actual_f: '',
  actual_f_value: null,
  actual_i: '',
  actual_i_value: null,
  actual_s: '',
  actual_s_value: null,
  fist_remarks: '',
  indicator_score_growth: null,
  ksa_weightage: null,
  ksa_growth_percent: null,
  other_observations: '',
  target_cutoff: null,
  actual_cutoff: null,
  fist_achieved_percent: null,
  indicator_score_calculation: null,
  ksa_score_calculation: null,
});
