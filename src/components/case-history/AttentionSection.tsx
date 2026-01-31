import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Focus } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { ConcernsFields } from './shared/ConcernsFields';
import { useState, useCallback, useEffect, useRef } from 'react';

interface AttentionProfileData {
  attention_span: string;
  attention_notes: string;
  distraction_types: string;
  distraction_notes: string;
  impulsivity: string;
  impulsivity_notes: string;
  additional_concerns: string;
  parental_concerns: string[];
  teacher_concerns: string;
}

interface AttentionSectionProps {
  data: AttentionProfileData;
  onChange: (data: AttentionProfileData) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function AttentionSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: AttentionSectionProps) {
  const [localData, setLocalData] = useState<AttentionProfileData>(() => ({
    attention_span: data.attention_span || '',
    attention_notes: data.attention_notes || '',
    distraction_types: data.distraction_types || '',
    distraction_notes: data.distraction_notes || '',
    impulsivity: data.impulsivity || '',
    impulsivity_notes: data.impulsivity_notes || '',
    additional_concerns: data.additional_concerns || '',
    parental_concerns: data.parental_concerns || [],
    teacher_concerns: data.teacher_concerns || '',
  }));
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLocalData({
        attention_span: data.attention_span || '',
        attention_notes: data.attention_notes || '',
        distraction_types: data.distraction_types || '',
        distraction_notes: data.distraction_notes || '',
        impulsivity: data.impulsivity || '',
        impulsivity_notes: data.impulsivity_notes || '',
        additional_concerns: data.additional_concerns || '',
        parental_concerns: data.parental_concerns || [],
        teacher_concerns: data.teacher_concerns || '',
      });
    }
  }, [data]);

  const saveData = useCallback((newData: AttentionProfileData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newData);
    }, 400);
  }, [onChange]);

  const handleChange = useCallback((field: keyof AttentionProfileData, value: string | string[]) => {
    setLocalData((prev) => {
      const newData = { ...prev, [field]: value };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <SectionWrapper
      title="Attention & Impulsivity Profile"
      icon={<Focus className="h-5 w-5" />}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <p className="text-xs text-muted-foreground mb-4">
        As perceived by the parents
      </p>
      
      <div className="grid gap-6">
        <div className="p-4 border border-border rounded-lg space-y-3 bg-card">
          <Label className="font-medium">Attention Span</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>0: &lt;15 min in any task</p>
            <p>2: 15-20 min in a task of their choice/interest area only</p>
            <p>3: 15-20 min across all areas</p>
            <p>5: 30-40 min in any task (familiar or new)</p>
          </div>
          <Select value={localData.attention_span} onValueChange={(v) => handleChange('attention_span', v)}>
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
            value={localData.attention_notes}
            onChange={(e) => handleChange('attention_notes', e.target.value)}
            placeholder="Additional notes..."
            className="min-h-[60px]"
          />
        </div>

        <div className="p-4 border border-border rounded-lg space-y-3 bg-card">
          <Label className="font-medium">Kinds of Stimulus that Cause Distraction</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Auditory, Visual, Cognitive, Kinaesthetic</p>
            <p>0: All 4 types | 1: 3 types | 2: 2 types | 3: 1 type | 4: None</p>
          </div>
          <Select value={localData.distraction_types} onValueChange={(v) => handleChange('distraction_types', v)}>
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
            value={localData.distraction_notes}
            onChange={(e) => handleChange('distraction_notes', e.target.value)}
            placeholder="Specify which types (e.g., Visual, Auditory)..."
            className="min-h-[60px]"
          />
        </div>

        <div className="p-4 border border-border rounded-lg space-y-3 bg-card">
          <Label className="font-medium">Impulsivity (Motor)</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>0: Always impulsive | 1: Most times | 2: Sometimes | 3: Rarely | 4: Never</p>
          </div>
          <Select value={localData.impulsivity} onValueChange={(v) => handleChange('impulsivity', v)}>
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
            value={localData.impulsivity_notes}
            onChange={(e) => handleChange('impulsivity_notes', e.target.value)}
            placeholder="Additional notes..."
            className="min-h-[60px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional">Additional Concerns</Label>
          <Textarea
            id="additional"
            value={localData.additional_concerns}
            onChange={(e) => handleChange('additional_concerns', e.target.value)}
            placeholder="Any other concerns or observations..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Concerns Fields */}
      <ConcernsFields
        parentalConcerns={localData.parental_concerns}
        teacherConcerns={localData.teacher_concerns}
        onParentalConcernsChange={(concerns) => handleChange('parental_concerns', concerns)}
        onTeacherConcernsChange={(concerns) => handleChange('teacher_concerns', concerns)}
      />
    </SectionWrapper>
  );
}
