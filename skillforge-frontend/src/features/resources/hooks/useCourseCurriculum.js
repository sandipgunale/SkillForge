import { useQuery } from "@tanstack/react-query";

import { resourceApi } from "../api/resource.api";

export function useCourseCurriculum(resourceId) {
  return useQuery({
    queryKey: ["courseCurriculum", resourceId],
    queryFn: () => resourceApi.getCourseCurriculum(resourceId),
    enabled: !!resourceId,
  });
}
