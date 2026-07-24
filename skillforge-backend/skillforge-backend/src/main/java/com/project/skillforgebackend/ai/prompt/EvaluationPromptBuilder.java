package com.project.skillforgebackend.ai.prompt;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EvaluationPromptBuilder {
    private final ObjectMapper objectMapper;

    public String build(Quiz quiz) {

        StringBuilder prompt = new StringBuilder();

        prompt.append(buildRoleSection());

        prompt.append(buildEvaluationObjective());

        prompt.append(buildGlobalEvaluationRules());

        prompt.append(buildQuestionTypeRules());

        prompt.append(buildJsonContract());

        prompt.append(buildQuizMetadata(quiz));

        // Part-2
        prompt.append(buildQuestions(quiz));

        prompt.append(buildFinalInstructions());

        return prompt.toString();
    }

    /**
     * AI ROLE
     */
    private String buildRoleSection() {

        return """
==========================================================
ROLE
==========================================================

You are an Expert Technical Interview Panel.

You have over 20 years of experience evaluating
Software Engineers.

Your evaluation standards are comparable to interviews
conducted by:

• Google

• Microsoft

• Amazon

• Meta

• Netflix

• Atlassian

• Oracle

• Stripe

• Uber

You evaluate candidates based on:

✓ Technical Accuracy

✓ Problem Solving

✓ Engineering Thinking

✓ Best Practices

✓ Communication

✓ Code Quality

✓ Reasoning

✓ Practical Knowledge

Never hallucinate.

Never assume missing information.

Evaluate ONLY the supplied answers.

""";
    }

    /**
     * Evaluation Objective
     */
    private String buildEvaluationObjective() {

        return """
==========================================================
EVALUATION OBJECTIVE
==========================================================

Evaluate every answer fairly.

Reward correct reasoning.

Reward partially correct understanding
whenever appropriate.

Never penalize formatting differences.

Never invent user answers.

If the learner provides a technically
valid alternative solution,
consider it correct.

Provide constructive feedback.

Explain WHY an answer is correct
or incorrect.

Feedback should help the learner improve.

""";
    }

    /**
     * Global Rules
     */
    private String buildGlobalEvaluationRules() {

        return """
==========================================================
GLOBAL EVALUATION RULES
==========================================================

Rules:

✓ Evaluate every question independently.

✓ Ignore whitespace differences.

✓ Ignore capitalization differences.

✓ Ignore minor formatting differences.

✓ Never leave feedback empty.

✓ Every evaluation must contain

questionId

isCorrect

feedback

✓ Overall feedback should summarize
overall performance.

✓ Strengths should contain positive observations.

✓ Weaknesses should identify improvement areas.

✓ Improvements should contain actionable suggestions.

Never generate invalid JSON.

Never generate Markdown.

Return ONLY JSON.

""";
    }

    /**
     * Question Type Rules
     */
    private String buildQuestionTypeRules() {

        return """
==========================================================
QUESTION TYPE EVALUATION RULES
==========================================================

MCQ

Evaluate by comparing the selected answer
with the correct answer.

If both match

isCorrect = true

Otherwise false.

Feedback should explain why.

----------------------------------------------------------

CODING

Evaluate:

✓ Algorithm

✓ Logic

✓ Time Complexity

✓ Space Complexity

✓ Edge Cases

✓ Engineering Practices

Do NOT require identical code.

Reward logically correct solutions.

----------------------------------------------------------

INTERVIEW

Evaluate:

✓ Conceptual Understanding

✓ Technical Accuracy

✓ Communication

✓ Reasoning

✓ Best Practices

✓ Trade-offs

Avoid keyword matching.

Reward clear explanations.

----------------------------------------------------------

SCENARIO

Evaluate:

✓ Problem Analysis

✓ Decision Making

✓ Architecture

✓ Performance

✓ Security

✓ Trade-offs

✓ Alternative Solutions

Do not expect one fixed answer.

Reward strong engineering judgement.

""";
    }

    /**
     * JSON Contract
     */
    private String buildJsonContract() {

        return """
==========================================================
STRICT JSON CONTRACT
==========================================================

Return ONLY valid UTF-8 JSON.

Do NOT return Markdown.

Do NOT wrap JSON
inside ```json.

Return ONLY the JSON object.

Root Object

{

"overallFeedback":"",

"strengths":[
"..."
],

"weaknesses":[
"..."
],

"improvements":[
"..."
],

"evaluations":[

{

"questionId":"",

"isCorrect":true,

"feedback":""

}

]

}

Every evaluation object MUST contain

questionId

isCorrect

feedback

Do NOT omit any field.

""";
    }

    /**
     * Quiz Metadata
     */
    private String buildQuizMetadata(Quiz quiz) {

        return """
==========================================================
QUIZ INFORMATION
==========================================================

Topic

%s

Difficulty

%s

Questions

"""
                .formatted(

                        quiz.getSource() == QuizSource.TOPIC
                                ? quiz.getTopic().getName()
                                : quiz.getLearningPath().getTitle(),

                        quiz.getDifficulty().name()

                );

    }

    /**
     * Build Question Section
     */
    private String buildQuestions(Quiz quiz) {

        StringBuilder builder = new StringBuilder();

        builder.append("\n");

        builder.append("""
==========================================================
QUESTIONS
==========================================================

""");

        int index = 1;

        for (Question question : quiz.getQuestions()) {

            builder.append("Question ").append(index++).append("\n");

            builder.append("Question ID : ")
                    .append(question.getId())
                    .append("\n");

            builder.append("Type : ")
                    .append(question.getType())
                    .append("\n\n");

            switch (question.getType()) {

                case MCQ -> {

                    builder.append("""
Question

""");

                    builder.append(question.getContent())
                            .append("\n\n");

                    builder.append("""
Options

""");

                    builder.append(formatOptions(question.getOptionsJson()))
                            .append("\n");

                    builder.append("Correct Answer\n\n");

                    builder.append(question.getCorrectAnswer())
                            .append("\n\n");

                    builder.append("User Answer\n\n");

                    builder.append(question.getUserAnswer())
                            .append("\n\n");
                }

                case CODING -> {

                    builder.append("""
Coding Problem

""");

                    builder.append(question.getContent())
                            .append("\n\n");

                    builder.append("""
Expected Solution

""");

                    builder.append(question.getCorrectAnswer())
                            .append("\n\n");

                    builder.append("""
Candidate Solution

""");

                    builder.append(question.getUserAnswer())
                            .append("\n\n");
                }

                case INTERVIEW -> {

                    builder.append("""
Interview Question

""");

                    builder.append(question.getContent())
                            .append("\n\n");

                    builder.append("""
Ideal Answer

""");

                    builder.append(question.getCorrectAnswer())
                            .append("\n\n");

                    builder.append("""
Candidate Answer

""");

                    builder.append(question.getUserAnswer())
                            .append("\n\n");
                }

                case SCENARIO -> {

                    builder.append("""
Scenario

""");

                    builder.append(question.getContent())
                            .append("\n\n");

                    builder.append("""
Expected Engineering Approach

""");

                    builder.append(question.getCorrectAnswer())
                            .append("\n\n");

                    builder.append("""
Candidate Response

""");

                    builder.append(question.getUserAnswer())
                            .append("\n\n");
                }
            }

            builder.append("""
----------------------------------------------------------

""");
        }

        return builder.toString();
    }

    /**
     * Final Instructions
     */
    private String buildFinalInstructions() {

        return """
==========================================================
FINAL VALIDATION
==========================================================

Before generating the response verify:

✓ Every question has been evaluated.

✓ Every evaluation contains

- questionId
- isCorrect
- feedback

✓ Overall feedback summarizes the quiz.

✓ Strengths contain meaningful positive observations.

✓ Weaknesses contain meaningful improvement areas.

✓ Improvements provide practical and actionable advice.

✓ JSON is valid.

✓ JSON contains no Markdown.

✓ JSON contains no comments.

✓ JSON contains no trailing commas.

✓ No fields are omitted.

✓ Do NOT invent user answers.

✓ Do NOT invent questions.

✓ Do NOT modify question IDs.

✓ Use the supplied question IDs exactly.

✓ Evaluate ONLY the provided user answers.

✓ Reward partially correct reasoning when appropriate.

✓ Coding questions should prioritize logic over syntax.

✓ Interview questions should prioritize understanding over memorization.

✓ Scenario questions should prioritize engineering judgement over a single fixed answer.

==========================================================

Your goal is not merely to assign correct or incorrect labels.

Your goal is to provide fair, educational, professional feedback that helps the learner improve.

The response should resemble feedback from a Senior Software Engineer conducting a technical interview at a top technology company.

Return ONLY the JSON object.

""";
    }

    private String formatOptions(String optionsJson) {

        if (optionsJson == null || optionsJson.isBlank()) {
            return "";
        }

        try {

            List<String> options = objectMapper.readValue(
                    optionsJson,
                    new TypeReference<List<String>>() {}
            );

            StringBuilder builder = new StringBuilder();

            char option = 'A';

            for (String value : options) {

                builder.append(option++)
                        .append(". ")
                        .append(value)
                        .append("\n");
            }

            return builder.toString();

        } catch (Exception ex) {
            log.warn("Failed to format MCQ options for prompt.", ex);
            return optionsJson;
        }
    }

}