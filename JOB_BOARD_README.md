# Job Board Module - CampusConnect

A comprehensive referral-based job board system that connects students with alumni for job opportunities and referrals.

## 🎯 Features

### For Alumni (Job Posters)
- **Job Posting**: Create detailed job listings with company info, requirements, and referral options
- **Request Management**: View and manage referral requests from students
- **Status Tracking**: Accept, decline, or mark referrals as completed
- **Job Analytics**: Track views, requests, and referral success rates

### For Students (Job Seekers)
- **Job Discovery**: Browse available jobs with advanced search and filtering
- **Referral Requests**: Request referrals from alumni with resume upload
- **Request Tracking**: Monitor the status of your referral requests
- **Alumni Insights**: View alumni profiles and their referral history

## 🏗️ Architecture

### Database Schema

#### Jobs Table
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
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
  salary VARCHAR(100),
  application_deadline DATE,
  posted_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Referral Requests Table
```sql
CREATE TABLE referral_requests (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  student_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'PENDING',
  note TEXT,
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, student_id)
);
```

### API Endpoints

#### Jobs Management
- `GET /api/jobs` - List all jobs with filters
- `POST /api/jobs` - Create a new job posting
- `PUT /api/jobs/[id]` - Update a job posting
- `DELETE /api/jobs/[id]` - Delete a job posting
- `GET /api/jobs/my-jobs` - Get jobs posted by the authenticated user

#### Referral Requests
- `GET /api/jobs/requests` - Get referral requests (sent/received)
- `POST /api/jobs/requests` - Create a new referral request
- `PATCH /api/jobs/requests/[id]` - Update request status
- `GET /api/jobs/referral-requests` - Get requests for jobs you posted

## 🚀 Getting Started

### 1. Database Setup

Run the migration script to create the required tables:

```bash
# Connect to your PostgreSQL database and run:
psql -d your_database_name -f jobs-migration.sql
```

### 2. Storage Setup

Create a Supabase storage bucket for resume uploads:

```sql
-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('job-resumes', 'job-resumes', true);

-- Set up storage policies
CREATE POLICY "Resume uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'job-resumes');

CREATE POLICY "Resume downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'job-resumes');
```

### 3. Environment Variables

Add the following to your `.env.local`:

```bash
# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📱 User Interface

### Student Job Board (`/dashboard/jobs`)
- **Job Listings**: Grid view of available jobs with alumni information
- **Search & Filters**: Filter by company, domain, experience level
- **Referral Requests**: Modal for requesting referrals with resume upload
- **Request Tracking**: Tab to view sent requests and their status

### Alumni Job Management (`/dashboard/jobs/post`)
- **Job Posting**: Multi-step form for creating job listings
- **My Jobs**: List and manage posted jobs
- **Referral Requests**: View and respond to student requests
- **Analytics**: Overview of job performance and referral metrics

## 🔧 Key Components

### Frontend Components

#### `JobsPage` (`/dashboard/jobs/page.tsx`)
- Main job board interface for students
- Job search and filtering functionality
- Referral request modal with resume upload
- Request tracking and status management

#### `PostJobPage` (`/dashboard/jobs/post/page.tsx`)
- Job posting interface for alumni
- Multi-step job creation form
- Job management and editing
- Referral request management

#### `VideoCall` Component
- Integrated video calling for job discussions
- Jitsi Meet integration for seamless communication

### API Routes

#### Job Management APIs
- **`/api/jobs`**: CRUD operations for job postings
- **`/api/jobs/my-jobs`**: Get user's posted jobs
- **`/api/jobs/[id]`**: Individual job operations

#### Referral Request APIs
- **`/api/jobs/requests`**: Manage referral requests
- **`/api/jobs/referral-requests`**: Get requests for posted jobs
- **`/api/jobs/requests/[id]`**: Update request status

## 🎨 Styling

The job board uses a comprehensive SCSS styling system:

### Design System
- **Dark/Light Theme**: Consistent with the main application
- **Glass Morphism**: Modern UI effects with backdrop blur
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions using Framer Motion

### Key Style Files
- `jobs.scss`: Main job board styles
- `dashboard.scss`: Dashboard layout styles
- `globals.scss`: Global theme variables

## 🔐 Security Features

### Authentication & Authorization
- **Session-based access**: All endpoints require authentication
- **Role-based permissions**: Alumni can post jobs, students can request referrals
- **Ownership validation**: Users can only modify their own content

### File Upload Security
- **File type validation**: Only PDF resumes are accepted
- **Storage isolation**: User-specific file paths
- **Access control**: Secure file access through Supabase storage

## 📊 Analytics & Insights

### Job Analytics
- **View tracking**: Monitor job listing views
- **Request metrics**: Track referral request rates
- **Success rates**: Measure referral acceptance rates

### User Engagement
- **Activity tracking**: Monitor user interactions
- **Performance metrics**: Track response times and completion rates

## 🚀 Future Enhancements

### Planned Features
1. **GPT-powered Referral Notes**: AI-generated referral suggestions
2. **Smart Matching**: Algorithm-based alumni-student matching
3. **Referral Leaderboard**: Gamification for active alumni
4. **Advanced Analytics**: Detailed reporting and insights
5. **Email Notifications**: Automated status updates
6. **Bulk Operations**: Mass job posting and management

### Technical Improvements
1. **Real-time Updates**: WebSocket integration for live updates
2. **Advanced Search**: Elasticsearch integration
3. **File Processing**: Resume parsing and skill extraction
4. **Mobile App**: Native mobile application
5. **API Rate Limiting**: Enhanced security and performance

## 🧪 Testing

### Manual Testing Checklist
- [ ] Job posting workflow
- [ ] Referral request creation
- [ ] Status updates and notifications
- [ ] File upload functionality
- [ ] Search and filtering
- [ ] Responsive design
- [ ] Error handling

### API Testing
```bash
# Test job creation
curl -X POST /api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Software Engineer","company":"Google","jobLink":"https://example.com"}'

# Test referral request
curl -X POST /api/jobs/requests \
  -F "jobId=job-id" \
  -F "note=Interested in this role" \
  -F "resume=@resume.pdf"
```

## 📝 API Documentation

### Job Object Schema
```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  jobLink: string;
  description?: string;
  eligibility?: string;
  notes?: string;
  isOpenForReferral: boolean;
  domain?: string;
  experienceLevel?: string;
  salary?: string;
  applicationDeadline?: string;
  postedBy: User;
  status: 'ACTIVE' | 'CLOSED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
}
```

### Referral Request Schema
```typescript
interface ReferralRequest {
  id: string;
  jobId: string;
  studentId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REFERRED';
  note?: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
  job: Job;
  student: User;
}
```

## 🤝 Contributing

### Development Workflow
1. **Feature Branch**: Create feature branch from main
2. **Database Changes**: Update migration scripts
3. **API Development**: Implement backend endpoints
4. **Frontend Integration**: Build UI components
5. **Testing**: Comprehensive testing and validation
6. **Documentation**: Update README and API docs
7. **Code Review**: Submit pull request for review

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **SCSS**: Modular styling approach
- **React Hooks**: Functional components with hooks

## 📞 Support

For questions and support:
- **Documentation**: Check this README and API docs
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for general questions

---

**Job Board Module** - Connecting students with alumni for career opportunities through a modern, secure, and user-friendly platform. 