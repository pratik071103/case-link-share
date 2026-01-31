import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { useState, useCallback, useEffect, useRef } from 'react';

interface CoachDetailsData {
  coach_name: string;
  date_of_parent_interaction: string;
  child_interaction_start_date: string;
  total_sessions_taken: number;
  child_interaction_end_date: string;
  assessment_report: string;
}

interface CoachDetailsSectionProps {
  data: CoachDetailsData;
  onChange: (data: CoachDetailsData) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function CoachDetailsSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: CoachDetailsSectionProps) {
  const [localData, setLocalData] = useState<CoachDetailsData>(() => ({
    coach_name: data.coach_name || '',
    date_of_parent_interaction: data.date_of_parent_interaction || '',
    child_interaction_start_date: data.child_interaction_start_date || '',
    total_sessions_taken: data.total_sessions_taken || 0,
    child_interaction_end_date: data.child_interaction_end_date || '',
    assessment_report: data.assessment_report || '',
  }));
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLocalData({
        coach_name: data.coach_name || '',
        date_of_parent_interaction: data.date_of_parent_interaction || '',
        child_interaction_start_date: data.child_interaction_start_date || '',
        total_sessions_taken: data.total_sessions_taken || 0,
        child_interaction_end_date: data.child_interaction_end_date || '',
        assessment_report: data.assessment_report || '',
      });
    }
  }, [data]);

  const saveData = useCallback((newData: CoachDetailsData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newData);
    }, 400);
  }, [onChange]);

  const handleChange = useCallback((field: keyof CoachDetailsData, value: string | number) => {
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
      title="Coach Details"
      icon={<User className="h-5 w-5" />}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="coach_name">Coach Name</Label>
          <Input
            id="coach_name"
            value={localData.coach_name}
            onChange={(e) => handleChange('coach_name', e.target.value)}
            placeholder="Enter coach name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parent_interaction">Date of Parent Interaction</Label>
          <Input
            id="parent_interaction"
            type="date"
            value={localData.date_of_parent_interaction}
            onChange={(e) => handleChange('date_of_parent_interaction', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="child_start">Child Interaction Start Date</Label>
          <Input
            id="child_start"
            type="date"
            value={localData.child_interaction_start_date}
            onChange={(e) => handleChange('child_interaction_start_date', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="child_end">Child Interaction End Date</Label>
          <Input
            id="child_end"
            type="date"
            value={localData.child_interaction_end_date}
            onChange={(e) => handleChange('child_interaction_end_date', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sessions">Total Sessions Taken</Label>
          <Input
            id="sessions"
            type="number"
            min="0"
            value={localData.total_sessions_taken}
            onChange={(e) => handleChange('total_sessions_taken', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assessment">Assessment Report</Label>
          <Input
            id="assessment"
            value={localData.assessment_report}
            onChange={(e) => handleChange('assessment_report', e.target.value)}
            placeholder="Link or filename"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
