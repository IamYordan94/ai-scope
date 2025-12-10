# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)
4. Go to **SQL Editor** in the Supabase dashboard
5. Copy and paste the contents of `supabase/schema.sql` and run it
6. Go to **Settings > API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this secret!)

## Step 3: Create Environment File

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=your-adsense-id (optional, add later)
```

## Step 4: Seed Initial Data

You have two options:

### Option A: Manual Seeding (Recommended for first time)
1. Go to Supabase Dashboard > Table Editor > `tools`
2. Click "Insert" and manually add tools
3. Or use the Supabase SQL editor to insert data

### Option B: Use Seed Script (Requires ts-node)
```bash
npm install -D ts-node
npx ts-node scripts/seed-tools.ts
```

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Deploy!

The cron job will automatically run daily at 6 AM UTC to update tools.

## Troubleshooting

- **Database connection errors**: Check your Supabase URL and keys
- **No tools showing**: Make sure you've seeded the database
- **Build errors**: Run `npm install` again
- **Cron not working**: Check Vercel cron configuration in dashboard

## Next Steps

1. Add your Google AdSense ID to start monetizing
2. Customize the design in `app/globals.css`
3. Add more tools manually or wait for automation
4. Set up custom domain in Vercel (optional)
