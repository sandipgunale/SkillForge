import { apiClient } from "@/services/api/axios";

export const resourceApi = {
  /**
   * Get paginated resources
   */
  async getResources(params = {}) {
    const { data } = await apiClient.get("/v1/resources", { params });

    return {
      resources: data.content,
      page: data.number,
      size: data.size,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      first: data.first,
      last: data.last,
      empty: data.empty,
    };
  },

  /**
   * Get single resource
   */
  async getResource(resourceId) {
    const { data } = await apiClient.get(`/v1/resources/${resourceId}`);
    return data;
  },

  /**
   * Get all topics
   */
  async getTopics() {
    const { data } = await apiClient.get("/v1/topics");
    return data;
  },

  /**
   * Get related resources
   */
  async getRelatedResources(topicId, currentResourceId) {
    const { resources } = await this.getResources({
      topicId,
      size: 5,
    });

    return resources
      .filter(resource => resource.id !== currentResourceId)
      .slice(0, 4);
  },

  /**
   * Create resource
   */
  async createResource(payload) {
    const { data } = await apiClient.post("/v1/resources", payload);
    return data;
  },

  /**
   * Update resource
   */
  async updateResource(resourceId, payload) {
    const { data } = await apiClient.put(
      `/v1/resources/${resourceId}`,
      payload,
    );

    return data;
  },

  /**
   * Delete resource
   */
  async deleteResource(resourceId) {
    await apiClient.delete(`/v1/resources/${resourceId}`);
  },

  /**
   * Get the curriculum (sections -> lessons) for a resource/course.
   */
  async getCourseCurriculum(resourceId) {
    const { data } = await apiClient.get(`/v1/resources/${resourceId}/curriculum`);
    return data;
  },

  /**
   * Get the authenticated user's progress for a course.
   */
  async getCourseProgress(courseId) {
    const { data } = await apiClient.get(`/v1/resources/${courseId}/progress`);
    return data;
  },

  /**
   * Get the authenticated user's progress across many courses.
   * Returns a map of courseId -> CourseProgressDto.
   */
  async getCourseProgressBatch(courseIds = []) {
    if (!courseIds || courseIds.length === 0) {
      return { success: true, data: {} };
    }
    const params = { courseIds: courseIds.join(",") };
    const { data } = await apiClient.get("/v1/course-progress", { params });
    return data;
  },

  /**
   * Mark (or unmark) a lesson complete for the current user.
   */
  async setLessonComplete(courseId, lessonId, completed) {
    if (completed) {
      await apiClient.post(`/v1/resources/${courseId}/lessons/${lessonId}/complete`);
    } else {
      await apiClient.delete(`/v1/resources/${courseId}/lessons/${lessonId}/complete`);
    }
  },
};