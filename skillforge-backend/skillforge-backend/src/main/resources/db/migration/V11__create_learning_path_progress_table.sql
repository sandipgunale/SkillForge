CREATE TABLE learning_path_progress (

                                        id UUID PRIMARY KEY,

                                        user_id UUID NOT NULL,

                                        learning_path_id UUID NOT NULL,

                                        completed_weeks_json JSONB NOT NULL DEFAULT '[]'::jsonb,

                                        completion_percentage SMALLINT NOT NULL DEFAULT 0,

                                        quizzes_taken INTEGER NOT NULL DEFAULT 0,

                                        average_quiz_score NUMERIC(5,2) NOT NULL DEFAULT 0,

                                        minutes_spent INTEGER NOT NULL DEFAULT 0,

                                        last_activity_at TIMESTAMP,

                                        created_at TIMESTAMP NOT NULL,

                                        updated_at TIMESTAMP NOT NULL,

                                        CONSTRAINT fk_lpp_user
                                            FOREIGN KEY (user_id)
                                                REFERENCES users(id)
                                                ON DELETE CASCADE,

                                        CONSTRAINT fk_lpp_learning_path
                                            FOREIGN KEY (learning_path_id)
                                                REFERENCES learning_paths(id)
                                                ON DELETE CASCADE,

                                        CONSTRAINT uk_lpp_user_learning_path
                                            UNIQUE (user_id, learning_path_id)

);