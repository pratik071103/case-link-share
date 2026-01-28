import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseHistorySectionProps {
  title: string;
  sectionKey: string;
  initialValue: string;
  onUpdate: (value: string) => void;
  isSaving?: boolean;
}

export function CaseHistorySection({ 
  title, 
  sectionKey, 
  initialValue, 
  onUpdate,
  isSaving 
}: CaseHistorySectionProps) {
  const [value, setValue] = useState(initialValue);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setHasChanges(true);
    onUpdate(newValue);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : hasChanges ? (
              <>
                <Check className="h-3 w-3 text-primary" />
                <span className="text-primary">Saved</span>
              </>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${title.toLowerCase()} information...`}
          className={cn(
            "min-h-[120px] resize-y",
            "focus:ring-primary"
          )}
        />
      </CardContent>
    </Card>
  );
}
