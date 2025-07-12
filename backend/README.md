# Twitter Clone Backend

This is the backend API for the Twitter clone application.

## Deployment on Vercel

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or cloud)
- Cloudinary account for image uploads

### Environment Variables Required

Create the following environment variables in your Vercel dashboard:

```
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=production
```

### Deployment Steps

1. **Connect your GitHub repository to Vercel**
2. **Set the root directory to `backend`** in Vercel project settings
3. **Add environment variables** in Vercel dashboard
4. **Deploy**

### API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `POST /api/posts` - Create post
- `GET /api/posts` - Get all posts
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `GET /api/notifications` - Get notifications

### CORS Configuration

The API is configured to accept requests from:
- Development: `http://localhost:5173`
- Production: Your frontend domain (update in server.js)

### Guest User

A guest user is automatically created with:
- Username: `guest_interviewer`
- Password: `guest1234` 