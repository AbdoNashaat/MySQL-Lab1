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
SELECT * FROM exams;
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

#1- Insert new student and his score in exam in different subject as transaction.
START TRANSACTION;
INSERT INTO students (first_name, last_name, gender, birth_date, contact_info)
VALUES ('Youssef', 'Ali', 'male', '1997-04-22', '{"address":"Cairo","email":"Y@Y.com"}');
SET @new_student_id = LAST_INSERT_ID();
INSERT INTO exams (student_id, subject_id, exam_date, score)
VALUES (@new_student_id, 2, '2023-05-15', 81);
COMMIT;

#2- Display the data of exam : day’monthname’year.
SELECT exam_id, DATE_FORMAT(exam_date, '%d %M %Y') FROM exams;

#3- Display name and age of each students.
SELECT first_name, last_name, TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age FROM students;

#4- Display the name of students with their Rounded score in each exam.
SELECT s.first_name, s.last_name, e.score FROM students as s JOIN exams as e ON s.student_id = e.student_id;

#5- Display the name of students with the year of Birthdate.
SELECT first_name, last_name, DATE_FORMAT(birth_date, '%Y') as birth_year FROM students;

#6- Add new exam result, in date column use Now.
INSERT INTO exams (student_id, subject_id, exam_date, score)
VALUES (2, 3, DATE_FORMAT(NOW(), '%Y-%m-%d'), 81);

#7- Create Hello World function which take username and return welcome message to user using his name.
DELIMITER $$
CREATE FUNCTION HelloWorld(username VARCHAR(50))
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
  RETURN CONCAT('Welcome ', username, '!');
END $$
DELIMITER ;
SELECT HelloWorld('Ahmed');

#8- Create multiply function which take two number and return the multiply of them.
DELIMITER $$
CREATE FUNCTION MultiplyNumbers(a INT, b INT)
RETURNS INT
DETERMINISTIC
BEGIN
  RETURN a * b;
END $$
DELIMITER ;
SELECT MultiplyNumbers(5, 8);
#9- Create function which takes student id and exam id and return score the student in exam.
DELIMITER $$
CREATE FUNCTION GetStudentScore(studentId INT, examId INT)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE result INT;
  SELECT score INTO result FROM exams
  WHERE student_id = studentId AND exam_id = examId;
  RETURN result;
END $$
DELIMITER ;
SELECT GetStudentScore(1, 1);

#10-Create function which takes exam id and return the number of students who failed in a exam (score less than 50).
DELIMITER $$

CREATE FUNCTION FailedStudentsCount(examId INT)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE fail_count INT;
  SELECT COUNT(*) INTO fail_count FROM exams
  WHERE exam_id = examId AND score < 50;
  RETURN fail_count;
END $$

DELIMITER ;
SELECT FailedStudentsCount(3);

#11- Create function which take subject name and return the average of max grades for subject.
DELIMITER $$

CREATE FUNCTION AvgMaxGrades(subName VARCHAR(100))
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
  DECLARE avg_grade DECIMAL(5,2);
  SELECT AVG(max_score) INTO avg_grade
  FROM subjects
  WHERE name = subName;
  RETURN avg_grade;
END $$

DELIMITER ;
SELECT AvgMaxGrades('Math');

#12- Create table called Deleted_Students which will hold the deleted students info(same columns as in student tables.
CREATE TABLE Deleted_Students AS SELECT * FROM students WHERE 1=0;

#13- Create trigger to save the deleted student from student table to Deleted_Student.
DELIMITER $$

CREATE TRIGGER after_student_delete
AFTER DELETE ON students
FOR EACH ROW
BEGIN
  INSERT INTO Deleted_Students
  VALUES (OLD.student_id, OLD.first_name, OLD.last_name, OLD.gender, OLD.birth_date, OLD.contact_info);
END $$

DELIMITER ;

#14- Create trigger to the save the newly added students to student table to Backup_students.
CREATE TABLE Backup_Students AS
SELECT * FROM students WHERE 1=0;
DELIMITER $$

CREATE TRIGGER after_student_insert
AFTER INSERT ON students
FOR EACH ROW
BEGIN
  INSERT INTO Backup_Students
  VALUES (NEW.student_id, NEW.first_name, NEW.last_name, NEW.gender, NEW.birth_date, NEW.contact_info);
END $$

DELIMITER ;


#15- Create trigger to keep track the change of contact info table(add/update rows), it will logs the time of action and description.
CREATE TABLE contact_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  action_time DATETIME,
  action_desc VARCHAR(255)
);
DELIMITER $$

CREATE TRIGGER contact_info_update
AFTER UPDATE ON students
FOR EACH ROW
BEGIN
  IF OLD.contact_info <> NEW.contact_info THEN
    INSERT INTO contact_logs (student_id, action_time, action_desc)
    VALUES (NEW.student_id, NOW(), 'Contact info updated');
  END IF;
END $$

DELIMITER ;

# mysqldump -u root -p schoolDB students > students_dump.sql
# CREATE DATABASE Grading_Backup;
# mysql -u root -p Grading_Backup < students_dump.sql






