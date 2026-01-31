import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check } from 'lucide-react';
import { ReactNode } from 'react';

interface SectionWrapperProps {
  title: string;
  icon: ReactNode;
  isSaving: boolean;
  hasChanges: boolean;
  children: ReactNode;
}

export function SectionWrapper({
  title,
  icon,
  isSaving,
  hasChanges,
  children,
}: SectionWrapperProps) {
  return (
    <Card className="border-primary/30 shadow-sm">
      <CardHeader className="pb-3 bg-primary/5 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-primary">{icon}</div>
            <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {isSaving ? (
              <div className="flex items-center gap-1 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : hasChanges ? (
              <div className="flex items-center gap-1 text-accent">
                <Check className="h-3 w-3" />
                <span>Saved</span>
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
