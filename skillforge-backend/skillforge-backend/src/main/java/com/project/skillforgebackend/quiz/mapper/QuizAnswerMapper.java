package com.project.skillforgebackend.quiz.mapper;

import com.project.skillforgebackend.quiz.dto.SubmitAnswersRequest;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class QuizAnswerMapper {

    public Map<UUID, String> toAnswerMap(
            SubmitAnswersRequest request
    ) {

        return request.getAnswers()
                .stream()
                .collect(Collectors.toMap(
                        SubmitAnswersRequest.AnswerItem::getQuestionId,
                        SubmitAnswersRequest.AnswerItem::getAnswer
                ));
    }

}