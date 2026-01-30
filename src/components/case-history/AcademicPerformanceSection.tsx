import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check, GraduationCap } from 'lucide-react';

interface AcademicPerformance {
  subjects_excels: string;
  subjects_struggles: string;
  handwriting_performance: string;
  other_concerns: string;
}

interface AcademicPerformanceSectionProps {
  data: AcademicPerformance;
  onChange: (data: AcademicPerformance) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function AcademicPerformanceSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: AcademicPerformanceSectionProps) {
  const handleChange = (field: keyof AcademicPerformance, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Academic Performance</CardTitle>
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
          <Label htmlFor="excels">Subjects the Child Likes & Excels In</Label>
          <Textarea
            id="excels"
            value={data.subjects_excels || ''}
            onChange={(e) => handleChange('subjects_excels', e.target.value)}
            placeholder="e.g., Mathematics, Science"
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="struggles">Subjects the Child Struggles With</Label>
          <Textarea
            id="struggles"
            value={data.subjects_struggles || ''}
            onChange={(e) => handleChange('subjects_struggles', e.target.value)}
            placeholder="e.g., English, particularly reading comprehension"
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="handwriting">
            Handwriting Performance
            <span className="block text-xs text-muted-foreground font-normal mt-1">
              Include: legibility/speed issues, pain complaints, ability to complete writing tasks on time
            </span>
          </Label>
          <Textarea
            id="handwriting"
            value={data.handwriting_performance || ''}
            onChange={(e) => handleChange('handwriting_performance', e.target.value)}
            placeholder="Describe handwriting performance..."
            className="min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="other_academic">Other Parental Concerns/Challenges</Label>
          <Textarea
            id="other_academic"
            value={data.other_concerns || ''}
            onChange={(e) => handleChange('other_concerns', e.target.value)}
            placeholder="Any other academic concerns..."
            className="min-h-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
