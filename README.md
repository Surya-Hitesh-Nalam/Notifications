# College Hierarchical Chat Application - Backend

A comprehensive real-time chat and posting application backend for college use with a strict hierarchy system using **Convex + Prisma (ORM) + PostgreSQL + Express.js**.

## Features

### User Hierarchy & Roles
1. **Officials (Admin Level)**
   - Director
   - Principal
   - Chairman
   - Placement Cell Officer
   - Other administrative positions

2. **Teachers**
   - Organized by department/branch

3. **Students**
   - Organized by branch: CSD, CSE, IT, MECH, etc.

### Core Features

#### A. Messaging System
- Real-time messaging using Convex
- Individual and group messages
- Message history and persistence
- Read/unread status
- Message timestamps
- Role-based messaging restrictions:
  - Officials → Students (all or specific branch)
  - Officials → Teachers (all or specific branch)
  - Teachers → Students (own branch only)
  - Restricted: Student → Teacher/Official, Teacher → Official

#### B. Posts System (Like LinkedIn)
- Create posts with text content
- Like/reaction system
- Comment system
- Timestamp and author information
- Edit/delete own posts
- Posts visible to everyone in the app

#### C. Real-time Notifications
- Real-time push notifications using Convex subscriptions
- Notifications for messages, posts, comments, likes
- Notification badges/counts
- Mark as read functionality

## Technical Stack

- **Convex**: Real-time data synchronization, messaging, and notifications
- **Prisma**: ORM for PostgreSQL database operations
- **PostgreSQL**: Primary database for user data, posts, and message history
- **Express.js**: REST API for authentication and additional endpoints
- **TypeScript**: Type safety throughout the application

## Project Structure

```
├── convex/                 # Convex functions (real-time features)
│   ├── schema.ts           # Database schema
│   ├── mutations.ts        # Database mutations
│   ├── queries.ts          # Database queries
│   └── README.md           # Convex documentation
├── prisma/                 # Prisma schema and migrations
│   └── schema.prisma       # Prisma schema definition
├── src/                    # Main source code
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Authentication and authorization
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   ├── types/              # TypeScript types
│   └── server.ts           # Main server file
├── .env                    # Environment variables
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Convex account (for real-time features)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd notifications
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/college_chat"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   CONVEX_DEPLOYMENT="your-convex-deployment"
   CONVEX_URL="your-convex-url"
   PORT=3000
   NODE_ENV="development"
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Seed the database (optional):
   ```bash
   npm run seed
   ```

### Running the Application

1. Start the Convex development server:
   ```bash
   npm run convex-dev
   ```

2. In a separate terminal, start the Express server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (with filtering by role/branch)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/branch/:branch` - Get users by branch

### Messages
- `POST /api/messages/send` - Send message (with role/branch filtering)
- `GET /api/messages/conversations` - Get all conversations for user
- `GET /api/messages/conversation/:userId` - Get conversation with specific user
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

### Posts
- `POST /api/posts` - Create new post
- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/:id` - Get single post with comments
- `PUT /api/posts/:id` - Update post (own posts only)
- `DELETE /api/posts/:id` - Delete post (own posts only)
- `POST /api/posts/:id/like` - Like/unlike post

### Comments
- `POST /api/posts/:postId/comments` - Create comment on post
- `GET /api/posts/:postId/comments` - Get all comments for a post
- `PUT /api/comments/:id` - Update comment (own comments only)
- `DELETE /api/comments/:id` - Delete comment (own comments only)
- `POST /api/comments/:id/like` - Like/unlike comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Development

### Building the Project
```bash
npm run build
```

### Running in Production
```bash
npm start
```

## Testing

Unit tests and integration tests can be added to the `tests/` directory (to be created).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.