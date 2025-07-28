# Database Setup for CampusConnect

## Overview
This document explains how to set up the database for CampusConnect with all the role-specific fields for the onboarding process.

## Database Migration

### 1. Run the Migration Script
Execute the SQL migration script to add all the new fields to the users table:

```bash
# Connect to your PostgreSQL database and run:
psql -d your_database_name -f database-migration.sql
```

### 2. New Fields Added

#### Common Fields (All Roles)
- `linkedin` - LinkedIn profile URL
- `github` - GitHub profile URL

#### Student-Specific Fields
- `current_year` - Current year of study (1-5)
- `graduation_year` - Expected graduation year
- `cgpa` - Cumulative Grade Point Average

#### Alumni-Specific Fields
- `graduation_year` - Year of graduation
- `current_company` - Current company/organization
- `job_title` - Current job title
- `experience_years` - Years of work experience

#### Professor-Specific Fields
- `designation` - Academic designation (Assistant/Associate/Professor, HoD, Dean)
- `teaching_experience` - Years of teaching experience
- `research_areas` - Research areas and interests
- `publications` - Publications and research output

### 3. Database Schema

The users table now includes all role-specific fields with appropriate data types:

```sql
-- Example of the updated users table structure
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  college_id UUID REFERENCES colleges(id),
  department VARCHAR(255),
  bio TEXT,
  avatar VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP,
  
  -- Common fields
  linkedin VARCHAR(255),
  github VARCHAR(255),
  
  -- Student fields
  current_year INTEGER,
  graduation_year VARCHAR(10),
  cgpa DECIMAL(3,2),
  
  -- Alumni fields
  current_company VARCHAR(255),
  job_title VARCHAR(255),
  experience_years VARCHAR(20),
  
  -- Professor fields
  designation VARCHAR(100),
  teaching_experience VARCHAR(20),
  research_areas TEXT,
  publications TEXT
);
```

## API Endpoints

### Onboarding API
- **POST** `/api/onboarding` - Complete onboarding with role-specific data

### Profile API
- **GET** `/api/profile` - Get current user's detailed profile
- **PUT** `/api/profile` - Update current user's profile

### Users API
- **GET** `/api/users` - Get users with filters (includes all new fields)
- **POST** `/api/users` - Create user

## Role-Based Data Flow

### Student Onboarding
1. User selects "Student" role
2. Fills in: Current Year, Graduation Year, CGPA, Skills, Career Interests
3. Data stored in: `current_year`, `graduation_year`, `cgpa`, `skills`, `interests`

### Alumni Onboarding
1. User selects "Alumni" role
2. Fills in: Graduation Year, Current Company, Job Title, Experience, Skills
3. Data stored in: `graduation_year`, `current_company`, `job_title`, `experience_years`, `skills`

### Professor Onboarding
1. User selects "Professor" role
2. Fills in: Designation, Teaching Experience, Research Areas, Publications, Expertise
3. Data stored in: `designation`, `teaching_experience`, `research_areas`, `publications`, `skills`

## Indexes for Performance

The migration script also creates indexes for better query performance:
- `idx_users_role` - For filtering by role
- `idx_users_college_id` - For filtering by college
- `idx_users_graduation_year` - For alumni/student queries
- `idx_users_current_company` - For alumni queries
- `idx_users_designation` - For professor queries

## Testing the Setup

After running the migration, you can test the setup by:

1. Creating a new user account
2. Going through the onboarding process
3. Checking that all role-specific data is saved correctly
4. Verifying that the profile API returns the correct data

## Troubleshooting

If you encounter any issues:

1. **Check database connection** - Ensure your Supabase connection is working
2. **Verify migration** - Run the migration script again (it uses `IF NOT EXISTS`)
3. **Check field names** - Ensure the field names in the API match the database columns
4. **Review logs** - Check the console logs for any error messages 