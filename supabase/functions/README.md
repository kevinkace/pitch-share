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

## Deploy Process CSV Function

```bash
supabase functions deploy process-csv
```

## Test the Function

```bash
supabase functions invoke process-csv --help
```

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