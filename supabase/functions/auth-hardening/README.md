# Edge Function: auth-hardening

## Routes
- `POST /auth-hardening/check-password`
- `POST /auth-hardening/verify-captcha`

## Deployment

1. **Deploy:**
   ```bash
   supabase functions deploy auth-hardening --project-ref <your-project-ref>
   ```

2. **Set Secrets:**
   ```bash
   supabase secrets set MIN_STRENGTH_SCORE=4 TURNSTILE_SECRET=<your-secret>
   ```

## URL
The function URL will be: `https://<project-ref>.supabase.co/functions/v1/auth-hardening`
Append `/check-password` or `/verify-captcha` to access endpoints.
