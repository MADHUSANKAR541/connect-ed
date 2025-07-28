# CampusConnect

A modern campus networking platform connecting students, alumni, and professors.

## 🚀 Features

- 👥 **Role-based Access**: Students, Alumni, Professors, and Admins
- 🏫 **College-based Networking**: Connect within your institution
- 💬 **Real-time Messaging**: In-app chat system
- 📅 **Call Scheduling**: Schedule video/audio calls with mentors
- 🎯 **Smart Matching**: Find mentors based on skills and interests
- 📊 **Analytics**: Track connections and engagement
- 🔔 **Notifications**: Real-time notification system
- 📹 **Video Conferencing**: Integrated Jitsi Meet for video calls
- 👤 **Profile Management**: Comprehensive user profiles with experience, education, and achievements
- 🤝 **Connection Management**: Accept/reject connection requests with messaging

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, SCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Video Calls**: Jitsi Meet
- **Styling**: Custom SCSS with CSS Variables
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment file and configure your variables:

```bash
cp env.example .env.local
```

Update the following variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate a random secret
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google OAuth

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database (optional)
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication APIs
│   │   ├── calls/         # Call management APIs
│   │   ├── connections/   # Connection APIs
│   │   ├── messages/      # Messaging APIs
│   │   ├── notifications/ # Notification APIs
│   │   ├── onboarding/    # Onboarding API
│   │   ├── profile/       # Profile management APIs
│   │   └── users/         # User management APIs
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── calls/         # Call management
│   │   ├── connections/   # Connection management
│   │   ├── explore/       # User discovery
│   │   ├── insights/      # Analytics
│   │   ├── messages/      # Messaging
│   │   └── notifications/ # Notifications
│   ├── onboarding/        # User onboarding
│   └── profile/           # Profile pages
├── components/            # Reusable components
│   └── VideoCall.tsx     # Video conferencing component
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   └── db.ts             # Database connection
├── styles/                # SCSS stylesheets
└── types/                 # TypeScript types
```

## 🎯 Features Overview

### 🔐 Authentication & Onboarding
- Email/password and Google OAuth authentication
- Role-based registration (Student, Alumni, Professor)
- Complete onboarding flow with profile setup
- College verification system

### 👤 User Management
- Comprehensive profile management
- Experience, education, and achievements tracking
- Privacy controls for profile visibility
- College-based user organization
- Skills and interests management

### 🤝 Networking Features
- Connection requests with approval workflow
- Real-time messaging system
- Video calling with Jitsi Meet integration
- Connection analytics and insights

### 💬 Communication
- In-app messaging between connected users
- Call scheduling with approval workflow
- Video/audio conferencing capabilities
- Real-time notification system
- Message read receipts

### 📊 Analytics & Insights
- User activity tracking
- Connection analytics
- College performance metrics
- Skill trend analysis
- Profile view statistics

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `GET /api/auth/[...nextauth]` - NextAuth.js routes

### Users
- `GET /api/users` - Search and filter users
- `POST /api/users` - Create user

### Connections
- `GET /api/connections` - Get user connections
- `POST /api/connections` - Send connection request
- `PUT /api/connections/[id]` - Accept/reject connection
- `DELETE /api/connections/[id]` - Delete connection

### Messages
- `GET /api/messages` - Get conversation messages
- `POST /api/messages` - Send message

### Calls
- `GET /api/calls` - Get call requests
- `POST /api/calls` - Schedule call
- `PUT /api/calls/[id]` - Update call status

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/onboarding` - Complete onboarding
- `POST /api/profile/experience` - Add experience
- `POST /api/profile/education` - Add education

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications` - Mark notifications as read

## 🗂 Database Schema

### Core Models
- **User**: Profile information, roles, college association
- **College**: Institution information and settings
- **Connection**: User relationships and status
- **Message**: Communication between users
- **CallRequest**: Scheduled calls and meetings
- **Notification**: User notifications and alerts
- **Experience**: Work experience entries
- **Education**: Educational background
- **Achievement**: User achievements and awards
- **UserSkill**: Skills and expertise levels

## 🚀 Development

### Adding New Features

1. Create API routes in `src/app/api/`
2. Add database models in `prisma/schema.prisma`
3. Create React components in `src/components/`
4. Add styles in `src/styles/`
5. Update navigation in `src/app/dashboard/layout.tsx`

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name feature_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Video Conferencing

The platform uses Jitsi Meet for video conferencing:
- Integrated video call component
- Room-based calling system
- Audio/video controls
- Participant management

## 🚀 Deployment

### Environment Variables

Make sure to set all required environment variables in production:

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Build and Deploy

```bash
npm run build
npm start
```

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🏘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**CampusConnect** - Connecting academic communities through meaningful relationships and professional development opportunities.
