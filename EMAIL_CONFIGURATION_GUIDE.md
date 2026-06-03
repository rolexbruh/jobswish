# Email Configuration Guide for Applyly

## Custom SMTP Setup with Gmail

Your custom Gmail SMTP has been configured. Follow these steps to ensure everything works properly.

### Gmail App Password Setup

1. **Enable 2-Factor Authentication**
   - Go to myaccount.google.com
   - Click "Security" in the left menu
   - Ensure "2-Step Verification" is enabled

2. **Generate App Password**
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy this password (you'll use it for SMTP)

### Supabase SMTP Configuration

Your details:
- **Email**: aryaman9.ghosh@gmail.com
- **SMTP Host**: smtp.gmail.com
- **SMTP Port**: 465 (SSL/TLS)
- **Authentication**: Full
- **App Password**: #A1234567 (or your generated app password)

#### Steps to Configure in Supabase:

1. Go to Supabase Dashboard → Auth → Email Templates
2. Click "Settings" tab
3. Enable "Custom SMTP"
4. Fill in:
   - **From Email**: aryaman9.ghosh@gmail.com
   - **From Name**: Applyly
   - **SMTP Host**: smtp.gmail.com
   - **SMTP Port**: 465
   - **SMTP User**: aryaman9.ghosh@gmail.com
   - **SMTP Password**: Your generated app password (not your Gmail password)
   - **Encryption**: TLS

5. Click "Save" and test the connection

### Email Rate Limiting

Your configuration includes:
- **Interval**: 60 seconds between confirmation emails
- **This prevents rate limiting errors**

### Common Issues & Fixes

#### "Error sending confirmation email"

**Cause 1: Wrong Password**
- Solution: Use Google App Password, NOT your Gmail password
- Generate new one at myaccount.google.com/apppasswords

**Cause 2: Port Issues**
- Solution: Use port 465 with TLS (not 587)
- Gmail requires this specific configuration

**Cause 3: Email Not From Configured Address**
- Solution: Ensure SMTP user is aryaman9.ghosh@gmail.com
- The "From Email" must match SMTP user

**Cause 4: Less Secure Apps Blocked**
- Solution: Use App Password method (already set up)
- Don't enable "Less secure app access"

#### Rate Limiting Errors

**Error**: "Too many requests" or "Email not sent"

**Solution**:
- Wait 60 seconds before trying again
- This is enforced by Supabase rate limiting
- Default: 1 email per 60 seconds per email address

### Testing Email Configuration

1. Go to `/auth/signup`
2. Create test account with any email
3. Check that confirmation email arrives
4. Click the confirmation link
5. Should redirect to `/swipe` for students or `/recruiter` for companies

### Email Verification Flow

```
User Signs Up
    ↓
System Creates Auth User
    ↓
Supabase Sends Confirmation Email (via Gmail SMTP)
    ↓
User Clicks Link in Email
    ↓
Redirects to /auth/callback
    ↓
Code Exchanged for Session
    ↓
User Profile Created
    ↓
Redirect to /swipe or /recruiter
```

### Production Deployment

When deploying to production:

1. Update environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` → Your production URL

2. Supabase SMTP settings persist across environments

3. Email will be sent from: aryaman9.ghosh@gmail.com

### Troubleshooting Checklist

- [ ] Gmail 2FA enabled
- [ ] App Password generated and copied correctly
- [ ] SMTP Host: smtp.gmail.com
- [ ] SMTP Port: 465
- [ ] Encryption: TLS
- [ ] From Email: aryaman9.ghosh@gmail.com
- [ ] SMTP User: aryaman9.ghosh@gmail.com
- [ ] Password: 16-character app password (not Gmail password)
- [ ] Supabase Custom SMTP enabled
- [ ] Email sent from matches SMTP user
- [ ] Rate limiting: 60 seconds between emails

### Support Resources

- Gmail Help: https://support.google.com/mail
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- SMTP Configuration: https://supabase.com/docs/guides/auth/auth-smtp

### Files Modified

Updated for proper email handling:
- `/app/auth/signup/page.tsx` - Better error messages
- `/app/auth/login/page.tsx` - Fixed redirects
- `/app/auth/callback/route.ts` - Improved error handling
- `/app/auth/error/page.tsx` - Better error display

All ready to work with your custom Gmail SMTP!
