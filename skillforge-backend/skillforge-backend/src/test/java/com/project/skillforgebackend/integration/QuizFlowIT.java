package com.project.skillforgebackend.integration;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.ai.service.AIService;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.resource.repository.TopicRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full quiz lifecycle against real PostgreSQL: generate (AI mocked),
 * fetch detail, submit answers, retrieve result via the offline
 * grading fallback, and confirm history — exercising Flyway schema,
 * JPA entity graphs, security, and the AI-outage resilience path.
 */
class QuizFlowIT extends BaseIntegrationTest {

    @MockitoBean
    private AIService aiService;

    @Autowired
    private TopicRepository topicRepository;

    @Test
    void fullQuizLifecycleWithOfflineGrading() throws Exception {
        String token = registerAndLogin(uniqueEmail());

        Topic topic = topicRepository.save(Topic.builder()
                .name("Java Concurrency " + UUID.randomUUID().toString().substring(0, 8))
                .slug("java-concurrency-" + UUID.randomUUID())
                .description("Integration test topic")
                .icon("code")
                .displayOrder(1)
                .build());

        String correctAnswer = "A lock shared by threads";
        Question question = Question.builder()
                .type(Question.QuestionType.MCQ)
                .content("What is a monitor in Java?")
                .optionsJson("""
                        ["%s","A CPU core","A garbage collector","A bytecode verifier"]
                        """.formatted(correctAnswer))
                .correctAnswer(correctAnswer)
                .orderIndex(0)
                .build();

        when(aiService.generateQuestions(
                anyString(), any(Resource.Difficulty.class), eq(1), any()))
                .thenReturn(List.of(question));
        when(aiService.evaluateQuiz(any()))
                .thenThrow(new AIServiceException("Simulated Gemini outage"));

        String quizJson = mockMvc.perform(post("/api/v1/quizzes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"source":"TOPIC","topicId":"%s","difficulty":"BEGINNER",
                                 "questionCount":1,"questionTypes":["MCQ"]}
                                """.formatted(topic.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.totalQuestions").value(1))
                .andExpect(jsonPath("$.data.questions[0].content").value("What is a monitor in Java?"))
                .andReturn().getResponse().getContentAsString();

        String quizId = objectMapper.readTree(quizJson).at("/data/id").asText();

        String detail = mockMvc.perform(get("/api/v1/quizzes/" + quizId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.questions[0].options[0]").value(correctAnswer))
                .andReturn().getResponse().getContentAsString();

        String questionId = objectMapper.readTree(detail)
                .at("/data/questions/0/id").asText();

        mockMvc.perform(post("/api/v1/quizzes/" + quizId + "/submit")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"answers":[{"questionId":"%s","answer":"%s"}]}
                                """.formatted(questionId, correctAnswer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.summary.score").value(1))
                .andExpect(jsonPath("$.data.summary.maxScore").value(1))
                .andExpect(jsonPath("$.data.questions[0].correct").value(true));

        mockMvc.perform(get("/api/v1/quizzes/" + quizId + "/result")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.questions[0].userAnswer").value(correctAnswer))
                .andExpect(jsonPath("$.data.questions[0].correct").value(true));

        mockMvc.perform(get("/api/v1/quizzes/history")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.content[0].totalQuestions").value(1));
    }
}
