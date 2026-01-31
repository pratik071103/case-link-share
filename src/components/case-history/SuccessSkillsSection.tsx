import { Trophy } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { RatingSlider } from './shared/RatingSlider';
import { ConcernsFields } from './shared/ConcernsFields';
import { useState, useCallback, useEffect, useRef } from 'react';

interface SuccessSkillsData {
  ratings: {
    creativity: number;
    problem_solving: number;
    decision_making: number;
    collaboration: number;
    initiative: number;
    responsibility: number;
  };
  notes: {
    creativity: string;
    problem_solving: string;
    decision_making: string;
    collaboration: string;
    initiative: string;
    responsibility: string;
  };
  parental_concerns: string[];
  teacher_concerns: string;
}

interface SuccessSkillsSectionProps {
  data: SuccessSkillsData;
  onChange: (data: SuccessSkillsData) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

const DEFAULT_RATINGS = {
  creativity: 3,
  problem_solving: 3,
  decision_making: 3,
  collaboration: 3,
  initiative: 3,
  responsibility: 3,
};

const DEFAULT_NOTES = {
  creativity: '',
  problem_solving: '',
  decision_making: '',
  collaboration: '',
  initiative: '',
  responsibility: '',
};

const SKILL_FIELDS = [
  { key: 'creativity' as const, label: 'Creativity', description: 'Ability to come up with ideas or solutions on their own' },
  { key: 'problem_solving' as const, label: 'Problem Solving', description: 'Problem solving abilities' },
  { key: 'decision_making' as const, label: 'Decision Making', description: 'Decision making abilities' },
  { key: 'collaboration' as const, label: 'Collaboration', description: 'Can collaborate with peers in tasks or group activities' },
  { key: 'initiative' as const, label: 'Initiative', description: 'Takes initiative to do things' },
  { key: 'responsibility' as const, label: 'Responsibility & Accountability', description: 'Takes responsibility for actions' },
];

export function SuccessSkillsSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: SuccessSkillsSectionProps) {
  const [localData, setLocalData] = useState<SuccessSkillsData>(() => ({
    ratings: { ...DEFAULT_RATINGS, ...data.ratings },
    notes: { ...DEFAULT_NOTES, ...data.notes },
    parental_concerns: data.parental_concerns || [],
    teacher_concerns: data.teacher_concerns || '',
  }));
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLocalData({
        ratings: { ...DEFAULT_RATINGS, ...data.ratings },
        notes: { ...DEFAULT_NOTES, ...data.notes },
        parental_concerns: data.parental_concerns || [],
        teacher_concerns: data.teacher_concerns || '',
      });
    }
  }, [data]);

  const saveData = useCallback((newData: SuccessSkillsData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newData);
    }, 400);
  }, [onChange]);

  const handleRatingChange = useCallback((key: keyof typeof DEFAULT_RATINGS, value: number) => {
    setLocalData((prev) => {
      const newData = {
        ...prev,
        ratings: { ...prev.ratings, [key]: value },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const handleNotesChange = useCallback((key: keyof typeof DEFAULT_NOTES, value: string) => {
    setLocalData((prev) => {
      const newData = {
        ...prev,
        notes: { ...prev.notes, [key]: value },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const handleParentalConcernsChange = useCallback((concerns: string[]) => {
    setLocalData((prev) => {
      const newData = { ...prev, parental_concerns: concerns };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const handleTeacherConcernsChange = useCallback((concerns: string) => {
    setLocalData((prev) => {
      const newData = { ...prev, teacher_concerns: concerns };
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
      title="Success Skills Profile"
      icon={<Trophy className="h-5 w-5" />}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <p className="text-xs text-muted-foreground mb-4">
        Rate on a scale of 1-5 (1 being lowest, 5 being highest)
      </p>
      
      <div className="grid gap-4 md:grid-cols-2">
        {SKILL_FIELDS.map((field) => (
          <RatingSlider
            key={field.key}
            label={field.label}
            description={field.description}
            value={localData.ratings[field.key] || 3}
            notes={localData.notes[field.key] || ''}
            onValueChange={(value) => handleRatingChange(field.key, value)}
            onNotesChange={(notes) => handleNotesChange(field.key, notes)}
          />
        ))}
      </div>

      {/* Concerns Fields */}
      <ConcernsFields
        parentalConcerns={localData.parental_concerns}
        teacherConcerns={localData.teacher_concerns}
        onParentalConcernsChange={handleParentalConcernsChange}
        onTeacherConcernsChange={handleTeacherConcernsChange}
      />
    </SectionWrapper>
  );
}
