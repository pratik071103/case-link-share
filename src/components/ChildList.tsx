import { useChildren } from '@/hooks/useChildren';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export function ChildList() {
  const { data: children, isLoading, error } = useChildren();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load children: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!children?.length) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Cases Yet</h3>
            <p className="text-muted-foreground">
              Click "Add Child" to create your first case record.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {children.map((child) => (
        <Card key={child.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{child.name}</CardTitle>
            <CardDescription>
              Created {format(new Date(child.created_at), 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <code className="text-xs bg-muted px-2 py-1 rounded">
                /case/{child.case_slug}
              </code>
              <Button asChild size="sm" variant="outline" className="gap-1">
                <Link to={`/case/${child.case_slug}`}>
                  Open <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
