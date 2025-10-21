CREATE DATABASE schoolDB;
USE schoolDB;

CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  gender VARCHAR(6) CHECK (gender IN ('male', 'female')),
  birth_date DATE,
  contact_info JSON
);

CREATE TABLE subjects (
  subject_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description VARCHAR(255),
  max_score INT
);

CREATE TABLE exams (
  exam_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject_id INT,
  exam_date DATE,
  score INT
);

CREATE TABLE student_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject_id INT
);

CREATE TABLE phone_numbers (
  phone_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  phone_number VARCHAR(20)
);

INSERT INTO students (first_name, last_name, gender, birth_date, contact_info) VALUES
('Ahmed', 'Ali', 'male', '1990-05-10', '{"address":"Cairo","email":"ahmed@example.com"}'),
('Alaa', 'Hassan', 'female', '1993-08-22', '{"address":"Giza","email":"alaa@example.com"}'),
('Mohammed', 'Nashaat', 'male', '1991-02-15', '{"address":"Alexandria","email":"mohammed@example.com"}'),
('Sara', 'Omar', 'female', '1995-12-03', '{"address":"Cairo","email":"sara@example.com"}'),
('Ahmed', 'Tarek', 'male', '1989-07-01', '{"address":"Aswan","email":"ahmedt@example.com"}');

INSERT INTO subjects (name, description, max_score) VALUES
('Math', 'Numbers and equations', 100),
('English', 'Grammar and literature', 90),
('Science', 'Experiments and theories', 95),
('History', 'Past events and people', 85),
('Computer', 'Programming basics', 98);

INSERT INTO exams (student_id, subject_id, exam_date, score) VALUES
(1, 1, '2023-05-10', 88),
(2, 2, '2023-05-11', 76),
(3, 3, '2023-05-12', 49),
(4, 4, '2023-05-13', 92),
(5, 5, '2023-05-14', 67);

INSERT INTO student_subjects (student_id, subject_id) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5);

INSERT INTO phone_numbers (student_id, phone_number) VALUES
(1,'0100000001'),
(2,'0100000002'),
(3,'0100000003'),
(4,'0100000004'),
(5,'0100000005');

ALTER TABLE exams
ADD CONSTRAINT fk_exam_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_exam_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE;

ALTER TABLE student_subjects
ADD CONSTRAINT fk_ss_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_ss_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE;

ALTER TABLE phone_numbers
ADD CONSTRAINT fk_phone_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE;

#Display all students’ information
SELECT * FROM students;
SELECT * FROM students WHERE gender = 'male';
SELECT COUNT(*) AS female_count FROM students WHERE gender = 'female';
SELECT * FROM students WHERE birth_date < '1992-10-01';
SELECT * FROM students WHERE gender='male' AND birth_date < '1991-10-01';
SELECT name, max_score FROM subjects ORDER BY max_score DESC;
SELECT * FROM subjects ORDER BY max_score DESC LIMIT 1;
SELECT * FROM students WHERE first_name LIKE 'A%';
SELECT COUNT(*) AS count_mohammed FROM students WHERE first_name = 'Mohammed';
SELECT gender, COUNT(*) AS total FROM students GROUP BY gender;
SELECT first_name, COUNT(*) AS name_count
FROM students
GROUP BY first_name
HAVING COUNT(first_name) > 2;
SELECT s.first_name, s.last_name, e.score, sub.name AS subject_name
FROM students s
JOIN exams e ON s.student_id = e.student_id
JOIN subjects sub ON e.subject_id = sub.subject_id;
DELETE FROM students
WHERE student_id IN (
  SELECT student_id FROM exams e
  JOIN subjects sub ON e.subject_id = sub.subject_id
  WHERE e.score < 50 AND sub.name = 'Science'
);

