package com.project.skillforgebackend.ai.prompt;

import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.resource.entity.Resource;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuizPromptBuilder {

    public String build(
            String topic,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> types
    ) {

        String questionTypes = (types == null || types.isEmpty())
                ? "MCQ"
                : types.stream()
                .map(Enum::name)
                .collect(Collectors.joining(", "));

        StringBuilder prompt = new StringBuilder();

        prompt.append(buildRoleSection());

        prompt.append(buildObjectiveSection());

        prompt.append(buildInputSection(
                topic,
                difficulty,
                count,
                questionTypes
        ));

        prompt.append(buildDifficultySection());

        prompt.append(buildDistributionSection(count));

        prompt.append(buildGlobalRulesSection());

        prompt.append(buildMCQRules());

        prompt.append(buildCodingRules());

        prompt.append(buildInterviewRules());

        prompt.append(buildScenarioRules());

        // Part-2
        prompt.append(buildJsonContract());

        prompt.append(buildOutputExample());

        return prompt.toString();
    }

    public String build(
            List<String> topics,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> types
    ){
        String questionTypes =
                (types == null || types.isEmpty())
                        ? "MCQ"
                        : types.stream()
                        .map(Enum::name)
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("MCQ");

        String topicList = topics.stream()
                .map(topic -> "- " + topic)
                .reduce((a, b) -> a + "\n" + b)
                .orElse("");

        return """
You are a Senior Software Engineer, Technical Interviewer, Software Architect, and Technical Educator.

Generate a comprehensive assessment that evaluates the learner's understanding of the entire learning path.

Generate EXACTLY %d questions.

LEARNING PATH TOPICS

%s

DIFFICULTY

%s

REQUESTED QUESTION TYPES

%s

==================================================
TOPIC COVERAGE RULES
==================================================

1. Cover ALL provided topics.

2. Distribute questions across ALL topics.

3. No topic should dominate unless it is significantly larger.

4. Questions should assess both individual concepts and relationships between topics.

==================================================
QUESTION DISTRIBUTION RULES
==================================================

• Generate ONLY the requested Question Types.

• If one type is selected,
generate all questions using that type.

• If multiple types are selected,
distribute them as evenly as possible.

==================================================
QUESTION TYPE REQUIREMENTS
==================================================

MCQ

• Exactly 4 options.
• One correct answer.

CODING

• Real implementation problems.
• No MCQ options.

INTERVIEW

• Conceptual reasoning.
• Architecture.
• Best practices.

SCENARIO

• Practical software engineering situations.
• Decision making.
• Debugging.
• System thinking.

==================================================
QUALITY REQUIREMENTS
==================================================

• Generate EXACTLY %d questions.
• Cover beginner to advanced concepts according to requested difficulty.
• Avoid duplicate questions.
• Use production-oriented examples.
• Prefer industry interview quality.
• Do not invent technologies.
• Ensure technical correctness.

==================================================
JSON RULES
==================================================

Return ONLY valid UTF-8 JSON.

Do NOT return markdown.

Do NOT wrap JSON inside ```json.

Do NOT include explanations.

Do NOT include comments.

Do NOT include notes.

Do NOT output anything outside JSON.

==================================================
JSON FORMAT
==================================================

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
                        topicList,
                        difficulty.name(),
                        questionTypes,
                        count
                );
    }

    /**
     * AI Role
     */
    private String buildRoleSection() {

        return """
==========================================================
ROLE
==========================================================

You are an Expert Technical Assessment Generator.

You have over 20 years of experience designing hiring assessments
for Software Engineers.

Your assessments match the quality expected in technical interviews
conducted by companies like:

• Google
• Microsoft
• Amazon
• Meta
• Netflix
• Atlassian
• Oracle
• Adobe
• Uber
• Stripe

You are NOT a teacher.

You are NOT an exam paper generator.

You are a Professional Technical Interviewer whose responsibility
is to evaluate real software engineering ability.

Never generate textbook-style questions unless explicitly requested.

Always generate industry-oriented assessments.

""";
    }

    /**
     * Assessment Objective
     */
    private String buildObjectiveSection() {

        return """
==========================================================
ASSESSMENT OBJECTIVE
==========================================================

The assessment should evaluate one or more of the following:

✓ Technical Knowledge

✓ Conceptual Understanding

✓ Practical Programming Skills

✓ Debugging Ability

✓ Software Design

✓ Object-Oriented Programming

✓ Problem Solving

✓ Analytical Thinking

✓ Decision Making

✓ Architecture Understanding

✓ API Design

✓ Database Concepts

✓ Best Practices

✓ Code Quality

✓ Performance Optimization

✓ Scalability

✓ Security Awareness

✓ Real-world Engineering Skills

The generated assessment should simulate an actual technical interview.

Avoid generating questions that only test memorization.

Every question should encourage reasoning.

""";
    }

    /**
     * Dynamic Input
     */
    private String buildInputSection(
            String topic,
            Resource.Difficulty difficulty,
            int count,
            String questionTypes
    ) {

        return """
==========================================================
ASSESSMENT INPUT
==========================================================

TOPIC
%s

DIFFICULTY
%s

NUMBER OF QUESTIONS
%d

QUESTION TYPES
%s

Generate EXACTLY %d questions.

Do NOT generate more.

Do NOT generate fewer.

"""
                .formatted(
                        topic,
                        difficulty.name(),
                        count,
                        questionTypes,
                        count
                );
    }

    /**
     * Difficulty Definition
     */
    private String buildDifficultySection() {

        return """
==========================================================
DIFFICULTY GUIDELINES
==========================================================

BEGINNER

• Fundamental concepts

• Simple syntax

• Basic OOP

• Basic Collections

• Basic SQL

• Basic REST APIs

• Easy debugging

• Simple coding questions

----------------------------------------------------------

INTERMEDIATE

• Real interview questions

• Collections Framework

• Streams

• Exception Handling

• Concurrency basics

• Spring Boot

• Database Design

• REST APIs

• Authentication

• Moderate coding problems

• Time Complexity awareness

----------------------------------------------------------

ADVANCED

• System Design

• Architecture

• Scalability

• Performance

• Security

• Distributed Systems

• Design Patterns

• JVM

• Multi-threading

• Optimization

• Advanced debugging

• Production scenarios

Questions MUST strictly follow requested difficulty.

Never mix Advanced concepts into Beginner assessments.

""";
    }

    /**
     * Question Distribution
     */
    private String buildDistributionSection(int count) {

        return """
==========================================================
QUESTION DISTRIBUTION
==========================================================

Generate EXACTLY %d questions.

If only ONE Question Type is requested:

Generate ALL questions using that type.

If MULTIPLE Question Types are requested:

Distribute questions as evenly as possible.

If equal distribution is impossible:

Distribute remaining questions naturally.

Do NOT heavily favor one type.

Avoid repeating the same concept.

Each question should evaluate a different competency whenever possible.

"""
                .formatted(count);
    }

    /**
     * Global Rules
     */
    private String buildGlobalRulesSection() {

        return """
==========================================================
GLOBAL QUALITY RULES
==========================================================

Every question MUST:

✓ Be technically accurate

✓ Match requested difficulty

✓ Be unique

✓ Avoid duplicates

✓ Be grammatically correct

✓ Be unambiguous

✓ Encourage reasoning

✓ Use modern software engineering practices

✓ Use realistic industry examples

✓ Avoid outdated technologies

✓ Avoid trick questions

✓ Avoid opinion-based questions

✓ Avoid subjective grading

✓ Avoid irrelevant theory

✓ Prefer production-quality scenarios

✓ Focus on practical understanding

Never generate fake APIs.

Never generate imaginary programming languages.

Never generate incorrect code.

Never generate broken JSON.

Return ONLY UTF-8 JSON.

Never wrap JSON inside markdown.

Never return explanations outside JSON.

""";
    }

    /**
     * MCQ Rules
     */
    private String buildMCQRules() {

        return """
==========================================================
MCQ RULES
==========================================================

Generate conceptual multiple-choice questions.

Rules:

• Exactly FOUR options.

• Only ONE correct answer.

• All distractors should be believable.

• Avoid obviously wrong options.

• Avoid "All of the Above".

• Avoid "None of the Above".

• Test understanding instead of memorization.

• Correct answer MUST exactly match one option.

Return:

"type":"MCQ"

"options":[
"Option A",
"Option B",
"Option C",
"Option D"
]

correctAnswer MUST equal one option exactly.

""";
    }

    /**
     * CODING Rules
     */
    private String buildCodingRules() {

        return """
==========================================================
CODING QUESTION RULES
==========================================================

Generate implementation-based programming problems.

Coding questions should resemble real interview questions.

Each coding question MUST include:

• Problem Statement

• Input Description

• Output Description

• Constraints

• Example Input

• Example Output

• Explanation

The problem should evaluate:

✓ Algorithm Design

✓ Data Structures

✓ Problem Solving

✓ OOP

✓ Collections

✓ Complexity Analysis

✓ Clean Code

Do NOT generate MCQ options.

Set:

"type":"CODING"

options must be null.

correctAnswer should NOT contain full source code.

Instead provide:

• Expected algorithm

• Ideal approach

• Important edge cases

• Expected Time Complexity

• Expected Space Complexity

""";
    }


    /**
     * INTERVIEW Rules
     */
    private String buildInterviewRules() {

        return """
==========================================================
INTERVIEW QUESTION RULES
==========================================================

Generate open-ended technical interview questions.

These questions should resemble real interview discussions
conducted by experienced software engineers.

Interview questions should evaluate:

✓ Conceptual Understanding

✓ Communication Skills

✓ Technical Reasoning

✓ Software Engineering Principles

✓ Best Practices

✓ Trade-off Analysis

✓ Real-world Experience

Questions should encourage candidates to explain:

• Why?

• How?

• What if?

• Advantages

• Disadvantages

• Alternatives

• Design Decisions

Avoid:

• One-word answers

• Yes/No questions

• Memorization-based questions

• Pure definitions

Do NOT generate MCQ options.

Set:

"type":"INTERVIEW"

options must be null.

correctAnswer should contain:

• Ideal explanation

• Key concepts

• Important discussion points

• Best practices

• Common mistakes

""";
    }

    /**
     * SCENARIO Rules
     */
    private String buildScenarioRules() {

        return """
==========================================================
SCENARIO QUESTION RULES
==========================================================

Generate realistic software engineering scenarios.

Every scenario should simulate actual engineering work.

Possible scenarios include:

• Production Bug

• Performance Issue

• Security Vulnerability

• Architecture Decision

• API Design

• Database Design

• Microservices

• Distributed Systems

• Cloud Deployment

• CI/CD Pipeline

• Docker

• Kubernetes

• Concurrency

• Race Condition

• Memory Leak

• Debugging

• Code Review

• Team Collaboration

The learner should analyze the situation
instead of recalling facts.

Avoid unrealistic stories.

Avoid fictional technologies.

Avoid impossible situations.

Do NOT generate MCQ options.

Set:

"type":"SCENARIO"

options must be null.

correctAnswer should include:

• Expected reasoning

• Analysis

• Trade-offs

• Best solution

• Why that solution is preferred

• Possible alternatives

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

DO NOT return Markdown.

DO NOT wrap JSON inside:

```json

DO NOT add explanations.

DO NOT add comments.

DO NOT add notes.

Return ONLY the JSON object.

Each question MUST contain:

type

content

options

correctAnswer

orderIndex

----------------------------------------------------------

MCQ FORMAT

{
"type":"MCQ",
"content":"...",
"options":[
"...",
"...",
"...",
"..."
],
"correctAnswer":"...",
"orderIndex":1
}

----------------------------------------------------------

CODING FORMAT

{
"type":"CODING",
"content":"...",
"options":null,
"correctAnswer":"Expected Algorithm:

...

Time Complexity:

...

Space Complexity:

...

Edge Cases:

...",
"orderIndex":2
}

----------------------------------------------------------

INTERVIEW FORMAT

{
"type":"INTERVIEW",
"content":"...",
"options":null,
"correctAnswer":"Ideal Explanation:

...

Important Concepts:

...

Best Practices:

...

Common Mistakes:

...",
"orderIndex":3
}

----------------------------------------------------------

SCENARIO FORMAT

{
"type":"SCENARIO",
"content":"...",
"options":null,
"correctAnswer":"Expected Analysis:

...

Recommended Solution:

...

Trade-offs:

...

Alternative Approaches:

...",
"orderIndex":4
}

The root JSON MUST be

{
"questions":[
...
]
}

""";
    }

    /**
     * Final Output Instructions
     */
    private String buildOutputExample() {

        return """
==========================================================
FINAL GENERATION INSTRUCTIONS
==========================================================

Before returning the assessment, verify ALL of the following:

✓ Exactly requested number of questions generated.

✓ No duplicate questions.

✓ No duplicate concepts.

✓ Correct difficulty applied.

✓ Correct Question Types.

✓ Valid JSON.

✓ No Markdown.

✓ UTF-8 compliant.

✓ Every question contains:

- type

- content

- options

- correctAnswer

- orderIndex

✓ Every orderIndex is sequential.

✓ Every MCQ has exactly four options.

✓ Every MCQ has one correct answer.

✓ Coding questions have NO options.

✓ Interview questions have NO options.

✓ Scenario questions have NO options.

✓ Coding answers describe the algorithm,
not the entire source code.

✓ Interview answers explain concepts.

✓ Scenario answers include reasoning and
trade-off analysis.

✓ Questions are realistic.

✓ Questions resemble modern technical interviews.

✓ Questions evaluate practical engineering ability.

==========================================================

Your objective is NOT to create an exam.

Your objective is to create a professional
technical assessment that could realistically
be used by leading technology companies to
evaluate Software Engineers.

Quality is significantly more important
than creativity.

Accuracy is significantly more important
than quantity.

Return ONLY the JSON object.

""";
    }
}