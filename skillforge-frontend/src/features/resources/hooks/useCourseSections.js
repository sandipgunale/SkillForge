import { useMutation, useQueryClient } from "@tanstack/react-query";

import { courseSectionApi } from "../api/courseSection.api";
import { contentItemApi } from "../api/contentItem.api";

function useCourseInvalidate(courseId) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ["courseCurriculum", courseId] });
}

export function useCreateSection(courseId) {
  const invalidate = useCourseInvalidate(courseId);
  return useMutation({
    mutationFn: (payload) => courseSectionApi.createSection(courseId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateSection(courseId) {
  const invalidate = useCourseInvalidate(courseId);
  return useMutation({
    mutationFn: ({ sectionId, payload }) =>
      courseSectionApi.updateSection(sectionId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteSection(courseId) {
  const invalidate = useCourseInvalidate(courseId);
  return useMutation({
    mutationFn: (sectionId) => courseSectionApi.deleteSection(sectionId),
    onSuccess: invalidate,
  });
}

export function useReorderSections(courseId) {
  const invalidate = useCourseInvalidate(courseId);
  return useMutation({
    mutationFn: (orderedIds) =>
      courseSectionApi.reorderSections(courseId, orderedIds),
    onSuccess: invalidate,
  });
}

export function useCreateLesson(courseId) {
  const invalidate = useCourseInvalidate(courseId);
  return useMutation({
    mutationFn: (payload) => contentItemApi.createContentItem(courseId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateLesson(courseId) {
  const invalidate = useCourseInvalidate(courseId);
  return useMutation({
    mutationFn: ({ lessonId, payload }) =>
      contentItemApi.updateContentItem(lessonId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteLesson(courseId) {
  const invalidate = useCourseInvalidate(courseId);
  return useMutation({
    mutationFn: (lessonId) => contentItemApi.deleteContentItem(lessonId),
    onSuccess: invalidate,
  });
}
