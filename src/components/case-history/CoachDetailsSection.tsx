import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, User } from 'lucide-react';

interface CoachDetails {
  coach_name: string;
  date_of_parent_interaction: string;
  child_interaction_start_date: string;
  total_sessions_taken: number;
  child_interaction_end_date: string;
  assessment_report: string;
}

interface CoachDetailsSectionProps {
  data: CoachDetails;
  onChange: (data: CoachDetails) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function CoachDetailsSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: CoachDetailsSectionProps) {
  const handleChange = (field: keyof CoachDetails, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Coach Details</CardTitle>
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
      <CardContent className="pt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="coach_name">Coach Name</Label>
          <Input
            id="coach_name"
            value={data.coach_name || ''}
            onChange={(e) => handleChange('coach_name', e.target.value)}
            placeholder="Enter coach name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parent_interaction">Date of Parent Interaction</Label>
          <Input
            id="parent_interaction"
            type="date"
            value={data.date_of_parent_interaction || ''}
            onChange={(e) => handleChange('date_of_parent_interaction', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="child_start">Child Interaction Start Date</Label>
          <Input
            id="child_start"
            type="date"
            value={data.child_interaction_start_date || ''}
            onChange={(e) => handleChange('child_interaction_start_date', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="child_end">Child Interaction End Date</Label>
          <Input
            id="child_end"
            type="date"
            value={data.child_interaction_end_date || ''}
            onChange={(e) => handleChange('child_interaction_end_date', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sessions">Total Sessions Taken</Label>
          <Input
            id="sessions"
            type="number"
            min="0"
            value={data.total_sessions_taken || 0}
            onChange={(e) => handleChange('total_sessions_taken', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assessment">Assessment Report</Label>
          <Input
            id="assessment"
            value={data.assessment_report || ''}
            onChange={(e) => handleChange('assessment_report', e.target.value)}
            placeholder="Link or filename"
          />
        </div>
      </CardContent>
    </Card>
  );
}
