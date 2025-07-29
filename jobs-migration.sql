-- Jobs and Referral Requests Migration
-- Run this script to create the job board tables

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  job_link TEXT NOT NULL,
  description TEXT,
  eligibility TEXT,
  notes TEXT,
  is_open_for_referral BOOLEAN DEFAULT true,
  domain VARCHAR(100),
  experience_level VARCHAR(50),
  openings INTEGER DEFAULT 1,
  salary VARCHAR(100),
  application_deadline DATE,
  posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'EXPIRED')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create referral_requests table
CREATE TABLE IF NOT EXISTS referral_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'REFERRED')),
  note TEXT,
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, student_id) -- Prevent duplicate requests
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_domain ON jobs(domain);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_is_open_for_referral ON jobs(is_open_for_referral);

CREATE INDEX IF NOT EXISTS idx_referral_requests_job_id ON referral_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_student_id ON referral_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_status ON referral_requests(status);
CREATE INDEX IF NOT EXISTS idx_referral_requests_created_at ON referral_requests(created_at);

-- Create foreign key constraints
ALTER TABLE jobs ADD CONSTRAINT IF NOT EXISTS fk_jobs_posted_by 
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE referral_requests ADD CONSTRAINT IF NOT EXISTS fk_referral_requests_job_id 
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE referral_requests ADD CONSTRAINT IF NOT EXISTS fk_referral_requests_student_id 
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add openings column to existing jobs table (if it doesn't exist)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1;

-- Add comments to document the tables
COMMENT ON TABLE jobs IS 'Job postings by alumni for students to browse and request referrals';
COMMENT ON COLUMN jobs.title IS 'Job title/position';
COMMENT ON COLUMN jobs.company IS 'Company name';
COMMENT ON COLUMN jobs.location IS 'Job location (city, state, remote, etc.)';
COMMENT ON COLUMN jobs.job_link IS 'URL to the job posting';
COMMENT ON COLUMN jobs.description IS 'Job description and requirements';
COMMENT ON COLUMN jobs.eligibility IS 'Eligibility criteria for students';
COMMENT ON COLUMN jobs.notes IS 'Additional notes from the alumni';
COMMENT ON COLUMN jobs.is_open_for_referral IS 'Whether students can request referrals for this job';
COMMENT ON COLUMN jobs.domain IS 'Job domain/field (Software Engineering, Data Science, etc.)';
COMMENT ON COLUMN jobs.experience_level IS 'Experience level required (Entry Level, Mid Level, Senior, etc.)';
COMMENT ON COLUMN jobs.openings IS 'Number of job openings available';
COMMENT ON COLUMN jobs.salary IS 'Salary range or information';
COMMENT ON COLUMN jobs.application_deadline IS 'Application deadline date';
COMMENT ON COLUMN jobs.posted_by IS 'User ID of the alumni who posted the job';
COMMENT ON COLUMN jobs.status IS 'Job status (ACTIVE, CLOSED, EXPIRED)';

COMMENT ON TABLE referral_requests IS 'Referral requests from students to alumni for specific jobs';
COMMENT ON COLUMN referral_requests.job_id IS 'Reference to the job being requested';
COMMENT ON COLUMN referral_requests.student_id IS 'Student requesting the referral';
COMMENT ON COLUMN referral_requests.status IS 'Request status (PENDING, ACCEPTED, DECLINED, REFERRED)';
COMMENT ON COLUMN referral_requests.note IS 'Student note explaining their interest and background';
COMMENT ON COLUMN referral_requests.resume_url IS 'URL to the uploaded resume file';

-- Create a view for easier querying of job requests with user details
CREATE OR REPLACE VIEW job_requests_with_details AS
SELECT 
  rr.id,
  rr.job_id,
  rr.student_id,
  rr.status,
  rr.note,
  rr.resume_url,
  rr.created_at,
  rr.updated_at,
  j.title as job_title,
  j.company as job_company,
  j.location as job_location,
  j.job_link,
  j.posted_by as job_posted_by,
  s.name as student_name,
  s.avatar as student_avatar,
  s.role as student_role,
  s.department as student_department,
  s.current_year as student_current_year,
  s.graduation_year as student_graduation_year,
  s.cgpa as student_cgpa,
  a.name as alumni_name,
  a.avatar as alumni_avatar,
  a.role as alumni_role,
  a.department as alumni_department
FROM referral_requests rr
JOIN jobs j ON rr.job_id = j.id
JOIN users s ON rr.student_id = s.id
JOIN users a ON j.posted_by = a.id;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_requests_updated_at 
  BEFORE UPDATE ON referral_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS jobs_select_policy ON jobs;
DROP POLICY IF EXISTS jobs_insert_policy ON jobs;
DROP POLICY IF EXISTS jobs_update_policy ON jobs;
DROP POLICY IF EXISTS jobs_delete_policy ON jobs;

DROP POLICY IF EXISTS referral_requests_select_policy ON referral_requests;
DROP POLICY IF EXISTS referral_requests_insert_policy ON referral_requests;
DROP POLICY IF EXISTS referral_requests_update_policy ON referral_requests;
DROP POLICY IF EXISTS referral_requests_delete_policy ON referral_requests;

-- Jobs table policies
-- Allow users to view all active jobs
CREATE POLICY jobs_select_policy ON jobs
  FOR SELECT USING (status = 'ACTIVE');

-- Allow authenticated users to insert their own jobs
CREATE POLICY jobs_insert_policy ON jobs
  FOR INSERT WITH CHECK (auth.uid() = posted_by);

-- Allow users to update their own jobs
CREATE POLICY jobs_update_policy ON jobs
  FOR UPDATE USING (auth.uid() = posted_by);

-- Allow users to delete their own jobs
CREATE POLICY jobs_delete_policy ON jobs
  FOR DELETE USING (auth.uid() = posted_by);

-- Referral requests table policies
-- Allow users to view requests they sent or received
CREATE POLICY referral_requests_select_policy ON referral_requests
  FOR SELECT USING (
    auth.uid() = student_id OR 
    auth.uid() IN (
      SELECT posted_by FROM jobs WHERE id = job_id
    )
  );

-- Allow authenticated users to insert referral requests
CREATE POLICY referral_requests_insert_policy ON referral_requests
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Allow job posters to update referral request status
CREATE POLICY referral_requests_update_policy ON referral_requests
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT posted_by FROM jobs WHERE id = job_id
    )
  );

-- Allow users to delete their own referral requests
CREATE POLICY referral_requests_delete_policy ON referral_requests
  FOR DELETE USING (auth.uid() = student_id);

-- Insert some sample data for testing (optional)
-- INSERT INTO jobs (title, company, location, job_link, description, domain, experience_level, posted_by) VALUES
--   ('Software Engineer', 'Google', 'Mountain View, CA', 'https://careers.google.com/jobs/123', 'Build scalable systems...', 'Software Engineering', 'Entry Level', 'user-id-here'),
--   ('Data Scientist', 'Microsoft', 'Seattle, WA', 'https://careers.microsoft.com/jobs/456', 'Analyze large datasets...', 'Data Science', 'Mid Level', 'user-id-here'),
--   ('Product Manager', 'Apple', 'Cupertino, CA', 'https://jobs.apple.com/jobs/789', 'Lead product development...', 'Product Management', 'Senior', 'user-id-here'); 