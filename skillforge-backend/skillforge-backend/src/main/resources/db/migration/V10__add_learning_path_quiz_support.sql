ALTER TABLE quizzes
    ADD COLUMN source VARCHAR(30) NOT NULL DEFAULT 'TOPIC';

ALTER TABLE quizzes
    ADD COLUMN learning_path_id UUID;

ALTER TABLE quizzes
    ADD COLUMN week_number INTEGER;

ALTER TABLE quizzes
    ADD CONSTRAINT fk_quiz_learning_path
        FOREIGN KEY (learning_path_id)
            REFERENCES learning_paths(id);