import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check, Heart } from 'lucide-react';

interface EmotionalBehavioral {
  screen_time: string;
  behavioral_concerns: string;
  performance_anxiety: string;
  task_completion: string;
}

interface EmotionalBehavioralSectionProps {
  data: EmotionalBehavioral;
  onChange: (data: EmotionalBehavioral) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function EmotionalBehavioralSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: EmotionalBehavioralSectionProps) {
  const handleChange = (field: keyof EmotionalBehavioral, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Emotional & Behavioural Profile</CardTitle>
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
      </CardHeader>
      <CardContent className="pt-4 grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="screen_time">Average Screen Time per Day (in hours)</Label>
          <Input
            id="screen_time"
            value={data.screen_time || ''}
            onChange={(e) => handleChange('screen_time', e.target.value)}
            placeholder="e.g., 2 hours"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="behavioral">
            Parental Concerns/Challenges
            <span className="block text-xs text-muted-foreground font-normal mt-1">
              Issues like anger, impulsivity, etc. (describe in detail)
            </span>
          </Label>
          <Textarea
            id="behavioral"
            value={data.behavioral_concerns || ''}
            onChange={(e) => handleChange('behavioral_concerns', e.target.value)}
            placeholder="Describe behavioral concerns..."
            className="min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="anxiety">Performance Anxiety, Distraction, etc.</Label>
          <Textarea
            id="anxiety"
            value={data.performance_anxiety || ''}
            onChange={(e) => handleChange('performance_anxiety', e.target.value)}
            placeholder="Describe in detail..."
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tasks">
            Completes Given Assignments or Tasks
            <span className="block text-xs text-muted-foreground font-normal mt-1">
              How often? Are reminders required?
            </span>
          </Label>
          <Textarea
            id="tasks"
            value={data.task_completion || ''}
            onChange={(e) => handleChange('task_completion', e.target.value)}
            placeholder="Describe task completion patterns..."
            className="min-h-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
