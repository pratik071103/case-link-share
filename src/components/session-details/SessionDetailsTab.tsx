import { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Calendar, Loader2, RefreshCw, Save, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SkillCard } from './SkillCard';
import { useAssessmentData } from '@/hooks/useAssessmentApi';
import { 
  useSessionDetails, 
  useSkillEntries,
  useNextSessionNumber,
  useCreateSessionDetail,
  useUpdateSessionDetail,
  useUpsertSkillEntries 
} from '@/hooks/useSessionDetails';
import type { SkillEntry, SessionDetail } from '@/types/session';
import { createEmptySkillEntry } from '@/types/session';
import { updateCalculatedFields } from '@/lib/sessionFormulas';

interface SessionDetailsTabProps {
  childId: string;
  childEmail?: string;
}

export function SessionDetailsTab({ childId, childEmail }: SessionDetailsTabProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState(childEmail || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Queries
  const { data: sessions, isLoading: isLoadingSessions } = useSessionDetails(childId);
  const { data: nextSessionNo } = useNextSessionNumber(childId);
  const { data: skillEntriesData, isLoading: isLoadingSkills } = useSkillEntries(activeSessionId || undefined);
  const { data: assessmentData, isLoading: isLoadingAssessment, refetch: refetchAssessment } = useAssessmentData(email || undefined);

  // Mutations
  const createSession = useCreateSessionDetail();
  const updateSession = useUpdateSessionDetail();
  const upsertSkillEntries = useUpsertSkillEntries();

  // Local state for current session
  const [currentSession, setCurrentSession] = useState<Partial<SessionDetail> | null>(null);
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([]);

  // Initialize session when activeSessionId changes
  useEffect(() => {
    if (activeSessionId && sessions) {
      const session = sessions.find(s => s.id === activeSessionId);
      if (session) {
        setCurrentSession(session);
      }
    }
  }, [activeSessionId, sessions]);

  // Initialize skill entries when loaded
  useEffect(() => {
    if (skillEntriesData) {
      setSkillEntries(skillEntriesData);
    }
  }, [skillEntriesData]);

  // Skills from API
  const skills = useMemo(() => assessmentData?.skills || [], [assessmentData]);

  // Create new session
  const handleCreateSession = async () => {
    try {
      const result = await createSession.mutateAsync({
        child_id: childId,
        session_no: nextSessionNo || 1,
        session_date: format(new Date(), 'yyyy-MM-dd'),
        session_type: 'child',
        attendance: null,
        session_report_url: null,
        session_link_url: null,
        gemini_summary_url: null,
      });
      setActiveSessionId(result.id);
      setCurrentSession(result);
      setSkillEntries([]);
      toast.success('New session created');
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  // Update session field
  const updateSessionField = useCallback(<K extends keyof SessionDetail>(field: K, value: SessionDetail[K]) => {
    setCurrentSession(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  // Add skill entry (from API presets or manual)
  const handleAddSkill = (isManual = false) => {
    const newOrder = skillEntries.length;
    const newEntry = createEmptySkillEntry(newOrder, isManual);
    setSkillEntries(prev => [...prev, newEntry]);
  };

  // Update skill entry
  const handleUpdateSkillEntry = useCallback((index: number, entry: SkillEntry) => {
    setSkillEntries(prev => {
      const updated = [...prev];
      updated[index] = updateCalculatedFields(entry);
      return updated;
    });
  }, []);

  // Remove skill entry
  const handleRemoveSkillEntry = useCallback((index: number) => {
    setSkillEntries(prev => prev.filter((_, i) => i !== index).map((e, i) => ({ ...e, skill_order: i })));
  }, []);

  // Save session with entries
  const handleSave = async () => {
    if (!currentSession?.id || !activeSessionId) return;
    
    setIsSaving(true);
    try {
      // Update session details
      await updateSession.mutateAsync({
        id: activeSessionId,
        session_date: currentSession.session_date,
        session_type: currentSession.session_type,
        attendance: currentSession.attendance,
        session_report_url: currentSession.session_report_url,
        session_link_url: currentSession.session_link_url,
        gemini_summary_url: currentSession.gemini_summary_url,
      });

      // Upsert skill entries
      await upsertSkillEntries.mutateAsync({
        sessionId: activeSessionId,
        entries: skillEntries,
      });

      setLastSaved(new Date());
      toast.success('Session saved');
    } catch (error) {
      toast.error('Failed to save session');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save with debounce
  useEffect(() => {
    if (!activeSessionId || !currentSession?.id) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [currentSession, skillEntries]);

  // Fetch assessment data
  const handleFetchAssessment = () => {
    if (email) {
      refetchAssessment();
    }
  };

  if (isLoadingSessions) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Email Input */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Load Assessment Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Child Email (for API)</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to fetch assessment data"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleFetchAssessment} 
                disabled={!email || isLoadingAssessment}
                className="bg-primary"
              >
                {isLoadingAssessment ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch Skills'}
              </Button>
            </div>
          </div>
          {assessmentData?.success && (
            <p className="text-sm text-muted-foreground">
              Found {assessmentData.expertActivitiesCount} expert activities across {skills.length} skills
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader className="py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Sessions ({sessions?.length || 0})
          </CardTitle>
          <Button onClick={handleCreateSession} size="sm" className="gap-1 bg-primary">
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <Accordion type="single" collapsible value={activeSessionId || undefined} onValueChange={setActiveSessionId}>
              {sessions.map((session) => (
                <AccordionItem key={session.id} value={session.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">Session {session.session_no}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(session.session_date), 'MMM d, yyyy')}
                      </span>
                      {session.attendance && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          session.attendance === 'present' ? 'bg-green-100 text-green-700' :
                          session.attendance === 'absent' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {session.attendance}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    {activeSessionId === session.id && (
                      <SessionEditor
                        session={currentSession || session}
                        skillEntries={skillEntries}
                        skills={skills}
                        isLoadingSkills={isLoadingSkills}
                        isSaving={isSaving}
                        lastSaved={lastSaved}
                        onUpdateSession={updateSessionField}
                        onUpdateSkillEntry={handleUpdateSkillEntry}
                        onRemoveSkillEntry={handleRemoveSkillEntry}
                        onAddSkill={handleAddSkill}
                        onSave={handleSave}
                      />
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No sessions yet. Create your first session above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Session Editor Component
interface SessionEditorProps {
  session: Partial<SessionDetail>;
  skillEntries: SkillEntry[];
  skills: any[];
  isLoadingSkills: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  onUpdateSession: <K extends keyof SessionDetail>(field: K, value: SessionDetail[K]) => void;
  onUpdateSkillEntry: (index: number, entry: SkillEntry) => void;
  onRemoveSkillEntry: (index: number) => void;
  onAddSkill: (isManual?: boolean) => void;
  onSave: () => void;
}

function SessionEditor({
  session,
  skillEntries,
  skills,
  isLoadingSkills,
  isSaving,
  lastSaved,
  onUpdateSession,
  onUpdateSkillEntry,
  onRemoveSkillEntry,
  onAddSkill,
  onSave,
}: SessionEditorProps) {
  return (
    <div className="space-y-6">
      {/* Save Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-muted-foreground">Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Saved at {format(lastSaved, 'HH:mm:ss')}</span>
            </>
          ) : null}
        </div>
        <Button onClick={onSave} disabled={isSaving} size="sm" className="gap-1">
          <Save className="h-4 w-4" />
          Save Now
        </Button>
      </div>

      {/* Session Top-Level Fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Session No</Label>
          <Input value={session.session_no || ''} disabled className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>Session Date</Label>
          <Input
            type="date"
            value={session.session_date || ''}
            onChange={(e) => onUpdateSession('session_date', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Session Type</Label>
          <Input value={session.session_type || 'child'} disabled className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>Attendance</Label>
          <Select 
            value={session.attendance || ''} 
            onValueChange={(v) => onUpdateSession('attendance', v as SessionDetail['attendance'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select attendance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="excused">Excused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Skill Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">Skills ({skillEntries.length})</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onAddSkill(false)} disabled={skills.length === 0}>
              <Plus className="h-4 w-4 mr-1" />
              Add from API
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddSkill(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Manual
            </Button>
          </div>
        </div>

        {isLoadingSkills ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : skillEntries.length > 0 ? (
          <div className="space-y-4">
            {skillEntries.map((entry, index) => (
              <SkillCard
                key={`skill-${index}`}
                entry={entry}
                skills={skills}
                order={index + 1}
                onChange={(e) => onUpdateSkillEntry(index, e)}
                onRemove={() => onRemoveSkillEntry(index)}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              No skills added yet. Click "Add from API" or "Add Manual" to add skills.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Session-Level Fields */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary">Session Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Session Report URL</Label>
            <Input
              value={session.session_report_url || ''}
              onChange={(e) => onUpdateSession('session_report_url', e.target.value)}
              placeholder="Enter PDF URL"
            />
          </div>
          <div className="space-y-2">
            <Label>Session Link URL</Label>
            <Input
              value={session.session_link_url || ''}
              onChange={(e) => onUpdateSession('session_link_url', e.target.value)}
              placeholder="Enter session link"
            />
          </div>
          <div className="space-y-2">
            <Label>Gemini Summary & Transcript URL</Label>
            <Input
              value={session.gemini_summary_url || ''}
              onChange={(e) => onUpdateSession('gemini_summary_url', e.target.value)}
              placeholder="Enter transcript URL"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
