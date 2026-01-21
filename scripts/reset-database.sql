-- ============================================
-- EZIOX DATABASE RESET SCRIPT FOR PRODUCTION
-- ============================================
-- WARNING: This will DELETE ALL DATA!
-- Run this only when you want a fresh start.
-- ============================================

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS template_likes CASCADE;
DROP TABLE IF EXISTS community_templates CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS admin_audit_log CASCADE;
DROP TABLE IF EXISTS link_click_analytics CASCADE;
DROP TABLE IF EXISTS profile_view_analytics CASCADE;
DROP TABLE IF EXISTS analytics_daily CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS spotify_connections CASCADE;
DROP TABLE IF EXISTS social_integrations CASCADE;
DROP TABLE IF EXISTS email_subscribers CASCADE;
DROP TABLE IF EXISTS custom_domains CASCADE;
DROP TABLE IF EXISTS partner_applications CASCADE;
DROP TABLE IF EXISTS short_links CASCADE;
DROP TABLE IF EXISTS scheduled_posts CASCADE;
DROP TABLE IF EXISTS media_library CASCADE;
DROP TABLE IF EXISTS profile_widgets CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS user_links CASCADE;
DROP TABLE IF EXISTS link_groups CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop old tables that were removed from schema
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;

-- Drop drizzle migration tracking table (allows re-running all migrations)
DROP TABLE IF EXISTS __drizzle_migrations CASCADE;
DROP TABLE IF EXISTS drizzle.__drizzle_migrations CASCADE;
DROP SCHEMA IF EXISTS drizzle CASCADE;

-- Confirmation message
SELECT 'Database reset complete. Run bun run db:push to recreate tables.' AS status;
