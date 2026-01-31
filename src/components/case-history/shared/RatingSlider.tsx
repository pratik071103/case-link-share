import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCallback, useState, useEffect, useRef } from 'react';

interface RatingSliderProps {
  label: string;
  description?: string;
  value: number;
  notes: string;
  onValueChange: (value: number) => void;
  onNotesChange: (notes: string) => void;
  min?: number;
  max?: number;
}

export function RatingSlider({
  label,
  description,
  value,
  notes,
  onValueChange,
  onNotesChange,
  min = 1,
  max = 5,
}: RatingSliderProps) {
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value);
  const [localNotes, setLocalNotes] = useState(notes);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external value when it changes (from DB load)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleSliderChange = useCallback((newValue: number[]) => {
    const val = newValue[0];
    setLocalValue(val);
    
    // Debounce the callback
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onValueChange(val);
    }, 300);
  }, [onValueChange]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalNotes(val);
    
    // Debounce the callback
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onNotesChange(val);
    }, 300);
  }, [onNotesChange]);

  return (
    <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Rating</span>
          <span className="text-sm font-semibold px-2 py-0.5 rounded bg-accent/20 text-accent">
            {localValue} / {max}
          </span>
        </div>
        <Slider
          value={[localValue]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />
      </div>
      
      <Textarea
        value={localNotes}
        onChange={handleNotesChange}
        placeholder="Additional notes..."
        className="min-h-[60px] text-sm"
      />
    </div>
  );
}
