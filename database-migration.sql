-- Database Migration: Add role-specific fields to users table
-- Run this script to add the new onboarding fields

-- Add LinkedIn and GitHub fields (common for all roles)
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS github VARCHAR(255);

-- Student-specific fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_year INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cgpa DECIMAL(3,2);

-- Alumni-specific fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_company VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years VARCHAR(20);

-- Professor-specific fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS teaching_experience VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS research_areas TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS publications TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_college_id ON users(college_id);
CREATE INDEX IF NOT EXISTS idx_users_graduation_year ON users(graduation_year);
CREATE INDEX IF NOT EXISTS idx_users_current_company ON users(current_company);
CREATE INDEX IF NOT EXISTS idx_users_designation ON users(designation);

-- Add comments to document the new fields
COMMENT ON COLUMN users.linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN users.github IS 'GitHub profile URL';
COMMENT ON COLUMN users.current_year IS 'Current year of study (for students)';
COMMENT ON COLUMN users.graduation_year IS 'Year of graduation or expected graduation';
COMMENT ON COLUMN users.cgpa IS 'Cumulative Grade Point Average (for students)';
COMMENT ON COLUMN users.current_company IS 'Current company/organization (for alumni)';
COMMENT ON COLUMN users.job_title IS 'Current job title (for alumni)';
COMMENT ON COLUMN users.experience_years IS 'Years of work experience (for alumni)';
COMMENT ON COLUMN users.designation IS 'Academic designation (for professors)';
COMMENT ON COLUMN users.teaching_experience IS 'Years of teaching experience (for professors)';
COMMENT ON COLUMN users.research_areas IS 'Research areas and interests (for professors)';
COMMENT ON COLUMN users.publications IS 'Publications and research output (for professors)'; 