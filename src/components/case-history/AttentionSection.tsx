import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Check, Focus } from 'lucide-react';

interface AttentionProfile {
  attention_span: string;
  attention_notes: string;
  distraction_types: string;
  distraction_notes: string;
  impulsivity: string;
  impulsivity_notes: string;
  additional_concerns: string;
}

interface AttentionSectionProps {
  data: AttentionProfile;
  onChange: (data: AttentionProfile) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function AttentionSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: AttentionSectionProps) {
  const handleChange = (field: keyof AttentionProfile, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Focus className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Attention & Impulsivity Profile</CardTitle>
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
          As perceived by the parents
        </p>
      </CardHeader>
      <CardContent className="pt-4 grid gap-6">
        <div className="p-4 border rounded-lg space-y-3">
          <Label className="font-medium">Attention Span</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>0: &lt;15 min in any task</p>
            <p>2: 15-20 min in a task of their choice/interest area only</p>
            <p>3: 15-20 min across all areas</p>
            <p>5: 30-40 min in any task (familiar or new)</p>
          </div>
          <Select value={data.attention_span || ''} onValueChange={(v) => handleChange('attention_span', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Less than 15 min</SelectItem>
              <SelectItem value="2">2 - 15-20 min (interest area only)</SelectItem>
              <SelectItem value="3">3 - 15-20 min (all areas)</SelectItem>
              <SelectItem value="5">5 - 30-40 min (any task)</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={data.attention_notes || ''}
            onChange={(e) => handleChange('attention_notes', e.target.value)}
            placeholder="Additional notes..."
            className="min-h-[60px]"
          />
        </div>

        <div className="p-4 border rounded-lg space-y-3">
          <Label className="font-medium">Kinds of Stimulus that Cause Distraction</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Auditory, Visual, Cognitive, Kinaesthetic</p>
            <p>0: All 4 types | 1: 3 types | 2: 2 types | 3: 1 type | 4: None</p>
          </div>
          <Select value={data.distraction_types || ''} onValueChange={(v) => handleChange('distraction_types', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - All 4 types</SelectItem>
              <SelectItem value="1">1 - 3 types</SelectItem>
              <SelectItem value="2">2 - 2 types</SelectItem>
              <SelectItem value="3">3 - 1 type</SelectItem>
              <SelectItem value="4">4 - No distractions</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={data.distraction_notes || ''}
            onChange={(e) => handleChange('distraction_notes', e.target.value)}
            placeholder="Specify which types (e.g., Visual, Auditory)..."
            className="min-h-[60px]"
          />
        </div>

        <div className="p-4 border rounded-lg space-y-3">
          <Label className="font-medium">Impulsivity (Motor)</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>0: Always impulsive | 1: Most times | 2: Sometimes | 3: Rarely | 4: Never</p>
          </div>
          <Select value={data.impulsivity || ''} onValueChange={(v) => handleChange('impulsivity', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Always impulsive</SelectItem>
              <SelectItem value="1">1 - Most of the times impulsive</SelectItem>
              <SelectItem value="2">2 - Sometimes impulsive</SelectItem>
              <SelectItem value="3">3 - Rarely impulsive</SelectItem>
              <SelectItem value="4">4 - Never impulsive</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={data.impulsivity_notes || ''}
            onChange={(e) => handleChange('impulsivity_notes', e.target.value)}
            placeholder="Additional notes..."
            className="min-h-[60px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional">Additional Concerns</Label>
          <Textarea
            id="additional"
            value={data.additional_concerns || ''}
            onChange={(e) => handleChange('additional_concerns', e.target.value)}
            placeholder="Any other concerns or observations..."
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
