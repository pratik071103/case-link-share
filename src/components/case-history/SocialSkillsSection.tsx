import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2, Check, Users } from 'lucide-react';

interface SocialSkills {
  shy_interaction: string;
  interact_kids: number;
  interact_kids_notes: string;
  interact_adults: number;
  interact_adults_notes: string;
  presentations: number;
  presentations_notes: string;
  expresses_thoughts: number;
  expresses_thoughts_notes: string;
}

interface SocialSkillsSectionProps {
  data: SocialSkills;
  onChange: (data: SocialSkills) => void;
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

export function SocialSkillsSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: SocialSkillsSectionProps) {
  const handleChange = (field: keyof SocialSkills, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Social Skills Profile</CardTitle>
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
      <CardContent className="pt-4 grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="shy">Is the Child Usually Shy to Interact with Others?</Label>
          <Textarea
            id="shy"
            value={data.shy_interaction || ''}
            onChange={(e) => handleChange('shy_interaction', e.target.value)}
            placeholder="Describe observations..."
            className="min-h-[80px]"
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 p-4 border rounded-lg">
            <Label>Able to Interact Comfortably with Other Kids</Label>
            <RatingSlider
              value={data.interact_kids || 0}
              onChange={(v) => handleChange('interact_kids', v)}
              label="Rating"
            />
            <Textarea
              value={data.interact_kids_notes || ''}
              onChange={(e) => handleChange('interact_kids_notes', e.target.value)}
              placeholder="Additional notes..."
              className="min-h-[60px]"
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <Label>Able to Interact Comfortably with Adults</Label>
            <RatingSlider
              value={data.interact_adults || 0}
              onChange={(v) => handleChange('interact_adults', v)}
              label="Rating"
            />
            <Textarea
              value={data.interact_adults_notes || ''}
              onChange={(e) => handleChange('interact_adults_notes', e.target.value)}
              placeholder="Additional notes..."
              className="min-h-[60px]"
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <Label>Can Do Presentations Confidently</Label>
            <RatingSlider
              value={data.presentations || 0}
              onChange={(v) => handleChange('presentations', v)}
              label="Rating"
            />
            <Textarea
              value={data.presentations_notes || ''}
              onChange={(e) => handleChange('presentations_notes', e.target.value)}
              placeholder="Additional notes..."
              className="min-h-[60px]"
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <Label>Expresses Thoughts, Ideas, Feelings Clearly</Label>
            <RatingSlider
              value={data.expresses_thoughts || 0}
              onChange={(v) => handleChange('expresses_thoughts', v)}
              label="Rating"
            />
            <Textarea
              value={data.expresses_thoughts_notes || ''}
              onChange={(e) => handleChange('expresses_thoughts_notes', e.target.value)}
              placeholder="Additional notes..."
              className="min-h-[60px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
