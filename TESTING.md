# Testing Guide - Eziox

> **Eziox Development** · [eziox.link](https://eziox.link)

---

## 🧪 Manual Testing Checklist

### Link Click Tracking (All Bio Pages)

**Test Steps:**
1. Visit any bio page: `eziox.link/{username}` (e.g., `eziox.link/saito`)
2. Open browser DevTools Console (F12)
3. Click on any link
4. **Expected Logs:**
   ```
   [Bio] Tracking click for link: {linkId}
   [Bio] Click tracked: { success: true, clicks: X }
   ```
5. **Server Logs (Vercel):**
   ```
   [Server] Tracking click for linkId: {linkId}
   [Server] Link found, userId: {userId}, current clicks: X
   [Server] Link clicks updated to: X+1
   [Server] User stats updated - totalLinkClicks: Y, score: Z
   ```
6. Refresh the page and verify:
   - Link clicks count increased in `/links` page
   - Total clicks in stats card increased
   - User's totalLinkClicks on leaderboard increased

**Test Cases:**
- [ ] Test on your own bio page (`/saito`)
- [ ] Test on other users' bio pages
- [ ] Test multiple clicks on same link
- [ ] Test clicks on different links
- [ ] Verify clicks persist after page refresh

---

### Session Persistence (7-Day Expiry)

**Configuration:**
- Session cookie: `maxAge: 60 * 60 * 24 * 7` (7 days)
- Database: `SESSION_EXPIRY_DAYS = 7`

**Test Steps:**
1. Sign in to your account
2. Check cookie in DevTools → Application → Cookies
   - Cookie name: `session-token`
   - Max-Age: `604800` (7 days in seconds)
   - HttpOnly: `true`
   - Secure: `true` (production)
   - SameSite: `Lax`
3. Close browser and reopen (same day)
   - [ ] Still logged in
4. Wait 6 days, reopen browser
   - [ ] Still logged in
5. Wait 8 days, reopen browser
   - [ ] Session expired, redirected to sign-in

**Automated Test (Optional):**
```bash
# Check session expiry in database
SELECT token, expires_at, 
       expires_at - NOW() as time_remaining
FROM sessions 
WHERE user_id = '{your-user-id}'
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 🔍 Debugging

### Enable Verbose Logging

**Client-side (Browser Console):**
- All bio page clicks log to console
- Look for `[Bio]` prefix

**Server-side (Vercel Logs):**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select project: `eziox-web`
3. Go to "Logs" tab
4. Filter by `[Server]` prefix
5. Watch for click tracking logs

### Common Issues

**Clicks not incrementing:**
- Check console for errors
- Verify `linkId` is valid UUID
- Check Vercel logs for server errors
- Verify database connection

**Session expires too early:**
- Check cookie `Max-Age` in DevTools
- Verify `SESSION_EXPIRY_DAYS` in code
- Check database `sessions.expires_at`

---

## 📊 Database Queries

### Check Link Clicks
```sql
-- Get link with most clicks
SELECT title, url, clicks 
FROM user_links 
WHERE user_id = '{user-id}'
ORDER BY clicks DESC 
LIMIT 10;

-- Get total clicks for user
SELECT SUM(clicks) as total_clicks 
FROM user_links 
WHERE user_id = '{user-id}';
```

### Check User Stats
```sql
-- Get user stats
SELECT profile_views, total_link_clicks, score 
FROM user_stats 
WHERE user_id = '{user-id}';
```

### Check Active Sessions
```sql
-- Get all active sessions
SELECT u.username, s.created_at, s.expires_at
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > NOW()
ORDER BY s.created_at DESC;
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Link clicks increment on all bio pages
- [ ] Clicks persist after page refresh
- [ ] Total clicks shown in `/links` page
- [ ] User stats update on leaderboard
- [ ] Session persists for 7 days
- [ ] Session expires after 7 days
- [ ] Logs appear in Vercel dashboard
- [ ] No console errors on bio pages

---

**Last Updated**: 2026-01-14  
**Next Test**: After each deployment
