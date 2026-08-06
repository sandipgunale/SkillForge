import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LearningPathForm({
  initialValues,
  onSubmit,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    title: initialValues?.title ?? "",
    goal: initialValues?.goal ?? "",
    skillLevel: initialValues?.skillLevel ?? "BEGINNER",
    weeklyHours: initialValues?.weeklyHours ?? 10,
    durationWeeks: initialValues?.durationWeeks ?? 12,
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Title</Label>

        <Input name="title" value={formData.title} onChange={handleChange} />
      </div>

      <div>
        <Label>Goal</Label>

        <Textarea name="goal" value={formData.goal} onChange={handleChange} />
      </div>

      <div>
        <Label>Skill Level</Label>

        <Select
          name="skillLevel"
          value={formData.skillLevel}
          onValueChange={(value) =>
            handleChange({ target: { name: "skillLevel", value } })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Skill Level" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="BEGINNER">Beginner</SelectItem>

            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>

            <SelectItem value="ADVANCED">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Weekly Hours</Label>

        <Input
          type="number"
          name="weeklyHours"
          value={formData.weeklyHours}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label>Duration (Weeks)</Label>

        <Input
          type="number"
          name="durationWeeks"
          value={formData.durationWeeks}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Learning Path"}
      </Button>
    </form>
  );
}
