# Supabase Setup Guide 🚀

This guide will help you set up Supabase for your todo app to enable cloud storage and real-time synchronization.

## Prerequisites

- A Supabase account (free tier available)
- Your todo app files (HTML, CSS, JS)

## Step 1: Create Supabase Project

1. **Sign up/Login to Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Create an account or sign in
   - Click "New Project"

2. **Create Your Project**
   - Choose your organization
   - Enter project name (e.g., "Todo App")
   - Set a strong database password
   - Choose a region close to you
   - Click "Create new project"

3. **Wait for Setup**
   - Project creation takes 1-2 minutes
   - You'll see a dashboard when ready

## Step 2: Set Up Database Schema

1. **Open SQL Editor**
   - In your Supabase dashboard
   - Click "SQL Editor" in the sidebar
   - Click "New Query"

2. **Run the Schema**
   - Copy the contents of `supabase-schema.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

3. **Verify Tables**
   - Go to "Table Editor" in sidebar
   - You should see a "todos" table
   - Check the structure matches the schema

## Step 3: Get API Credentials

1. **Find Your Credentials**
   - Go to "Settings" → "API" in sidebar
   - Copy these two values:
     - **Project URL** (starts with https://...)
     - **Anon/Public Key** (long string starting with ey...)

2. **Configure Your App**
   - Open `config.js` in your todo app
   - Replace `YOUR_SUPABASE_URL` with your Project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your Anon key

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co', // ← Your URL here
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // ← Your key here
    options: {
        // ... rest stays the same
    }
};
```

## Step 4: Enable Real-time (Optional)

1. **Enable Realtime**
   - Go to "Database" → "Replication" in sidebar
   - Find "todos" table
   - Toggle "Enable" for real-time updates

2. **Test Real-time**
   - Open your app in two browser tabs
   - Add a task in one tab
   - It should appear in the other tab instantly

## Step 5: Authentication (Optional)

For user-specific todos, you can enable authentication:

1. **Enable Auth Providers**
   - Go to "Authentication" → "Providers"
   - Enable desired providers (Email, Google, GitHub, etc.)

2. **Update Policies**
   - The schema already includes user-based policies
   - Tasks will be private to each user when auth is enabled

3. **Add Auth to Your App**
   - Use Supabase auth methods in your JavaScript
   - Sign in users before they can create todos

## Step 6: Test Your Setup

1. **Open Your App**
   - Open `index.html` in your browser
   - You should see "Todo App loaded successfully!"

2. **Test Functionality**
   - Add a few tasks
   - Mark some as complete
   - Refresh the page - tasks should persist
   - Check Supabase dashboard - data should appear in "todos" table

3. **Test Real-time** (if enabled)
   - Open app in two browser tabs
   - Changes in one should appear in the other

## Troubleshooting

### Common Issues

**"Supabase not configured" warning**
- Check that you've replaced the placeholder values in `config.js`
- Ensure the URL starts with `https://`
- Verify the anon key is the full string

**Network errors**
- Check your internet connection
- Verify the Supabase project URL is correct
- Try refreshing the page

**Tasks not saving**
- Check browser console for errors
- Verify the database schema was created correctly
- Ensure RLS policies are set up

**Real-time not working**
- Check that real-time is enabled for the todos table
- Verify you're testing with multiple browser tabs/windows
- Check network tab for WebSocket connections

### Debugging Tips

1. **Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Look for Supabase connection messages

2. **Supabase Logs**
   - Go to "Logs" in your Supabase dashboard
   - Check for API errors and queries

3. **Network Tab**
   - Check if API calls are being made
   - Verify response status codes

## Advanced Configuration

### Custom Domain (Pro Plan)
- Set up custom domain in Supabase settings
- Update the URL in `config.js`

### Performance Optimization
- Add database indexes for better query performance
- Use Supabase Edge Functions for complex operations
- Implement proper caching strategies

### Security Best Practices
- Never expose service role keys in frontend code
- Use Row Level Security (RLS) policies
- Validate all user inputs
- Monitor usage in Supabase dashboard

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Your app is now powered by Supabase!** 🎉

Your tasks will sync across devices and update in real-time. The app gracefully falls back to localStorage if Supabase is unavailable, ensuring it works offline too.
