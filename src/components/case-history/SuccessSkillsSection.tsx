import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2, Check, Trophy } from 'lucide-react';

interface SuccessSkills {
  creativity: number;
  creativity_notes: string;
  problem_solving: number;
  problem_solving_notes: string;
  decision_making: number;
  decision_making_notes: string;
  collaboration: number;
  collaboration_notes: string;
  initiative: number;
  initiative_notes: string;
  responsibility: number;
  responsibility_notes: string;
}

interface SuccessSkillsSectionProps {
  data: SuccessSkills;
  onChange: (data: SuccessSkills) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

function RatingSlider({ 
  value, 
  onChange, 
  label 
}: { 
  value: number; 
  onChange: (val: number) => void; 
  label: string; 
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium bg-primary/10 px-2 py-0.5 rounded">{value}/5</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={5}
        step={1}
        className="w-full"
      />
    </div>
  );
}

export function SuccessSkillsSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: SuccessSkillsSectionProps) {
  const handleChange = (field: keyof SuccessSkills, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const skills = [
    { key: 'creativity' as const, label: 'Creativity', desc: 'To come up with ideas or solutions on their own' },
    { key: 'problem_solving' as const, label: 'Problem Solving Abilities', desc: '' },
    { key: 'decision_making' as const, label: 'Decision Making Abilities', desc: '' },
    { key: 'collaboration' as const, label: 'Collaboration', desc: 'Can collaborate with peers in tasks or group activities' },
    { key: 'initiative' as const, label: 'Initiative', desc: 'Takes initiative to do things' },
    { key: 'responsibility' as const, label: 'Responsibility & Accountability', desc: '' },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Success Skills Profile</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : hasChanges ? (
              <>
                <Check className="h-3 w-3 text-primary" />
                <span className="text-primary">Saved</span>
              </>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Rate on a scale of 0-5 (0 being lowest, 5 being highest)
        </p>
      </CardHeader>
      <CardContent className="pt-4 grid gap-4 md:grid-cols-2">
        {skills.map((skill) => (
          <div key={skill.key} className="space-y-3 p-4 border rounded-lg">
            <div>
              <Label>{skill.label}</Label>
              {skill.desc && (
                <p className="text-xs text-muted-foreground">{skill.desc}</p>
              )}
            </div>
            <RatingSlider
              value={data[skill.key] || 0}
              onChange={(v) => handleChange(skill.key, v)}
              label="Rating"
            />
            <Textarea
              value={data[`${skill.key}_notes` as keyof SuccessSkills] as string || ''}
              onChange={(e) => handleChange(`${skill.key}_notes` as keyof SuccessSkills, e.target.value)}
              placeholder="Additional notes..."
              className="min-h-[60px]"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
