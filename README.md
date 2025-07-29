# ConnectED

A comprehensive college alumni-student networking platform built with Next.js 14, React 18, TypeScript, and Supabase. ConnectED facilitates meaningful connections between students, alumni, and professors through features like profile management, messaging, video calls, job postings, and referral systems.

## 🚀 Features

### Core Functionality
- **Multi-Role Authentication**: Support for Students, Alumni, Professors, and Admins
- **Profile Management**: Comprehensive user profiles with role-specific fields
- **Connection System**: Send/accept connection requests between users
- **Real-time Messaging**: Direct messaging between connected users
- **Video Calls**: Integrated Jitsi Meet for face-to-face conversations
- **Job Board**: Alumni can post jobs, students can request referrals
- **Admin Dashboard**: User management and platform oversight

### Role-Specific Features
- **Students**: Browse jobs, request referrals, connect with alumni
- **Alumni**: Post job opportunities, manage referral requests, mentor students
- **Professors**: Academic guidance and student support
- **Admins**: Platform management and user oversight

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: SCSS, CSS Variables, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Authentication**: NextAuth.js with Google OAuth
- **Video Calls**: Jitsi Meet Integration
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
connect-ed/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main dashboard pages
│   │   ├── onboarding/        # User onboarding
│   │   └── admin/             # Admin dashboard
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility libraries
│   ├── styles/                # SCSS stylesheets
│   └── types/                 # TypeScript type definitions
├── database-migration.sql     # Database schema
├── jobs-migration.sql         # Job board database schema
└── package.json              # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd connect-ed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Set up the database**
   - Run the SQL scripts in `database-migration.sql`
   - Run the SQL scripts in `jobs-migration.sql`
   - Configure Supabase storage buckets

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Database Schema

### Core Tables
- **users**: User profiles with role-specific fields
- **colleges**: College/university information
- **connections**: User connection relationships
- **messages**: Direct messages between users
- **call_requests**: Video call scheduling
- **jobs**: Job postings by alumni
- **referral_requests**: Student referral requests

### Role-Specific Fields
- **Students**: current_year, graduation_year, cgpa, department
- **Alumni**: company, position, experience_years, industry
- **Professors**: department, designation, research_areas
- **Admins**: permissions, access_level

## 🔐 Authentication & Security

- **NextAuth.js**: JWT-based authentication
- **Google OAuth**: Social login integration
- **Row Level Security**: Supabase RLS policies
- **Role-based Access**: Different features per user role
- **Session Management**: Secure session handling

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Theme switching capability
- **Smooth Animations**: Framer Motion integration
- **Modern Icons**: Lucide React icon library
- **Accessibility**: WCAG compliant components

## 📱 Key Pages

### Public Pages
- **Landing Page**: Platform overview and features
- **Authentication**: Login/signup with role selection

### Dashboard Pages
- **Home**: User-specific overview and stats
- **Connections**: Manage user connections
- **Explore**: Discover and connect with users
- **Messages**: Real-time messaging interface
- **Calls**: Video call scheduling and management
- **Jobs**: Job board and referral system
- **Notifications**: User activity notifications
- **Profile**: User profile management

### Admin Pages
- **User Management**: View and manage all users
- **Platform Analytics**: Usage statistics and insights

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `GET /api/auth/check-status` - Session validation

### Users & Profiles
- `GET /api/users` - Search and fetch users
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/profile/education` - Update education details
- `PUT /api/profile/experience` - Update experience details

### Connections
- `GET /api/connections` - Get user connections
- `POST /api/connections` - Send connection request
- `PUT /api/connections/[id]` - Accept/reject connection

### Messaging
- `GET /api/messages` - Get conversation messages
- `POST /api/messages` - Send new message

### Video Calls
- `GET /api/calls` - Get call requests
- `POST /api/calls` - Schedule new call
- `PUT /api/calls/[id]` - Update call status

### Job Board
- `GET /api/jobs` - Get job listings
- `POST /api/jobs` - Create new job posting
- `GET /api/jobs/my-jobs` - Get user's posted jobs
- `GET /api/jobs/requests` - Get referral requests
- `POST /api/jobs/requests` - Create referral request
- `PUT /api/jobs/requests/[id]` - Update request status

### Admin
- `GET /api/users/[id]/approve` - Approve user registration
- `GET /api/users/[id]/reject` - Reject user registration

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Supabase Team** for the backend infrastructure
- **Vercel Team** for deployment platform
- **Jitsi Team** for video calling integration

---

**ConnectED** - Connecting academic communities through meaningful relationships and professional development opportunities.
