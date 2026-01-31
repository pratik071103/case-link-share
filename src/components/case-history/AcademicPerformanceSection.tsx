import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { ConcernsFields } from './shared/ConcernsFields';
import { useState, useCallback, useEffect, useRef } from 'react';

interface AcademicPerformanceData {
  subjects_excels: string;
  subjects_struggles: string;
  handwriting_performance: string;
  other_concerns: string;
  parental_concerns: string[];
  teacher_concerns: string;
}

interface AcademicPerformanceSectionProps {
  data: AcademicPerformanceData;
  onChange: (data: AcademicPerformanceData) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function AcademicPerformanceSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: AcademicPerformanceSectionProps) {
  const [localData, setLocalData] = useState<AcademicPerformanceData>(() => ({
    subjects_excels: data.subjects_excels || '',
    subjects_struggles: data.subjects_struggles || '',
    handwriting_performance: data.handwriting_performance || '',
    other_concerns: data.other_concerns || '',
    parental_concerns: data.parental_concerns || [],
    teacher_concerns: data.teacher_concerns || '',
  }));
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLocalData({
        subjects_excels: data.subjects_excels || '',
        subjects_struggles: data.subjects_struggles || '',
        handwriting_performance: data.handwriting_performance || '',
        other_concerns: data.other_concerns || '',
        parental_concerns: data.parental_concerns || [],
        teacher_concerns: data.teacher_concerns || '',
      });
    }
  }, [data]);

  const saveData = useCallback((newData: AcademicPerformanceData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newData);
    }, 400);
  }, [onChange]);

  const handleChange = useCallback((field: keyof AcademicPerformanceData, value: string | string[]) => {
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
      title="Academic Performance"
      icon={<GraduationCap className="h-5 w-5" />}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="excels">Subjects the Child Likes & Excels In</Label>
          <Textarea
            id="excels"
            value={localData.subjects_excels}
            onChange={(e) => handleChange('subjects_excels', e.target.value)}
            placeholder="e.g., Mathematics, Science"
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="struggles">Subjects the Child Struggles With</Label>
          <Textarea
            id="struggles"
            value={localData.subjects_struggles}
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
            value={localData.handwriting_performance}
            onChange={(e) => handleChange('handwriting_performance', e.target.value)}
            placeholder="Describe handwriting performance..."
            className="min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="other_academic">Other Academic Concerns/Challenges</Label>
          <Textarea
            id="other_academic"
            value={localData.other_concerns}
            onChange={(e) => handleChange('other_concerns', e.target.value)}
            placeholder="Any other academic concerns..."
            className="min-h-[80px]"
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
