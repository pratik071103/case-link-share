import { useSessions, useCreateSession, useUpdateSession, useDeleteSession, Session } from '@/hooks/useSessions';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface SessionListProps {
  childId: string;
}

export function SessionList({ childId }: SessionListProps) {
  const { data: sessions, isLoading } = useSessions(childId);
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [newSessionDate, setNewSessionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newSessionNotes, setNewSessionNotes] = useState('');

  const handleAddSession = async () => {
    try {
      const notes: Json = { content: newSessionNotes };
      await createSession.mutateAsync({
        childId,
        sessionDate: newSessionDate,
        notes,
      });
      toast.success('Session added');
      setAddDialogOpen(false);
      setNewSessionDate(format(new Date(), 'yyyy-MM-dd'));
      setNewSessionNotes('');
    } catch (error) {
      toast.error('Failed to add session');
    }
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;
    try {
      const notes: Json = { content: newSessionNotes };
      await updateSession.mutateAsync({
        sessionId: editingSession.id,
        notes,
      });
      toast.success('Session updated');
      setEditingSession(null);
      setNewSessionNotes('');
    } catch (error) {
      toast.error('Failed to update session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession.mutateAsync({ sessionId, childId });
      toast.success('Session deleted');
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const startEditing = (session: Session) => {
    setEditingSession(session);
    const notes = session.notes as { content?: string } | null;
    setNewSessionNotes(notes?.content || '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sessions
        </h3>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="session-date">Session Date</Label>
                <Input
                  id="session-date"
                  type="date"
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-notes">Notes</Label>
                <Textarea
                  id="session-notes"
                  value={newSessionNotes}
                  onChange={(e) => setNewSessionNotes(e.target.value)}
                  placeholder="Enter session notes..."
                  className="min-h-[150px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSession} disabled={createSession.isPending}>
                {createSession.isPending ? 'Adding...' : 'Add Session'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Session Date</Label>
              <p className="text-sm text-muted-foreground">
                {editingSession && format(new Date(editingSession.session_date), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-session-notes">Notes</Label>
              <Textarea
                id="edit-session-notes"
                value={newSessionNotes}
                onChange={(e) => setNewSessionNotes(e.target.value)}
                placeholder="Enter session notes..."
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSession(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSession} disabled={updateSession.isPending}>
              {updateSession.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sessions?.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No sessions recorded yet. Click "Add Session" to create one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions?.map((session) => {
            const notes = session.notes as { content?: string } | null;
            return (
              <Card key={session.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {format(new Date(session.session_date), 'MMMM d, yyyy')}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => startEditing(session)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {notes?.content || 'No notes recorded.'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
