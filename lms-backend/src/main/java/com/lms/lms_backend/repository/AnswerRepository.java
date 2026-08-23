package com.lms.lms_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lms.lms_backend.entity.Answer;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByQuestionId(Long questionId);

    @Query("SELECT a FROM Answer a WHERE a.question.quiz.id = :quizId AND a.isCorrect = true")
    List<Answer> findCorrectAnswersByQuizId(@Param("quizId") Long quizId);
}
