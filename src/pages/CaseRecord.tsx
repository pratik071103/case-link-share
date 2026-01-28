import { useParams, Link } from 'react-router-dom';
import { useCaseBySlug, useCaseHistorySections, useUpdateSection } from '@/hooks/useCaseRecord';
import { CaseHistorySection } from '@/components/CaseHistorySection';
import { SessionList } from '@/components/SessionList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMemo, useCallback } from 'react';
import type { Json } from '@/integrations/supabase/types';

const HISTORY_SECTIONS = [
  { key: 'child_background', title: 'Child Background' },
  { key: 'parent_history', title: 'Parent History' },
  { key: 'developmental_history', title: 'Developmental History' },
  { key: 'medical_history', title: 'Medical History' },
  { key: 'behavioral_observations', title: 'Behavioral Observations' },
  { key: 'assessment_summary', title: 'Assessment Summary' },
  { key: 'therapy_goals', title: 'Therapy Goals' },
  { key: 'additional_notes', title: 'Additional Notes' },
];

export default function CaseRecord() {
  const { caseSlug } = useParams<{ caseSlug: string }>();
  const { data: childData, isLoading: isLoadingChild, error: childError } = useCaseBySlug(caseSlug);
  
  const caseRecordId = childData?.case_records?.[0]?.id;
  const { data: sections, isLoading: isLoadingSections } = useCaseHistorySections(caseRecordId);
  const { debouncedUpdate, isPending: isSaving } = useUpdateSection();

  const sectionDataMap = useMemo(() => {
    const map: Record<string, string> = {};
    sections?.forEach((section) => {
      const data = section.data as { content?: string } | null;
      map[section.section_key] = data?.content || '';
    });
    return map;
  }, [sections]);

  const handleSectionUpdate = useCallback((sectionKey: string, value: string) => {
    if (!caseRecordId) return;
    const data: Json = { content: value };
    debouncedUpdate(caseRecordId, sectionKey, data);
  }, [caseRecordId, debouncedUpdate]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
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
          <TabsList className="mb-6">
            <TabsTrigger value="history">Case History</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            {isLoadingSections ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  {HISTORY_SECTIONS.slice(0, 4).map((section) => (
                    <CaseHistorySection
                      key={section.key}
                      title={section.title}
                      sectionKey={section.key}
                      initialValue={sectionDataMap[section.key] || ''}
                      onUpdate={(value) => handleSectionUpdate(section.key, value)}
                      isSaving={isSaving}
                    />
                  ))}
                </div>
                <div className="space-y-4">
                  {HISTORY_SECTIONS.slice(4).map((section) => (
                    <CaseHistorySection
                      key={section.key}
                      title={section.title}
                      sectionKey={section.key}
                      initialValue={sectionDataMap[section.key] || ''}
                      onUpdate={(value) => handleSectionUpdate(section.key, value)}
                      isSaving={isSaving}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            <SessionList childId={childData.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
