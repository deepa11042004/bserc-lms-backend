USE lms_core_db;

CREATE TABLE IF NOT EXISTS instructor_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  primary_email VARCHAR(255) NOT NULL,
  designation VARCHAR(150) NOT NULL,
  alternative_email VARCHAR(255) NOT NULL,
  bio VARCHAR(500) NULL,
  profile_description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_instructor_profiles_user_id (user_id),
  INDEX idx_instructor_profiles_primary_email (primary_email),
  INDEX idx_instructor_profiles_alternative_email (alternative_email)
);
