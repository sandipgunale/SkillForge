import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { resourceApi } from "../api/resource.api";

export function useCourseProgress(courseId) {
  return useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: () => resourceApi.getCourseProgress(courseId),
    enabled: !!courseId,
    retry: false,
  });
}

export function useMarkLessonComplete(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, completed }) =>
      resourceApi.setLessonComplete(courseId, lessonId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseProgress", courseId] });
      queryClient.invalidateQueries({ queryKey: ["userCourseProgress"] });
    },
  });
}

export function useUserCourseProgress(courseIds) {
  return useQuery({
    queryKey: ["userCourseProgress", courseIds],
    queryFn: () => resourceApi.getCourseProgressBatch(courseIds ?? []),
    enabled: Array.isArray(courseIds) && courseIds.length > 0,
    retry: false,
  });
}
