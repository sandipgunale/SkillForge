package com.project.skillforgebackend.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.skillforgebackend.ai.client.GeminiClient;
import com.project.skillforgebackend.ai.dto.AIEvaluationResponse;
import com.project.skillforgebackend.ai.dto.AIQuizResponse;
import com.project.skillforgebackend.ai.dto.QuestionResponse;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.resource.entity.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

//    private final GeminiClient openAIClient;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    /**
     * Generates quiz questions using OpenAI.
     */
    public List<Question> generateQuestions(
            String topicName,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> types) {

        String prompt = buildQuizGenerationPrompt(
                topicName,
                difficulty,
                count,
                types
        );
        log.info("========== PROMPT ==========");
        log.info(prompt);
        log.info("============================");
        String response = geminiClient.complete(prompt);
        log.info("Raw OpenAI Response:\n{}", response);
        try {

            return parseQuestionsFromJson(response);

        } catch (Exception ex) {

            log.error("Failed to parse generated questions.", ex);

            throw new AIServiceException(
                    "Failed to generate quiz questions.",
                    ex
            );
        }
    }

    /**
     * Evaluates a completed quiz using AI.
     */
    public QuizResultDto evaluateQuiz(Quiz quiz) {

        String prompt = buildEvaluationPrompt(quiz);
        log.info("========== PROMPT ==========");
        log.info(prompt);
        log.info("============================");
        String response = geminiClient.complete(prompt);
        log.info("Raw OpenAI Response:\n{}", response);
        try {

            return parseEvaluationFromJson(
                    response,
                    quiz
            );

        } catch (Exception ex) {

            log.error("Failed to evaluate quiz.", ex);

            throw new AIServiceException(
                    "Failed to evaluate quiz.",
                    ex
            );
        }
    }
    // ==========================================================
    // Prompt Builders
    // ==========================================================

    /**
     * Builds the prompt used to generate quiz questions.
     */
    private String buildQuizGenerationPrompt(
            String topic,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> types) {

        String questionTypes =
                (types == null || types.isEmpty())
                        ? "MCQ"
                        : types.stream()
                        .map(Enum::name)
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("MCQ");

        return """
                You are an expert technical educator.

                Generate exactly %d interview-quality quiz questions.

                Topic:
                %s

                Difficulty:
                %s

                Question Types:
                %s

                IMPORTANT RULES

                1. Return ONLY valid JSON.
                2. Do NOT return markdown.
                3. Do NOT wrap JSON inside ```json.
                4. Do NOT return explanations.
                5. Generate exactly %d questions.
                6. Every MCQ must contain exactly 4 options.
                7. Coding questions should include a coding problem.
                8. Interview questions should test conceptual understanding.
                9. Scenario questions should contain realistic situations.
                10. Questions must be technically accurate.
                11. Do not hallucinate APIs or concepts.
                12. If unsure, generate another valid question.
                13. correctAnswer must exactly match one option.
                14. Return valid UTF-8 JSON only.

                JSON FORMAT

                {
                  "questions":[
                    {
                      "type":"MCQ",
                      "content":"Question",
                      "options":[
                        "Option A",
                        "Option B",
                        "Option C",
                        "Option D"
                      ],
                      "correctAnswer":"Option A",
                      "orderIndex":1
                    }
                  ]
                }
                """
                .formatted(
                        count,
                        topic,
                        difficulty.name(),
                        questionTypes,
                        count
                );
    }

    /**
     * Builds the prompt used to evaluate quiz answers.
     */
    private String buildEvaluationPrompt(Quiz quiz) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are an expert technical interviewer.

                Evaluate the following quiz answers.

                Return ONLY valid JSON.

                JSON FORMAT:

                {
                  "overallFeedback":"Overall performance summary",
                  "strengths":[
                    "Strength 1",
                    "Strength 2"
                  ],
                  "weaknesses":[
                    "Weakness 1"
                  ],
                  "improvements":[
                    "Improvement 1"
                  ],
                  "evaluations":[
                    {
                      "questionId":"uuid",
                      "isCorrect":true,
                      "feedback":"Detailed explanation"
                    }
                  ]
                }

                Quiz Details

                Topic: %s
                Difficulty: %s

                Questions:

                """.formatted(
                quiz.getTopic().getName(),
                quiz.getDifficulty().name()
        ));

        for (Question question : quiz.getQuestions()) {

            prompt.append("""
                    --------------------------------------------------

                    Question ID:
                    %s

                    Type:
                    %s

                    Question:
                    %s

                    Correct Answer:
                    %s

                    User Answer:
                    %s
                    
                    IMPORTANT:
                    
                    1. If the user's answer exactly matches the correct answer,
                       set "isCorrect" to true.
                    
                    2. Ignore whitespace differences.
                    
                    3. Ignore formatting differences.
                    
                    4. Every evaluation MUST contain:
                    
                       questionId
                    
                       isCorrect
                    
                       feedback
                    
                    5. feedback must never be null.
                    
                    6. If the answer is correct,
                       provide positive feedback.
                    
                    7. If incorrect,
                       explain why and give the correct reasoning.

                    """
                    .formatted(
                            question.getId(),
                            question.getType(),
                            question.getContent(),
                            question.getCorrectAnswer(),
                            question.getUserAnswer()
                    ));
        }

        return prompt.toString();
    }
    // ==========================================================
    // JSON Parsers
    // ==========================================================

    /**
     * Converts the AI JSON response into Question entities.
     */
    private List<Question> parseQuestionsFromJson(String json)
            throws Exception {

        AIQuizResponse response = objectMapper.readValue(
                cleanJson(json),
                AIQuizResponse.class
        );

        if (response == null
                || response.getQuestions() == null
                || response.getQuestions().isEmpty()) {

            throw new AIServiceException(
                    "No questions were generated by AI."
            );
        }

        return response.getQuestions()
                .stream()
                .filter(question ->
                        question.getContent() != null
                                && !question.getContent().isBlank()
                                && question.getCorrectAnswer() != null
                                && !question.getCorrectAnswer().isBlank()
                )
                .map(this::mapToQuestion)
                .toList();
    }

    /**
     * Maps QuestionResponse DTO to Question entity.
     */
    private Question mapToQuestion(
            QuestionResponse dto) {

        try {

            if (dto.getContent() == null
                    || dto.getContent().isBlank()) {

                throw new AIServiceException(
                        "AI returned an empty question."
                );
            }

            if (dto.getCorrectAnswer() == null
                    || dto.getCorrectAnswer().isBlank()) {

                throw new AIServiceException(
                        "AI returned an invalid correct answer."
                );
            }

            if (dto.getType() == Question.QuestionType.MCQ) {

                if (dto.getOptions() == null
                        || dto.getOptions().size() != 4) {

                    throw new AIServiceException(
                            "MCQ must contain exactly 4 options."
                    );
                }

                if (!dto.getOptions().contains(dto.getCorrectAnswer())) {

                    throw new AIServiceException(
                            "Correct answer is not present in options."
                    );
                }
            }

            String optionsJson = dto.getOptions() == null
                    ? null
                    : objectMapper.writeValueAsString(dto.getOptions());

            return Question.builder()
                    .type(dto.getType())
                    .content(dto.getContent())
                    .optionsJson(optionsJson)
                    .correctAnswer(dto.getCorrectAnswer())
                    .orderIndex(
                            dto.getOrderIndex() == null
                                    ? 0
                                    : dto.getOrderIndex()
                    )
                    .build();

        } catch (AIServiceException ex) {

            throw ex;

        } catch (Exception ex) {

            throw new AIServiceException(
                    "Failed to convert AI question.",
                    ex
            );
        }
    }
    /**
     * Parses AI evaluation response and converts it into QuizResultDto.
     */
    private QuizResultDto parseEvaluationFromJson(
            String json,
            Quiz quiz) throws Exception {

        AIEvaluationResponse response =
                objectMapper.readValue(
                        cleanJson(json),
                        AIEvaluationResponse.class
                );

        if (response == null) {
            throw new AIServiceException(
                    "Invalid AI evaluation response."
            );
        }

        if (response.getEvaluations() != null) {

            response.getEvaluations().forEach(evaluation ->

                    quiz.getQuestions().stream()
                            .filter(question ->
                                    question.getId().equals(
                                            evaluation.getQuestionId()
                                    )
                            )
                            .findFirst()
                            .ifPresent(question -> {

                                question.setIsCorrect(
                                        evaluation.getIsCorrect()
                                );

                                question.setAiFeedback(
                                        evaluation.getFeedback()
                                );

                            })
            );
        }

        int score = (int) quiz.getQuestions()
                .stream()
                .filter(question ->
                        Boolean.TRUE.equals(question.getIsCorrect()))
                .count();

        quiz.setScore(score);

        List<QuizResultDto.QuestionResultDto> questionResults =
                quiz.getQuestions()
                        .stream()
                        .map(question ->

                                QuizResultDto.QuestionResultDto.builder()

                                        .questionId(
                                                question.getId().toString()
                                        )

                                        .content(
                                                question.getContent()
                                        )

                                        .correctAnswer(
                                                question.getCorrectAnswer()
                                        )

                                        .userAnswer(
                                                question.getUserAnswer()
                                        )

                                        .isCorrect(
                                                Boolean.TRUE.equals(
                                                        question.getIsCorrect()
                                                )
                                        )

                                        .aiFeedback(
                                                question.getAiFeedback()
                                        )

                                        .build()

                        )
                        .toList();

        double percentage = quiz.getMaxScore() == 0
                ? 0
                : ((double) score / quiz.getMaxScore()) * 100;

        return QuizResultDto.builder()

                .quizId(
                        quiz.getId().toString()
                )

                .score(score)

                .maxScore(
                        quiz.getMaxScore()
                )

                .percentage(
                        Math.round(percentage * 100.0) / 100.0
                )

                .overallFeedback(
                        response.getOverallFeedback()
                )

                .strengths(
                        response.getStrengths()
                )

                .weaknesses(
                        response.getWeaknesses()
                )

                .improvements(
                        response.getImprovements()
                )

                .questions(
                        questionResults
                )

                .build();
    }

    /**
     * Cleans AI response before JSON parsing.
     */
    private String cleanJson(String response) {

        if (response == null) {
            return "";
        }

        response = response.trim();

        response = response.replace("```json", "");
        response = response.replace("```", "");

        int first = response.indexOf('{');
        int last = response.lastIndexOf('}');

        if (first >= 0 && last > first) {
            response = response.substring(first, last + 1);
        }

        return response.trim();
    }

}