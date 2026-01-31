import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dumbbell, X, ChevronDown } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { ConcernsFields } from './shared/ConcernsFields';
import { useState, useCallback, useEffect, useRef } from 'react';

const MEDICAL_HISTORY_OPTIONS = [
  'Premature birth',
  'NICU history',
  'Developmental delay',
  'Neurological history',
  'Hearing issues',
  'Vision issues',
  'Chronic illness',
  'Surgery history',
  'Other',
];

interface PhysicalDevelopmentData {
  physical_concerns: string;
  daily_play_time: string;
  physical_activities: string;
  hobbies: string;
  medical_history_development_details: string[];
  parental_concerns: string[];
  teacher_concerns: string;
}

interface PhysicalDevelopmentSectionProps {
  data: PhysicalDevelopmentData;
  onChange: (data: PhysicalDevelopmentData) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function PhysicalDevelopmentSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: PhysicalDevelopmentSectionProps) {
  const [localData, setLocalData] = useState<PhysicalDevelopmentData>(() => ({
    physical_concerns: data.physical_concerns || '',
    daily_play_time: data.daily_play_time || '',
    physical_activities: data.physical_activities || '',
    hobbies: data.hobbies || '',
    medical_history_development_details: data.medical_history_development_details || [],
    parental_concerns: data.parental_concerns || [],
    teacher_concerns: data.teacher_concerns || '',
  }));
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customMedical, setCustomMedical] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLocalData({
        physical_concerns: data.physical_concerns || '',
        daily_play_time: data.daily_play_time || '',
        physical_activities: data.physical_activities || '',
        hobbies: data.hobbies || '',
        medical_history_development_details: data.medical_history_development_details || [],
        parental_concerns: data.parental_concerns || [],
        teacher_concerns: data.teacher_concerns || '',
      });
    }
  }, [data]);

  const saveData = useCallback((newData: PhysicalDevelopmentData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newData);
    }, 400);
  }, [onChange]);

  const handleChange = useCallback((field: keyof PhysicalDevelopmentData, value: string | string[]) => {
    setLocalData((prev) => {
      const newData = { ...prev, [field]: value };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const handleToggleMedicalHistory = useCallback((item: string) => {
    setLocalData((prev) => {
      const current = prev.medical_history_development_details || [];
      const newItems = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      const newData = { ...prev, medical_history_development_details: newItems };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const handleAddCustomMedical = useCallback(() => {
    if (customMedical.trim()) {
      setLocalData((prev) => {
        const current = prev.medical_history_development_details || [];
        if (!current.includes(customMedical.trim())) {
          const newItems = [...current, customMedical.trim()];
          const newData = { ...prev, medical_history_development_details: newItems };
          saveData(newData);
          setCustomMedical('');
          return newData;
        }
        return prev;
      });
    }
  }, [customMedical, saveData]);

  const handleRemoveMedicalHistory = useCallback((item: string) => {
    setLocalData((prev) => {
      const newItems = (prev.medical_history_development_details || []).filter((i) => i !== item);
      const newData = { ...prev, medical_history_development_details: newItems };
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

  const allMedicalOptions = [...new Set([...MEDICAL_HISTORY_OPTIONS, ...(localData.medical_history_development_details || [])])];

  return (
    <SectionWrapper
      title="Physical Development Profile"
      icon={<Dumbbell className="h-5 w-5" />}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid gap-4">
        {/* Medical History - New Field */}
        <div className="space-y-2 p-4 border border-accent/30 rounded-lg bg-accent/5">
          <Label className="text-accent font-medium">Medical History / Development Details</Label>
          
          {/* Selected items as badges */}
          {localData.medical_history_development_details?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {localData.medical_history_development_details.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="bg-accent/20 text-accent-foreground border border-accent/30 px-2 py-1"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicalHistory(item)}
                    className="ml-1.5 hover:text-destructive focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-muted-foreground font-normal border-accent/30"
              >
                Select medical history...
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2" align="start">
              <div className="space-y-2">
                <div className="flex gap-2 pb-2 border-b">
                  <Input
                    placeholder="Add custom..."
                    value={customMedical}
                    onChange={(e) => setCustomMedical(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomMedical();
                      }
                    }}
                    className="h-8 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomMedical}
                    disabled={!customMedical.trim()}
                    className="h-8 px-2"
                  >
                    Add
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {allMedicalOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleToggleMedicalHistory(item)}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
                        localData.medical_history_development_details?.includes(item)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="physical_concerns">Any Physical Development Concerns</Label>
          <Textarea
            id="physical_concerns"
            value={localData.physical_concerns}
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
              value={localData.daily_play_time}
              onChange={(e) => handleChange('daily_play_time', e.target.value)}
              placeholder="e.g., 30 mins"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activities">Physical Activities Enrolled (Outside School)</Label>
            <Input
              id="activities"
              value={localData.physical_activities}
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
            value={localData.hobbies}
            onChange={(e) => handleChange('hobbies', e.target.value)}
            placeholder="List hobbies and interests..."
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
