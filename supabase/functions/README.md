# Edge Function Deployment

## Prerequisites

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project** (from project root)
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

## Available Functions

### process-csv
Processes uploaded CSV files containing pitch data.

### download-user-data
Downloads all user data as JSON (sessions, pitches, profile).
**Security:** Requires authentication, uses RLS policies.

### delete-user-account
Permanently deletes user account and all associated data.
**Security:** Requires authentication + exact confirmation text.

## Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy individual functions
supabase functions deploy process-csv
supabase functions deploy download-user-data
supabase functions deploy delete-user-account
```

## Environment Variables Required

- `SUPABASE_URL` - Automatically provided
- `SUPABASE_ANON_KEY` - Automatically provided  
- `SUPABASE_SERVICE_ROLE_KEY` - Required for delete-user-account function

## Test the Functions

```bash
# Test process-csv
supabase functions invoke process-csv --help

# Test download (requires authentication)
supabase functions invoke download-user-data \
  --header "Authorization: Bearer YOUR_JWT_TOKEN"

# Test delete (requires authentication + confirmation)
supabase functions invoke delete-user-account \
  --header "Authorization: Bearer YOUR_JWT_TOKEN" \
  --data '{"confirmation": "DELETE MY ACCOUNT"}'
```

## Security Notes

- All user data functions validate JWT tokens
- RLS policies ensure data isolation between users
- Account deletion requires explicit confirmation text
- Functions use appropriate permission levels for operations

## Function Details

### **process-csv**
- **Endpoint**: `https://YOUR_PROJECT_ID.functions.supabase.co/process-csv`
- **Method**: POST
- **Auth**: Bearer token required
- **Payload**:
  ```json
  {
    "filePath": "user-id/filename.csv",
    "isPrivate": true
  }
  ```

### **Response**:
```json
{
  "success": true,
  "sessionId": "PR_20260310_1530_session",
  "pitchCount": 25,
  "fastestSpeed": 52.5,
  "averageSpeed": 47.2
}
```

## Update Config

Don't forget to update `supabase/config.toml` with your actual project ID!

## Environment Variables

The function uses:
- `SUPABASE_URL` - Automatically provided
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically provided