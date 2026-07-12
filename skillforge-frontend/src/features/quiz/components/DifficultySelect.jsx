import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

export default function DifficultySelect({ value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>Difficulty</Label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="BEGINNER">Beginner</SelectItem>

          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>

          <SelectItem value="ADVANCED">Advanced</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
