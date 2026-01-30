import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check, Dumbbell } from 'lucide-react';

interface PhysicalDevelopment {
  physical_concerns: string;
  daily_play_time: string;
  physical_activities: string;
  hobbies: string;
}

interface PhysicalDevelopmentSectionProps {
  data: PhysicalDevelopment;
  onChange: (data: PhysicalDevelopment) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function PhysicalDevelopmentSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: PhysicalDevelopmentSectionProps) {
  const handleChange = (field: keyof PhysicalDevelopment, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Physical Development Profile</CardTitle>
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
          <Label htmlFor="physical_concerns">Any Parental Concerns/Challenges</Label>
          <Textarea
            id="physical_concerns"
            value={data.physical_concerns || ''}
            onChange={(e) => handleChange('physical_concerns', e.target.value)}
            placeholder="Describe any physical development concerns..."
            className="min-h-[80px]"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="play_time">Daily Physical Play Time</Label>
            <Input
              id="play_time"
              value={data.daily_play_time || ''}
              onChange={(e) => handleChange('daily_play_time', e.target.value)}
              placeholder="e.g., 30 mins"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activities">Physical Activities Enrolled (Outside School)</Label>
            <Input
              id="activities"
              value={data.physical_activities || ''}
              onChange={(e) => handleChange('physical_activities', e.target.value)}
              placeholder="e.g., Kungfu, swimming, biking"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hobbies">
            Hobbies or Interests
            <span className="block text-xs text-muted-foreground font-normal mt-1">
              Gross motor & Fine motor activities
            </span>
          </Label>
          <Textarea
            id="hobbies"
            value={data.hobbies || ''}
            onChange={(e) => handleChange('hobbies', e.target.value)}
            placeholder="List hobbies and interests..."
            className="min-h-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
