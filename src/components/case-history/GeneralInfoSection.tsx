import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { ConcernsFields } from './shared/ConcernsFields';
import { useState, useCallback, useEffect, useRef } from 'react';

interface GeneralInfoData {
  name_of_child: string;
  age_of_child: string;
  gender: string;
  school_name: string;
  board: string;
  city: string;
  birth_history: string;
  school_timings: string;
  other_classes: string;
  weekly_availability: string;
  family_type: string;
  siblings: string;
  mother_profession: string;
  father_profession: string;
  contact_mode: string;
  contact_number: string;
  email: string;
  diagnosis: string;
  parental_concerns: string[];
  teacher_concerns: string;
}

interface GeneralInfoSectionProps {
  data: GeneralInfoData;
  onChange: (data: GeneralInfoData) => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function GeneralInfoSection({ 
  data, 
  onChange, 
  isSaving = false,
  hasChanges = false 
}: GeneralInfoSectionProps) {
  // Local state for controlled inputs
  const [localData, setLocalData] = useState<GeneralInfoData>(data);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Sync with external data only on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLocalData(data);
    }
  }, [data]);

  const handleChange = useCallback((field: keyof GeneralInfoData, value: string | string[]) => {
    setLocalData((prev) => {
      const newData = { ...prev, [field]: value };
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        onChange(newData);
      }, 400);
      
      return newData;
    });
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <SectionWrapper
      title="General Information"
      icon={<Info className="h-5 w-5" />}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="child_name">Name of the Child</Label>
          <Input
            id="child_name"
            value={localData.name_of_child || ''}
            onChange={(e) => handleChange('name_of_child', e.target.value)}
            placeholder="Enter child's name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age of the Child</Label>
          <Input
            id="age"
            value={localData.age_of_child || ''}
            onChange={(e) => handleChange('age_of_child', e.target.value)}
            placeholder="e.g., 7 years"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select 
            value={localData.gender || ''} 
            onValueChange={(v) => handleChange('gender', v)}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="school">School Name</Label>
          <Input
            id="school"
            value={localData.school_name || ''}
            onChange={(e) => handleChange('school_name', e.target.value)}
            placeholder="Enter school name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="board">Board</Label>
          <Input
            id="board"
            value={localData.board || ''}
            onChange={(e) => handleChange('board', e.target.value)}
            placeholder="e.g., CBSE, ICSE"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={localData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Enter city"
          />
        </div>
        
        {/* Diagnosis field - new field */}
        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <Label htmlFor="diagnosis" className="text-accent font-medium">
            Diagnosis
          </Label>
          <Textarea
            id="diagnosis"
            value={localData.diagnosis || ''}
            onChange={(e) => handleChange('diagnosis', e.target.value)}
            placeholder="e.g., Speech delay with sensory processing concerns"
            className="min-h-[80px] border-accent/30 focus:border-accent"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <Label htmlFor="birth_history">Any Significant Birth History or Developmental Delays</Label>
          <Textarea
            id="birth_history"
            value={localData.birth_history || ''}
            onChange={(e) => handleChange('birth_history', e.target.value)}
            placeholder="e.g., Premature, developmental milestones..."
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school_timings">Child's School Timings</Label>
          <Input
            id="school_timings"
            value={localData.school_timings || ''}
            onChange={(e) => handleChange('school_timings', e.target.value)}
            placeholder="e.g., 8:15-2:55"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="other_classes">Other Classes Beyond School Hours</Label>
          <Input
            id="other_classes"
            value={localData.other_classes || ''}
            onChange={(e) => handleChange('other_classes', e.target.value)}
            placeholder="e.g., Music, Sports"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availability">Child's Weekly Availability</Label>
          <Input
            id="availability"
            value={localData.weekly_availability || ''}
            onChange={(e) => handleChange('weekly_availability', e.target.value)}
            placeholder="e.g., Wednesday"
          />
        </div>
        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <Label htmlFor="family_type">Type of Family (Nuclear or Joint)</Label>
          <Textarea
            id="family_type"
            value={localData.family_type || ''}
            onChange={(e) => handleChange('family_type', e.target.value)}
            placeholder="Describe family structure..."
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siblings">Siblings with Order and Age</Label>
          <Input
            id="siblings"
            value={localData.siblings || ''}
            onChange={(e) => handleChange('siblings', e.target.value)}
            placeholder="e.g., Only child, Elder sister (10 years)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mother_prof">Profession of Mother</Label>
          <Input
            id="mother_prof"
            value={localData.mother_profession || ''}
            onChange={(e) => handleChange('mother_profession', e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="father_prof">Profession of Father</Label>
          <Input
            id="father_prof"
            value={localData.father_profession || ''}
            onChange={(e) => handleChange('father_profession', e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_mode">Preferred Mode of Contact</Label>
          <Select 
            value={localData.contact_mode || ''} 
            onValueChange={(v) => handleChange('contact_mode', v)}
          >
            <SelectTrigger id="contact_mode">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Phone">Phone</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Contact Number</Label>
          <Input
            id="phone"
            value={localData.contact_number || ''}
            onChange={(e) => handleChange('contact_number', e.target.value)}
            placeholder="Phone number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email for Communication</Label>
          <Input
            id="email"
            type="email"
            value={localData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>
      </div>

      {/* Concerns Fields */}
      <ConcernsFields
        parentalConcerns={localData.parental_concerns || []}
        teacherConcerns={localData.teacher_concerns || ''}
        onParentalConcernsChange={(concerns) => handleChange('parental_concerns', concerns)}
        onTeacherConcernsChange={(concerns) => handleChange('teacher_concerns', concerns)}
      />
    </SectionWrapper>
  );
}
