import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Plus, ChevronDown } from 'lucide-react';
import { useState, useCallback } from 'react';

const DEFAULT_PARENTAL_CONCERNS = [
  'Speech delay',
  'Attention span',
  'Hyperactivity',
  'Emotional regulation',
  'Social skills',
  'Academic performance',
  'Behavioral issues',
  'Motor skills',
  'Sleep issues',
  'Anxiety',
];

interface ConcernsFieldsProps {
  parentalConcerns: string[];
  teacherConcerns: string;
  onParentalConcernsChange: (concerns: string[]) => void;
  onTeacherConcernsChange: (concerns: string) => void;
}

export function ConcernsFields({
  parentalConcerns,
  teacherConcerns,
  onParentalConcernsChange,
  onTeacherConcernsChange,
}: ConcernsFieldsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customConcern, setCustomConcern] = useState('');

  const handleToggleConcern = useCallback((concern: string) => {
    const newConcerns = parentalConcerns.includes(concern)
      ? parentalConcerns.filter((c) => c !== concern)
      : [...parentalConcerns, concern];
    onParentalConcernsChange(newConcerns);
  }, [parentalConcerns, onParentalConcernsChange]);

  const handleAddCustomConcern = useCallback(() => {
    if (customConcern.trim() && !parentalConcerns.includes(customConcern.trim())) {
      onParentalConcernsChange([...parentalConcerns, customConcern.trim()]);
      setCustomConcern('');
    }
  }, [customConcern, parentalConcerns, onParentalConcernsChange]);

  const handleRemoveConcern = useCallback((concern: string) => {
    onParentalConcernsChange(parentalConcerns.filter((c) => c !== concern));
  }, [parentalConcerns, onParentalConcernsChange]);

  // Combine default and custom options
  const allOptions = [...new Set([...DEFAULT_PARENTAL_CONCERNS, ...parentalConcerns])];

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Parental Concerns</Label>
        
        {/* Selected concerns as badges */}
        {parentalConcerns.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {parentalConcerns.map((concern) => (
              <Badge
                key={concern}
                variant="secondary"
                className="bg-accent/20 text-accent-foreground border border-accent/30 px-2 py-1"
              >
                {concern}
                <button
                  type="button"
                  onClick={() => handleRemoveConcern(concern)}
                  className="ml-1.5 hover:text-destructive focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Dropdown for selecting concerns */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between text-muted-foreground font-normal"
            >
              Select concerns...
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-2" align="start">
            <div className="space-y-2">
              {/* Add custom concern */}
              <div className="flex gap-2 pb-2 border-b">
                <Input
                  placeholder="Add custom concern..."
                  value={customConcern}
                  onChange={(e) => setCustomConcern(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomConcern();
                    }
                  }}
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomConcern}
                  disabled={!customConcern.trim()}
                  className="h-8 px-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Options list */}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {allOptions.map((concern) => (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => handleToggleConcern(concern)}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
                      parentalConcerns.includes(concern)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {concern}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teacher_concerns" className="text-sm font-medium">
          Teacher Concerns
        </Label>
        <Textarea
          id="teacher_concerns"
          value={teacherConcerns}
          onChange={(e) => onTeacherConcernsChange(e.target.value)}
          placeholder="Enter any concerns raised by teachers..."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}
