INSERT INTO topics (id, name, slug, description, icon, display_order) VALUES
                                                                          (gen_random_uuid(), 'Java',             'java',             'Core Java and advanced concepts',       'java',        1),
                                                                          (gen_random_uuid(), 'Spring Boot',      'spring-boot',      'Spring framework and REST APIs',        'spring',      2),
                                                                          (gen_random_uuid(), 'Data Structures',  'data-structures',  'Arrays, Trees, Graphs, and algorithms', 'graph',       3),
                                                                          (gen_random_uuid(), 'System Design',    'system-design',    'Scalable system architecture',          'server',      4),
                                                                          (gen_random_uuid(), 'React',            'react',            'React fundamentals and patterns',       'react',       5),
                                                                          (gen_random_uuid(), 'Databases',        'databases',        'SQL, NoSQL, and query optimization',    'database',    6),
                                                                          (gen_random_uuid(), 'DevOps',           'devops',           'Docker, CI/CD, and cloud deployment',   'cloud',       7),
                                                                          (gen_random_uuid(), 'Interview Prep',   'interview-prep',   'Technical interview preparation',       'briefcase',   8);

INSERT INTO tags (id, name, slug) VALUES
                                      (gen_random_uuid(), 'Spring Security',      'spring-security'),
                                      (gen_random_uuid(), 'JWT',                  'jwt'),
                                      (gen_random_uuid(), 'REST API',             'rest-api'),
                                      (gen_random_uuid(), 'Binary Search',        'binary-search'),
                                      (gen_random_uuid(), 'Dynamic Programming',  'dynamic-programming'),
                                      (gen_random_uuid(), 'React Hooks',          'react-hooks'),
                                      (gen_random_uuid(), 'Docker',               'docker'),
                                      (gen_random_uuid(), 'PostgreSQL',           'postgresql'),
                                      (gen_random_uuid(), 'Microservices',        'microservices'),
                                      (gen_random_uuid(), 'LeetCode',             'leetcode');