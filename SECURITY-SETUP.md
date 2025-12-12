# 🔒 Security Setup for /seed Page

The `/seed` page and all admin API routes are now secured with authentication.

## How It Works

### Development Mode
- **No authentication required** - Access is automatically granted
- Makes development and testing easier

### Production Mode
- **Authentication required** - Must provide a secret key
- Prevents unauthorized access to database management functions

## Setup Instructions

### 1. Set Environment Variable

Add the following to your `.env.local` file (for local development) and Vercel environment variables (for production):

```env
ADMIN_SECRET_KEY=your-super-secret-key-here
```

**Important**: 
- Use a strong, random secret key (at least 32 characters)
- Never commit this to Git
- Use different keys for development and production

### 2. Generate a Secure Secret Key

You can generate a secure random key using:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use an online generator
# https://www.random.org/strings/
```

### 3. Access the /seed Page

#### Option 1: URL Parameter (Easiest)
```
https://your-domain.com/seed?secret=your-super-secret-key-here
```

#### Option 2: Authentication Form
1. Visit `/seed` without a secret
2. You'll see an authentication form
3. Enter your secret key
4. Click "Authenticate"

Once authenticated, the secret is stored in the URL, so you can bookmark it.

## Protected Routes

The following routes are now protected:

- `/seed` - Database management page
- `/api/seed-full` - Seed database endpoint
- `/api/populate-now` - Populate database endpoint
- `/api/test-scraper` - Test scraper endpoint
- `/api/cron/update-tools` - Cron job (allows Vercel cron + secret key)

## Security Features

✅ **Environment-based access control**
- Development: Open access
- Production: Requires secret key

✅ **Multiple authentication methods**
- Authorization header: `Bearer <secret>`
- Query parameter: `?secret=<secret>`

✅ **Vercel Cron compatibility**
- Cron jobs still work automatically (via `x-vercel-cron` header)
- Manual access requires secret key

✅ **User-friendly authentication form**
- Clear error messages
- Easy-to-use interface
- Visual feedback

## Testing

### Local Development
1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000/seed`
3. Should work without authentication (development mode)

### Production
1. Set `ADMIN_SECRET_KEY` in Vercel environment variables
2. Visit `https://your-domain.com/seed?secret=your-key`
3. Or use the authentication form

## Troubleshooting

### "Unauthorized" Error
- Check that `ADMIN_SECRET_KEY` is set in environment variables
- Verify the secret key matches exactly (case-sensitive)
- Make sure you're using the correct environment (production vs development)

### Cron Job Not Working
- Vercel cron jobs should work automatically
- Check Vercel dashboard for cron job status
- Verify the route is accessible (should return 200 for cron requests)

### Development Mode Issues
- If you see authentication form in development, check `NODE_ENV`
- Should be `development` when running `npm run dev`

## Best Practices

1. **Use strong secrets**: At least 32 random characters
2. **Rotate secrets**: Change periodically for security
3. **Don't share secrets**: Keep them private
4. **Use different keys**: Different keys for dev/staging/production
5. **Monitor access**: Check logs for unauthorized access attempts

## Next Steps

1. ✅ Set `ADMIN_SECRET_KEY` in your environment variables
2. ✅ Test access in development
3. ✅ Deploy to production with secret key
4. ✅ Bookmark the authenticated URL for easy access

Your `/seed` page is now secure! 🔒

