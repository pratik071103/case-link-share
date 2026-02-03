import { useParams, Link } from 'react-router-dom';
import { 
  useCaseBySlug, 
  useCaseHistorySections, 
  useUpdateSection,
  useCoachDetails,
  useUpdateCoachDetails 
} from '@/hooks/useCaseRecord';
import { SessionDetailsTab } from '@/components/session-details';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMemo, useCallback, useState } from 'react';
import type { Json } from '@/integrations/supabase/types';
import {
  CoachDetailsSection,
  GeneralInfoSection,
  AcademicPerformanceSection,
  EmotionalBehavioralSection,
  SocialSkillsSection,
  SuccessSkillsSection,
  PhysicalDevelopmentSection,
  AttentionSection,
} from '@/components/case-history';

// Section keys for the structured form
const SECTION_KEYS = {
  GENERAL_INFO: 'general_info',
  ACADEMIC: 'academic_performance',
  EMOTIONAL: 'emotional_behavioral',
  SOCIAL: 'social_skills',
  SUCCESS: 'success_skills',
  PHYSICAL: 'physical_development',
  ATTENTION: 'attention_profile',
} as const;

export default function CaseRecord() {
  const { caseSlug } = useParams<{ caseSlug: string }>();
  const { data: childData, isLoading: isLoadingChild, error: childError } = useCaseBySlug(caseSlug);
  
  const caseRecordId = childData?.case_records?.[0]?.id;
  const { data: sections, isLoading: isLoadingSections } = useCaseHistorySections(caseRecordId);
  const { debouncedUpdate: updateSection, isPending: isSavingSection } = useUpdateSection();
  
  const { data: coachDetails, isLoading: isLoadingCoach } = useCoachDetails(caseRecordId);
  const { debouncedUpdate: updateCoachDetails, isPending: isSavingCoach } = useUpdateCoachDetails();

  // Track which sections have been modified
  const [changedSections, setChangedSections] = useState<Set<string>>(new Set());

  // Parse section data from database
  const sectionDataMap = useMemo(() => {
    const map: Record<string, Json> = {};
    sections?.forEach((section) => {
      map[section.section_key] = section.data;
    });
    return map;
  }, [sections]);

  const handleSectionUpdate = useCallback((sectionKey: string, data: Json) => {
    if (!caseRecordId) return;
    setChangedSections(prev => new Set(prev).add(sectionKey));
    updateSection(caseRecordId, sectionKey, data);
  }, [caseRecordId, updateSection]);

  const handleCoachUpdate = useCallback((data: {
    coach_name: string;
    date_of_parent_interaction: string;
    child_interaction_start_date: string;
    total_sessions_taken: number;
    child_interaction_end_date: string;
    assessment_report: string;
  }) => {
    if (!caseRecordId) return;
    setChangedSections(prev => new Set(prev).add('coach_details'));
    updateCoachDetails(caseRecordId, data);
  }, [caseRecordId, updateCoachDetails]);

  // Default empty objects for each section
  const getCoachData = () => ({
    coach_name: coachDetails?.coach_name || '',
    date_of_parent_interaction: coachDetails?.date_of_parent_interaction || '',
    child_interaction_start_date: coachDetails?.child_interaction_start_date || '',
    total_sessions_taken: coachDetails?.total_sessions_taken || 0,
    child_interaction_end_date: coachDetails?.child_interaction_end_date || '',
    assessment_report: coachDetails?.assessment_report || '',
  });

  const getSectionData = <T extends Record<string, unknown>>(key: string, defaults: T): T => {
    const data = sectionDataMap[key];
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      return { ...defaults, ...data } as T;
    }
    return defaults;
  };

  if (isLoadingChild) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (childError || !childData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <h2 className="font-semibold">Case Not Found</h2>
                  <p className="text-sm">
                    The case with slug "{caseSlug}" does not exist.
                  </p>
                </div>
              </div>
              <Button asChild className="mt-4">
                <Link to="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingSections || isLoadingCoach;
  const isSaving = isSavingSection || isSavingCoach;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-6">
          <Button asChild variant="ghost" className="mb-4 -ml-2">
            <Link to="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cases
            </Link>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{childData.name}</h1>
              <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                /case/{childData.case_slug}
              </code>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="mb-6 bg-primary/10">
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Case History
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Session Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Coach Details */}
                <CoachDetailsSection
                  data={getCoachData()}
                  onChange={(data) => handleCoachUpdate(data)}
                  isSaving={isSavingCoach}
                  hasChanges={changedSections.has('coach_details')}
                />

                {/* General Information */}
                <GeneralInfoSection
                  data={getSectionData(SECTION_KEYS.GENERAL_INFO, {
                    name_of_child: childData.name,
                    age_of_child: '',
                    gender: '',
                    school_name: '',
                    board: '',
                    city: '',
                    birth_history: '',
                    school_timings: '',
                    other_classes: '',
                    weekly_availability: '',
                    family_type: '',
                    siblings: '',
                    mother_profession: '',
                    father_profession: '',
                    contact_mode: '',
                    contact_number: '',
                    email: '',
                    diagnosis: '',
                    parental_concerns: [] as string[],
                    teacher_concerns: '',
                  })}
                  onChange={(data) => handleSectionUpdate(SECTION_KEYS.GENERAL_INFO, data as unknown as Json)}
                  isSaving={isSaving}
                  hasChanges={changedSections.has(SECTION_KEYS.GENERAL_INFO)}
                />

                {/* Academic Performance */}
                <AcademicPerformanceSection
                  data={getSectionData(SECTION_KEYS.ACADEMIC, {
                    subjects_excels: '',
                    subjects_struggles: '',
                    handwriting_performance: '',
                    other_concerns: '',
                    parental_concerns: [] as string[],
                    teacher_concerns: '',
                  })}
                  onChange={(data) => handleSectionUpdate(SECTION_KEYS.ACADEMIC, data as unknown as Json)}
                  isSaving={isSaving}
                  hasChanges={changedSections.has(SECTION_KEYS.ACADEMIC)}
                />

                {/* Emotional & Behavioral */}
                <EmotionalBehavioralSection
                  data={getSectionData(SECTION_KEYS.EMOTIONAL, {
                    screen_time: '',
                    behavioral_concerns: '',
                    performance_anxiety: '',
                    task_completion: '',
                    parental_concerns: [] as string[],
                    teacher_concerns: '',
                  })}
                  onChange={(data) => handleSectionUpdate(SECTION_KEYS.EMOTIONAL, data as unknown as Json)}
                  isSaving={isSaving}
                  hasChanges={changedSections.has(SECTION_KEYS.EMOTIONAL)}
                />

                {/* Social Skills - New structure with ratings */}
                <SocialSkillsSection
                  data={getSectionData(SECTION_KEYS.SOCIAL, {
                    ratings: {
                      shy_to_interact: 3,
                      kids_interaction: 3,
                      adult_interaction: 3,
                      presentation_confidence: 3,
                      expression_clarity: 3,
                    },
                    notes: '',
                    parental_concerns: [] as string[],
                    teacher_concerns: '',
                  })}
                  onChange={(data) => handleSectionUpdate(SECTION_KEYS.SOCIAL, data as unknown as Json)}
                  isSaving={isSaving}
                  hasChanges={changedSections.has(SECTION_KEYS.SOCIAL)}
                />

                {/* Success Skills - New structure with ratings and notes */}
                <SuccessSkillsSection
                  data={getSectionData(SECTION_KEYS.SUCCESS, {
                    ratings: {
                      creativity: 3,
                      problem_solving: 3,
                      decision_making: 3,
                      collaboration: 3,
                      initiative: 3,
                      responsibility: 3,
                    },
                    notes: {
                      creativity: '',
                      problem_solving: '',
                      decision_making: '',
                      collaboration: '',
                      initiative: '',
                      responsibility: '',
                    },
                    parental_concerns: [] as string[],
                    teacher_concerns: '',
                  })}
                  onChange={(data) => handleSectionUpdate(SECTION_KEYS.SUCCESS, data as unknown as Json)}
                  isSaving={isSaving}
                  hasChanges={changedSections.has(SECTION_KEYS.SUCCESS)}
                />

                {/* Physical Development */}
                <PhysicalDevelopmentSection
                  data={getSectionData(SECTION_KEYS.PHYSICAL, {
                    physical_concerns: '',
                    daily_play_time: '',
                    physical_activities: '',
                    hobbies: '',
                    medical_history_development_details: [] as string[],
                    parental_concerns: [] as string[],
                    teacher_concerns: '',
                  })}
                  onChange={(data) => handleSectionUpdate(SECTION_KEYS.PHYSICAL, data as unknown as Json)}
                  isSaving={isSaving}
                  hasChanges={changedSections.has(SECTION_KEYS.PHYSICAL)}
                />

                {/* Attention & Impulsivity */}
                <AttentionSection
                  data={getSectionData(SECTION_KEYS.ATTENTION, {
                    attention_span: '',
                    attention_notes: '',
                    distraction_types: '',
                    distraction_notes: '',
                    impulsivity: '',
                    impulsivity_notes: '',
                    additional_concerns: '',
                    parental_concerns: [] as string[],
                    teacher_concerns: '',
                  })}
                  onChange={(data) => handleSectionUpdate(SECTION_KEYS.ATTENTION, data as unknown as Json)}
                  isSaving={isSaving}
                  hasChanges={changedSections.has(SECTION_KEYS.ATTENTION)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            <SessionDetailsTab 
              childId={childData.id} 
              childEmail={(sectionDataMap['general_info'] as Record<string, unknown>)?.email as string || ''}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
