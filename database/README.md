# Database Setup

This folder contains the database schema and setup scripts for Pitch Share.

## Files

- `setup.sql` - Complete database schema, indexes, and RLS policies

## Deployment Instructions

### Initial Setup

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run Setup Script**
   - Copy the contents of `setup.sql`
   - Paste into SQL Editor
   - Click "Run" to execute

### Storage Setup (After Tables)

1. **Create Storage Bucket**
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('csv-uploads', 'csv-uploads', false);
   ```

2. **Add Storage Policies**
   ```sql
   -- Allow users to upload their own CSV files
   CREATE POLICY "Users can upload own CSV files" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'csv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Allow users to read their own CSV files
   CREATE POLICY "Users can read own CSV files" ON storage.objects
     FOR SELECT USING (bucket_id = 'csv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Schema Overview

### Tables Created

- **`pitches`** - Individual pitch records from CSV files
- **`sessions`** - Aggregated session metadata and statistics

### Indexes Created

- Sessions: Optimized for user session listings
- Pitches: Optimized for session-specific and date-based queries

### Security

- Row Level Security (RLS) enabled on all tables
- **Privacy Control**: Sessions have `is_private` flag (default: true)
  - Private sessions: Only visible to session owner
  - Public sessions: Visible to all users (including anonymous)
  - Pitches inherit privacy from their session
- Storage bucket policies restrict file access by user

## Next Steps

After running this setup:

1. Create Edge Function for CSV processing
2. Update frontend to use new schema
3. Test file upload and processing workflow

## Rollback

To drop all created tables and policies:

```sql
DROP TABLE IF EXISTS pitches CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
```