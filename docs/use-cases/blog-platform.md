# Use Case: Blog Platform

Simple blog with username login and session management for authors.

## Your Project Structure

```
blog-api/
├── src/
│   ├── auth/              ← ModularAuth-Kit
│   ├── posts/
│   │   ├── post.model.ts
│   │   ├── post.routes.ts
│   │   └── post.controller.ts
│   ├── comments/
│   │   └── comment.routes.ts
│   ├── app.ts
│   └── server.ts
├── .env
└── package.json
```

## Configuration

Blog needs: username support, session management (multiple devices).

```typescript
const config = createConfig({
  session: { secure: false }, // Set true with HTTPS
  registration: {
    fields: {
      username: { enabled: true, required: true },  // Blog authors need usernames
      fullName: { enabled: true, required: true },   // Display name
    },
  },
  login: {
    identifiers: ['email', 'username'], // Login with either
  },
  sessionManagement: { enabled: true },  // Manage devices
});

app.use('/auth', createAuthModule(config));

// Public: anyone can read posts
app.get('/api/posts', postController.list);
app.get('/api/posts/:slug', postController.getBySlug);

// Protected: only authors can create/edit
app.post('/api/posts', requireAuth, postController.create);
app.put('/api/posts/:id', requireAuth, postController.update);
app.delete('/api/posts/:id', requireAuth, postController.delete);
```

## Author Flow

```bash
# Register as author
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"author@blog.com","password":"Write1234!","username":"johndoe","fullName":"John Doe"}' \
  -c cookies.txt

# Login with username (instead of email)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"johndoe","password":"Write1234!"}' \
  -c cookies.txt

# Create a blog post (authenticated)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Post","content":"Hello world!"}' \
  -b cookies.txt

# Check which devices are logged in
curl http://localhost:3000/auth/sessions -b cookies.txt

# Get profile (includes username)
curl http://localhost:3000/auth/me -b cookies.txt
```

## Features Used

| Feature | Why |
|---|---|
| Username field | Public-facing author identity |
| Full name | Display name on posts |
| Username login | Authors remember usernames better |
| Session management | Write from laptop, review on phone |
