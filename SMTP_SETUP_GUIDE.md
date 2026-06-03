# Custom Gmail SMTP Configuration Guide

## Supabase Custom SMTP Setup

After switching from Supabase's default SMTP to a custom Gmail SMTP provider, follow these steps to ensure email verification works correctly.

### Your Configuration Details
- **Sender Email**: aryaman9.ghosh@gmail.com
- **SMTP Host**: smtp.gmail.com
- **SMTP Port**: 465 (SSL/TLS)
- **Auth Method**: Gmail App Password
- **Rate Limit**: 60s interval between emails

### Step 1: Generate Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App Passwords**
4. Select **Mail** and **Windows Computer** (or your device)
5. Google will generate a 16-character password
6. Copy this password (do NOT use your regular Gmail password)

### Step 2: Configure in Supabase Dashboard

1. Log in to [Supabase Console](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Auth**
4. Scroll to **Email Templates** section
5. Look for **SMTP Provider Settings** or **Custom SMTP**
6. Enter the following details:

```
Provider: Custom SMTP
Sender Email: aryaman9.ghosh@gmail.com
SMTP Host: smtp.gmail.com
SMTP Port: 465
Encryption: SSL/TLS
Username: aryaman9.ghosh@gmail.com
Password: [Your 16-character App Password]
```

### Step 3: Verify SMTP Connection

1. After entering credentials, Supabase should show a **Test Email** button
2. Click it and send a test email to confirm connection
3. Check your email to verify it arrives correctly

### Step 4: Configure Rate Limiting

If you're getting rate limit errors, Supabase has built-in rate limiting (60s per email):

In Supabase Dashboard → Settings → Auth → Email:
- Default: 1 email per 60 seconds per address
- This is already optimal for development

### Common Issues & Solutions

#### Issue: "Error sending confirmation email"

**Solution 1: Verify App Password**
- Use the 16-character App Password, NOT your Gmail password
- App Password should have no spaces
- Ensure it's entered exactly as Google provided

**Solution 2: Check Gmail Security Settings**
- Go to [Google Account Security](https://myaccount.google.com/security)
- Check **Less secure app access** is allowed (if 2FA is enabled, this shouldn't matter)
- Check **Allow less secure apps** toggle

**Solution 3: Verify Email Template**
- Go to Supabase → Auth Email Templates
- Check that email template variables are correct
- Ensure `{{ .ConfirmationURL }}` is in the template

#### Issue: "SMTP Connection Timeout"

**Solution 1: Check Port**
- Gmail SMTP: Port 465 (not 587)
- Ensure SSL/TLS is enabled
- Port 587 is for STARTTLS (alternative option)

**Solution 2: Firewall/Network**
- Check if your server blocks port 465
- If using Docker/container, ensure networking is configured

#### Issue: "Rate limit exceeded"

**Solution 1: Wait 60 seconds**
- Gmail and Supabase rate limit: 1 email per 60 seconds per recipient
- This is intentional for security
- Test with different email addresses

**Solution 2: Check Supabase Logs**
- Go to Supabase → Logs → Auth
- Look for rate limit messages
- Confirm 60s interval is being respected

#### Issue: "Invalid credentials"

**Solution 1: Verify Credentials**
```
Email: aryaman9.ghosh@gmail.com ✓
App Password: [16 chars] ✓
No special characters in password ✓
```

**Solution 2: Regenerate App Password**
- Delete current App Password in Google Account
- Create a new one
- Update in Supabase

### Step 5: Email Template Configuration

Make sure your Supabase email templates include:

**Confirmation Email Template:**
```html
<h2>Confirm your email</h2>
<p>Click the link below to confirm your email address:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
<p>This link expires in 24 hours.</p>
```

**Variables Available:**
- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .Data.email }}` - User's email address
- `{{ .Data.role }}` - Custom data (role in your case)

### Step 6: Application Configuration

The application code now includes:

1. **Enhanced Error Handling** in signup:
   - Better error messages
   - Proper redirect URL handling
   - Try-catch for unexpected errors

2. **Auth Callback Page** (`/auth/callback`):
   - Processes email confirmation
   - Creates user profile
   - Redirects to appropriate dashboard

3. **Console Logging**:
   - Debug logs with `[v0]` prefix
   - Check browser console during signup
   - Check server logs for backend issues

### Testing Email Verification

1. **Test Sign Up:**
   ```
   Email: test@example.com
   Password: Test123456!
   Role: Student
   ```

2. **Check Email:**
   - Wait 60 seconds
   - Look in Inbox and Spam
   - Check email headers for SMTP info

3. **Click Confirmation Link:**
   - Opens email verification flow
   - Redirects to onboarding or dashboard
   - Profile should be auto-created

4. **Monitor Logs:**
   - Browser Console (F12)
   - Supabase Dashboard → Logs
   - Gmail Activity Log

### Troubleshooting Checklist

- [ ] Gmail 2FA enabled
- [ ] App Password generated (16 characters)
- [ ] App Password entered in Supabase (no spaces)
- [ ] SMTP Host: smtp.gmail.com
- [ ] SMTP Port: 465 (with SSL/TLS)
- [ ] Sender Email: aryaman9.ghosh@gmail.com
- [ ] Email template has {{ .ConfirmationURL }}
- [ ] Test email sent successfully from Supabase
- [ ] Network allows port 465 outbound
- [ ] Rate limit respected (60s between attempts)

### Gmail SMTP Port Options

| Port | Encryption | Status |
|------|-----------|--------|
| 465 | SSL/TLS | **RECOMMENDED** |
| 587 | STARTTLS | Alternative |
| 25 | None | Not recommended |

### Security Best Practices

1. **Never share App Password**
2. **Rotate App Password quarterly**
3. **Use dedicated email for SMTP**
4. **Enable email logging in Supabase**
5. **Monitor failed login attempts**
6. **Check rate limit compliance**

### Useful Links

- [Gmail SMTP Documentation](https://support.google.com/mail/answer/185833)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

### If Issues Persist

1. **Check Supabase Logs:**
   - Dashboard → Logs → Auth
   - Look for SMTP error messages

2. **Check Application Logs:**
   - Browser Console → Network tab
   - Look for HTTP 400/500 errors

3. **Enable Debug Mode:**
   - Set `DEBUG=supabase:*` environment variable
   - Restart application

4. **Contact Support:**
   - Supabase Support for SMTP issues
   - Gmail Support for account issues
   - Check [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase) for similar issues

### Next Steps

1. Generate Gmail App Password
2. Configure in Supabase Dashboard
3. Send test email
4. Test complete signup flow
5. Monitor logs for errors
6. Deploy with confidence

---

**Note**: The confirmation email may take 1-5 minutes to arrive, especially on first attempt. Check spam folder if needed.
