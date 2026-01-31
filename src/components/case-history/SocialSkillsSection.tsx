import { Users } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { RatingSlider } from './shared/RatingSlider';
import { ConcernsFields } from './shared/ConcernsFields';
import { useState, useCallback, useEffect, useRef } from 'react';

interface SocialSkillsData {
  ratings: {
    shy_to_interact: number;
    kids_interaction: number;
    adult_interaction: number;
    presentation_confidence: number;
    expression_clarity: number;
  };
  notes: string;
  parental_concerns: string[];
  teacher_concerns: string;
}

interface SocialSkillsSectionProps {
  data: SocialSkillsData;
  onChange: (data: SocialSkillsData) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

const DEFAULT_RATINGS = {
  shy_to_interact: 3,
  kids_interaction: 3,
  adult_interaction: 3,
  presentation_confidence: 3,
  expression_clarity: 3,
};

export function SocialSkillsSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: SocialSkillsSectionProps) {
  // Initialize with proper defaults
  const [localData, setLocalData] = useState<SocialSkillsData>(() => ({
    ratings: { ...DEFAULT_RATINGS, ...data.ratings },
    notes: data.notes || '',
    parental_concerns: data.parental_concerns || [],
    teacher_concerns: data.teacher_concerns || '',
  }));
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Sync with external data only on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLocalData({
        ratings: { ...DEFAULT_RATINGS, ...data.ratings },
        notes: data.notes || '',
        parental_concerns: data.parental_concerns || [],
        teacher_concerns: data.teacher_concerns || '',
      });
    }
  }, [data]);

  const saveData = useCallback((newData: SocialSkillsData) => {
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

  const handleNotesChange = useCallback((notes: string) => {
    setLocalData((prev) => {
      const newData = { ...prev, notes };
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

  const ratingFields = [
    { key: 'shy_to_interact' as const, label: 'Shy to Interact with Others', description: 'How hesitant is the child in social situations?' },
    { key: 'kids_interaction' as const, label: 'Comfortable Interacting with Other Kids', description: 'Ability to engage with peers' },
    { key: 'adult_interaction' as const, label: 'Comfortable Interacting with Adults', description: 'Ability to engage with adults' },
    { key: 'presentation_confidence' as const, label: 'Presentation Confidence', description: 'Can do presentations confidently' },
    { key: 'expression_clarity' as const, label: 'Expression Clarity', description: 'Expresses thoughts, ideas, feelings clearly' },
  ];

  return (
    <SectionWrapper
      title="Social Skills Profile"
      icon={<Users className="h-5 w-5" />}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <p className="text-xs text-muted-foreground mb-4">
        Rate on a scale of 1-5 (1 being lowest, 5 being highest)
      </p>
      
      <div className="grid gap-4 md:grid-cols-2">
        {ratingFields.map((field) => (
          <RatingSlider
            key={field.key}
            label={field.label}
            description={field.description}
            value={localData.ratings[field.key] || 3}
            notes=""
            onValueChange={(value) => handleRatingChange(field.key, value)}
            onNotesChange={() => {}} // Individual notes handled below
          />
        ))}
      </div>

      {/* General notes */}
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium">Additional Notes</label>
        <textarea
          value={localData.notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="General observations about social skills..."
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
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
