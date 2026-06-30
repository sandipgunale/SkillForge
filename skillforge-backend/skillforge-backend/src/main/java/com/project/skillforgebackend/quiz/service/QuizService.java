package com.project.skillforgebackend.quiz.service;

import com.project.skillforgebackend.ai.service.AIService;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.progress.service.ProgressService;
import com.project.skillforgebackend.quiz.dto.QuizDto;
import com.project.skillforgebackend.quiz.dto.QuizRequest;
import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.dto.SubmitAnswersRequest;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.mapper.QuizMapper;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.resource.repository.TopicRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class QuizService {

    private final QuizRepository quizRepository;
    private final TopicRepository topicRepository;
    private final AIService aiService;
    private final ProgressService progressService;
    private final QuizMapper quizMapper;

    @Transactional
    public QuizDto generateQuiz(User user, QuizRequest request) {

        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Topic",
                                request.getTopicId().toString()
                        ));

        var questions = aiService.generateQuestions(
                topic.getName(),
                request.getDifficulty(),
                request.getQuestionCount(),
                request.getQuestionTypes()
        );

        Quiz quiz = Quiz.builder()
                .user(user)
                .topic(topic)
                .difficulty(request.getDifficulty())
                .totalQuestions(questions.size())
                .maxScore(questions.size())
                .build();

        questions.forEach(question -> question.setQuiz(quiz));

        quiz.setQuestions(questions);

        Quiz savedQuiz = quizRepository.save(quiz);

        log.info(
                "Quiz {} generated successfully for {}",
                savedQuiz.getId(),
                user.getEmail()
        );

        return quizMapper.toDto(savedQuiz);
    }

    @Transactional
    public QuizResultDto submitAnswers(
            User user,
            UUID quizId,
            SubmitAnswersRequest request
    ) {

        Quiz quiz = quizRepository.findByIdAndUser(quizId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Quiz",
                                quizId.toString()
                        ));

        if (quiz.getStatus() == Quiz.QuizStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Quiz already submitted."
            );
        }

        Map<UUID, String> answerMap =
                request.getAnswers()
                        .stream()
                        .collect(Collectors.toMap(
                                SubmitAnswersRequest.AnswerItem::getQuestionId,
                                SubmitAnswersRequest.AnswerItem::getAnswer
                        ));

        quiz.getQuestions().forEach(question ->
                question.setUserAnswer(
                        answerMap.getOrDefault(
                                question.getId(),
                                ""
                        )
                )
        );

        QuizResultDto result =
                aiService.evaluateQuiz(quiz);

        result.getQuestions().forEach(resultQuestion ->

                quiz.getQuestions()
                        .stream()
                        .filter(question ->
                                question.getId()
                                        .toString()
                                        .equals(resultQuestion.getQuestionId()))
                        .findFirst()
                        .ifPresent(question -> {

                            question.setIsCorrect(
                                    resultQuestion.isCorrect());

                            question.setAiFeedback(
                                    resultQuestion.getAiFeedback());

                        })
        );

        quiz.setScore(result.getScore());

        quiz.setStatus(
                Quiz.QuizStatus.COMPLETED
        );

        quiz.setCompletedAt(
                LocalDateTime.now()
        );

        quizRepository.save(quiz);

        progressService.updateAfterQuiz(
                user,
                quiz.getTopic(),
                result
        );

        log.info(
                "Quiz {} submitted by {}",
                quizId,
                user.getEmail()
        );

        return result;
    }

    public Page<QuizDto> getHistory(
            User user,
            Pageable pageable
    ) {

        return quizRepository
                .findByUserOrderByStartedAtDesc(
                        user,
                        pageable
                )
                .map(quizMapper::toDto);
    }

}