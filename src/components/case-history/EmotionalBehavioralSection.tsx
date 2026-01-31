import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { ConcernsFields } from './shared/ConcernsFields';
import { useState, useCallback, useEffect, useRef } from 'react';

interface EmotionalBehavioralData {
  screen_time: string;
  behavioral_concerns: string;
  performance_anxiety: string;
  task_completion: string;
  parental_concerns: string[];
  teacher_concerns: string;
}

interface EmotionalBehavioralSectionProps {
  data: EmotionalBehavioralData;
  onChange: (data: EmotionalBehavioralData) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function EmotionalBehavioralSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: EmotionalBehavioralSectionProps) {
  const [localData, setLocalData] = useState<EmotionalBehavioralData>(() => ({
    screen_time: data.screen_time || '',
    behavioral_concerns: data.behavioral_concerns || '',
    performance_anxiety: data.performance_anxiety || '',
    task_completion: data.task_completion || '',
    parental_concerns: data.parental_concerns || [],
    teacher_concerns: data.teacher_concerns || '',
  }));
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLocalData({
        screen_time: data.screen_time || '',
        behavioral_concerns: data.behavioral_concerns || '',
        performance_anxiety: data.performance_anxiety || '',
        task_completion: data.task_completion || '',
        parental_concerns: data.parental_concerns || [],
        teacher_concerns: data.teacher_concerns || '',
      });
    }
  }, [data]);

  const saveData = useCallback((newData: EmotionalBehavioralData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newData);
    }, 400);
  }, [onChange]);

  const handleChange = useCallback((field: keyof EmotionalBehavioralData, value: string | string[]) => {
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
      title="Emotional & Behavioural Profile"
      icon={<Heart className="h-5 w-5" />}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="screen_time">Average Screen Time per Day (in hours)</Label>
          <Input
            id="screen_time"
            value={localData.screen_time}
            onChange={(e) => handleChange('screen_time', e.target.value)}
            placeholder="e.g., 2 hours"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="behavioral">
            Behavioral Concerns
            <span className="block text-xs text-muted-foreground font-normal mt-1">
              Issues like anger, impulsivity, etc. (describe in detail)
            </span>
          </Label>
          <Textarea
            id="behavioral"
            value={localData.behavioral_concerns}
            onChange={(e) => handleChange('behavioral_concerns', e.target.value)}
            placeholder="Describe behavioral concerns..."
            className="min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="anxiety">Performance Anxiety, Distraction, etc.</Label>
          <Textarea
            id="anxiety"
            value={localData.performance_anxiety}
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
            value={localData.task_completion}
            onChange={(e) => handleChange('task_completion', e.target.value)}
            placeholder="Describe task completion patterns..."
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
