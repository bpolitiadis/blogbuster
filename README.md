# BlogBuster

A full-stack blog platform where users can register, log in, post articles, and comment on posts.

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Refresh tokens (custom)
- **API Integration**: OpenAI API (for writing assistant) - planned
- **Deployment**: Vercel + MongoDB Atlas (planned)

## Project Setup (Completed)

- Scaffolded a Next.js 14 project with TypeScript, TailwindCSS, ESLint, and App Router
- Installed dependencies:
  - mongoose (MongoDB ODM)
  - bcryptjs (for password hashing)
- Set up environment variables with `.env.local`
- Configured folder structure:
  - `src/lib`: Utility functions
  - `src/models`: Mongoose models
  - `src/api`: Server-side logic
  - `src/components`: Reusable UI components
  - `src/hooks`: Custom React hooks
  - `src/types`: TypeScript type definitions
  - `src/features`: Logical modules
- Created MongoDB connection utility in `src/lib/mongodb.ts`
- Defined User model in `src/models/User.ts` with:
  - Username, email, password fields
  - Password hashing with bcrypt
  - Password comparison method

## Getting Started

First, create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Next Steps

- Create authentication API routes (register, login, logout)
- Build authentication UI components
- Implement post and comment functionality
- Design and build UI templates
- Add OpenAI integration for writing assistance
- Deployment setup
