import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { SkillEntry, ApiSkill, ApiIndicator, ApiActivity } from '@/types/session';
import { updateCalculatedFields } from '@/lib/sessionFormulas';

interface SkillCardProps {
  entry: SkillEntry;
  skills: ApiSkill[];
  onChange: (entry: SkillEntry) => void;
  onRemove?: () => void;
  order: number;
}

export function SkillCard({ entry, skills, onChange, onRemove, order }: SkillCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [localEntry, setLocalEntry] = useState<SkillEntry>(entry);

  // Sync with parent
  useEffect(() => {
    setLocalEntry(entry);
  }, [entry]);

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(localEntry) !== JSON.stringify(entry)) {
        onChange(updateCalculatedFields(localEntry));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localEntry, entry, onChange]);

  const updateField = useCallback(<K extends keyof SkillEntry>(field: K, value: SkillEntry[K]) => {
    setLocalEntry(prev => ({ ...prev, [field]: value }));
  }, []);

  // Get indicators for selected skill
  const selectedSkill = skills.find(s => s.skillName === localEntry.skill_name);
  const indicators = selectedSkill?.indicators || [];

  // Get activities for selected indicator
  const selectedIndicator = indicators.find(i => i.indicatorName === localEntry.indicator_name);
  const activities = selectedIndicator?.activities || [];

  // Handle skill change
  const handleSkillChange = (skillName: string) => {
    const skill = skills.find(s => s.skillName === skillName);
    setLocalEntry(prev => ({
      ...prev,
      skill_name: skillName,
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
    }));
  };

  // Handle indicator change
  const handleIndicatorChange = (indicatorName: string) => {
    setLocalEntry(prev => ({
      ...prev,
      indicator_name: indicatorName,
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
    }));
  };

  // Handle activity selection - auto-populate fields
  const handleActivityChange = (activityName: string) => {
    const activity = activities.find(a => a.name === activityName);
    if (activity) {
      setLocalEntry(prev => ({
        ...prev,
        activity_name: activityName,
        activity_objective: activity.objective,
        activity_instructions: activity.instructions,
        activity_materials: activity.materials,
        activity_level: activity.level,
        activity_level_score: activity.levelScore,
        target_f: activity.fTarget,
        target_f_value: activity.fTargetValue,
        target_i: activity.iTarget,
        target_i_value: activity.iTargetValue,
        target_s: activity.sTarget,
        target_s_value: activity.sTargetValue,
      }));
    }
  };

  return (
    <Card className="border-primary/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <CardTitle className="text-base font-semibold text-primary">
                Skill {order} {localEntry.skill_name && `- ${localEntry.skill_name}`}
              </CardTitle>
            </CollapsibleTrigger>
            {onRemove && (
              <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Skill & Indicator & Activity Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Skill</Label>
                {localEntry.is_manual ? (
                  <Input
                    value={localEntry.skill_name}
                    onChange={(e) => updateField('skill_name', e.target.value)}
                    placeholder="Enter skill name"
                  />
                ) : (
                  <Select value={localEntry.skill_name} onValueChange={handleSkillChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map(skill => (
                        <SelectItem key={skill.skillName} value={skill.skillName}>
                          {skill.skillName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Indicator</Label>
                {localEntry.is_manual ? (
                  <Input
                    value={localEntry.indicator_name}
                    onChange={(e) => updateField('indicator_name', e.target.value)}
                    placeholder="Enter indicator"
                  />
                ) : (
                  <Select 
                    value={localEntry.indicator_name} 
                    onValueChange={handleIndicatorChange}
                    disabled={!localEntry.skill_name}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select indicator" />
                    </SelectTrigger>
                    <SelectContent>
                      {indicators.map((ind, idx) => (
                        <SelectItem key={`${ind.indicatorName}-${idx}`} value={ind.indicatorName || `indicator-${idx}`}>
                          {ind.indicatorName || '(No indicator)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Activity Name</Label>
                {localEntry.is_manual ? (
                  <Input
                    value={localEntry.activity_name}
                    onChange={(e) => updateField('activity_name', e.target.value)}
                    placeholder="Enter activity name"
                  />
                ) : (
                  <Select 
                    value={localEntry.activity_name} 
                    onValueChange={handleActivityChange}
                    disabled={!localEntry.indicator_name}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map((act, idx) => (
                        <SelectItem key={`${act.key}-${idx}`} value={act.name}>
                          {act.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* API-Derived Fields (Read-only for non-manual) */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Activity Details (Auto-populated)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Objective</Label>
                  <Textarea
                    value={localEntry.activity_objective}
                    onChange={(e) => localEntry.is_manual && updateField('activity_objective', e.target.value)}
                    readOnly={!localEntry.is_manual}
                    className="min-h-[60px] bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Textarea
                    value={localEntry.activity_instructions}
                    onChange={(e) => localEntry.is_manual && updateField('activity_instructions', e.target.value)}
                    readOnly={!localEntry.is_manual}
                    className="min-h-[60px] bg-background"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Materials</Label>
                  <Input
                    value={localEntry.activity_materials}
                    onChange={(e) => localEntry.is_manual && updateField('activity_materials', e.target.value)}
                    readOnly={!localEntry.is_manual}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Input
                    type="number"
                    value={localEntry.activity_level || ''}
                    onChange={(e) => localEntry.is_manual && updateField('activity_level', Number(e.target.value))}
                    readOnly={!localEntry.is_manual}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Level Score</Label>
                  <Input
                    type="number"
                    value={localEntry.activity_level_score || ''}
                    onChange={(e) => localEntry.is_manual && updateField('activity_level_score', Number(e.target.value))}
                    readOnly={!localEntry.is_manual}
                  />
                </div>
              </div>

              {/* Target F/I/S */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Target F</Label>
                  <Input value={localEntry.target_f} readOnly={!localEntry.is_manual} 
                    onChange={(e) => localEntry.is_manual && updateField('target_f', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>F Value</Label>
                  <Input type="number" value={localEntry.target_f_value || ''} readOnly={!localEntry.is_manual}
                    onChange={(e) => localEntry.is_manual && updateField('target_f_value', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Target I</Label>
                  <Input value={localEntry.target_i} readOnly={!localEntry.is_manual}
                    onChange={(e) => localEntry.is_manual && updateField('target_i', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>I Value</Label>
                  <Input type="number" value={localEntry.target_i_value || ''} readOnly={!localEntry.is_manual}
                    onChange={(e) => localEntry.is_manual && updateField('target_i_value', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Target S</Label>
                  <Input value={localEntry.target_s} readOnly={!localEntry.is_manual}
                    onChange={(e) => localEntry.is_manual && updateField('target_s', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>S Value</Label>
                  <Input type="number" value={localEntry.target_s_value || ''} readOnly={!localEntry.is_manual}
                    onChange={(e) => localEntry.is_manual && updateField('target_s_value', Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Manual Entry Fields */}
            <div className="bg-accent/10 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-accent-foreground">Manual Entry</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Icebreaker</Label>
                  <Input
                    value={localEntry.icebreaker}
                    onChange={(e) => updateField('icebreaker', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Incident No.</Label>
                  <Input
                    type="number"
                    value={localEntry.incident_no || ''}
                    onChange={(e) => updateField('incident_no', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Activity Impact Score</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={localEntry.activity_impact_score || ''}
                    onChange={(e) => updateField('activity_impact_score', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>

              {/* Actual F/I/S */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Actual F</Label>
                  <Input value={localEntry.actual_f} onChange={(e) => updateField('actual_f', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>F Value</Label>
                  <Input type="number" step="0.01" value={localEntry.actual_f_value || ''}
                    onChange={(e) => updateField('actual_f_value', e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Actual I</Label>
                  <Input value={localEntry.actual_i} onChange={(e) => updateField('actual_i', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>I Value</Label>
                  <Input type="number" step="0.01" value={localEntry.actual_i_value || ''}
                    onChange={(e) => updateField('actual_i_value', e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Actual S</Label>
                  <Input value={localEntry.actual_s} onChange={(e) => updateField('actual_s', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>S Value</Label>
                  <Input type="number" step="0.01" value={localEntry.actual_s_value || ''}
                    onChange={(e) => updateField('actual_s_value', e.target.value ? Number(e.target.value) : null)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>FIST Remarks</Label>
                  <Textarea
                    value={localEntry.fist_remarks}
                    onChange={(e) => updateField('fist_remarks', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Indicator Score Growth (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={localEntry.indicator_score_growth || ''}
                    onChange={(e) => updateField('indicator_score_growth', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KSA Weightage</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={localEntry.ksa_weightage || ''}
                    onChange={(e) => updateField('ksa_weightage', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>KSA Growth %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={localEntry.ksa_growth_percent || ''}
                    onChange={(e) => updateField('ksa_growth_percent', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Other Observations</Label>
                  <Textarea
                    value={localEntry.other_observations}
                    onChange={(e) => updateField('other_observations', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Fields (Read-only) */}
            <div className="bg-primary/5 rounded-lg p-4">
              <h4 className="font-medium text-sm text-primary mb-3">Calculated Values</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Target Cutoff</Label>
                  <div className="text-sm font-mono bg-background p-2 rounded border">
                    {localEntry.target_cutoff?.toFixed(4) || '—'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Actual Cutoff</Label>
                  <div className="text-sm font-mono bg-background p-2 rounded border">
                    {localEntry.actual_cutoff?.toFixed(4) || '—'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">% FIST Achieved</Label>
                  <div className="text-sm font-mono bg-background p-2 rounded border">
                    {localEntry.fist_achieved_percent?.toFixed(2) || '—'}%
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Indicator Score</Label>
                  <div className="text-sm font-mono bg-background p-2 rounded border">
                    {localEntry.indicator_score_calculation?.toFixed(4) || '—'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">KSA Score</Label>
                  <div className="text-sm font-mono bg-background p-2 rounded border">
                    {localEntry.ksa_score_calculation?.toFixed(4) || '—'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
