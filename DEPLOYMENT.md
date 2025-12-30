# Deployment Guide - CR8 Marketplace

این راهنما مراحل کامل دیپلوی پلتفرم CR8 را در Vercel توضیح می‌دهد.

## پیش‌نیازها

قبل از شروع، موارد زیر را آماده کنید:

### ۱. حساب‌های مورد نیاز
- ✅ حساب GitHub
- ✅ حساب Vercel (رایگان)
- ✅ حساب Clerk (رایگان تا 10K کاربر)
- ✅ حساب Stripe (رایگان)
- ✅ دیتابیس PostgreSQL (Vercel Postgres یا Supabase - رایگان)

### ۲. اطلاعات مورد نیاز
قبل از دیپلوی، کلیدهای API زیر را آماده کنید:
- Clerk API keys
- Stripe API keys
- Database connection string

---

## مرحله ۱: آماده‌سازی پروژه

### ۱.۱ Push به GitHub

```bash
# اگر git init نکرده‌اید
git init

# اضافه کردن فایل‌ها
git add .

# کامیت
git commit -m "Initial commit - CR8 Marketplace"

# اضافه کردن remote
git remote add origin YOUR_GITHUB_REPO_URL

# Push
git push -u origin main
```

---

## مرحله ۲: راه‌اندازی Database

### گزینه A: Vercel Postgres (توصیه می‌شود)

1. در Vercel Dashboard بروید به **Storage**
2. **Create Database** → **Postgres** را انتخاب کنید
3. نام دیتابیس را وارد کنید (مثلا `cr8-db`)
4. منطقه را انتخاب کنید (Washington, D.C. - IAD)
5. **Create** کلیک کنید
6. `DATABASE_URL` را کپی کنید (بعداً نیاز دارید)

### گزینه B: Supabase

1. به [supabase.com](https://supabase.com) بروید
2. **New Project** بسازید
3. از **Settings** → **Database**، `Connection String` را کپی کنید
4. Password دیتابیس را وارد کنید

---

## مرحله ۳: راه‌اندازی Clerk

### ۳.۱ ساخت Application

1. به [clerk.com](https://clerk.com) بروید
2. **Create Application** کلیک کنید
3. نام: `CR8 Marketplace`
4. Authentication methods را فعال کنید:
   - ✅ Email
   - ✅ Phone (optional)
   - ✅ Google OAuth

### ۳.۲ دریافت API Keys

از **API Keys** در Clerk Dashboard:
- کپی کنید: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- کپی کنید: `CLERK_SECRET_KEY`

### ۳.۳ تنظیم Webhook

1. در Clerk Dashboard به **Webhooks** بروید
2. **Add Endpoint** کلیک کنید
3. Endpoint URL: `https://YOUR-DOMAIN.vercel.app/api/webhooks/clerk`
4. Subscribe to events:
   - ✅ user.created
   - ✅ user.updated
   - ✅ user.deleted
5. **Signing Secret** را کپی کنید → این `CLERK_WEBHOOK_SECRET` شماست

---

## مرحله ۴: راه‌اندازی Stripe

### ۴.۱ ساخت حساب Stripe

1. به [stripe.com](https://stripe.com) بروید
2. حساب بسازید یا وارد شوید
3. **Activate test mode** (گوشه بالا راست)

### ۴.۲ دریافت API Keys

از **Developers** → **API keys**:
- کپی کنید: `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- کپی کنید: `Secret key` → `STRIPE_SECRET_KEY`

### ۴.۳ راه‌اندازی Stripe Connect

1. **Settings** → **Connect**
2. **Get Started** کلیک کنید
3. نوع: **Platform or marketplace**
4. تنظیمات را کامل کنید
5. Client ID را کپی کنید → `STRIPE_CONNECT_CLIENT_ID`

### ۴.۴ تنظیم Webhook

1. **Developers** → **Webhooks**
2. **Add endpoint** کلیک کنید
3. Endpoint URL: `https://YOUR-DOMAIN.vercel.app/api/webhooks/stripe`
4. **Select events**:
   - ✅ payment_intent.succeeded
   - ✅ customer.subscription.created
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.paid
   - ✅ invoice.payment_failed
   - ✅ transfer.paid
5. **Signing secret** را کپی کنید → `STRIPE_WEBHOOK_SECRET`

---

## مرحله ۵: Deploy به Vercel

### ۵.۱ Import پروژه

1. به [vercel.com/dashboard](https://vercel.com/dashboard) بروید
2. **Add New...** → **Project** کلیک کنید
3. GitHub repository خود را Import کنید
4. Framework: **Next.js** (خودکار تشخیص داده می‌شود)

### ۵.۲ تنظیم Environment Variables

در صفحه Import، **Environment Variables** را باز کنید و موارد زیر را اضافه کنید:

```env
# Database
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# App
NEXT_PUBLIC_APP_URL=https://YOUR-DOMAIN.vercel.app
PLATFORM_COMMISSION_RATE=0.10
MINIMUM_PAYOUT=50.00
```

> **نکته**: `YOUR-DOMAIN` را بعد از اولین deploy با domain واقعی جایگزین کنید.

### ۵.۳ Deploy

**Deploy** را کلیک کنید و منتظر بمانید (۲-۳ دقیقه)

---

## مرحله ۶: تنظیمات بعد از Deploy

### ۶.۱ به‌روزرسانی URLs

domain دریافت شده از Vercel را در موارد زیر به‌روز کنید:

1. **Clerk Dashboard**:
   - **Paths** → Update URLs
   - Home URL: `https://YOUR-DOMAIN.vercel.app`
   - Sign in URL: `https://YOUR-DOMAIN.vercel.app/sign-in`
   - Sign up URL: `https://YOUR-DOMAIN.vercel.app/sign-up`

2. **Stripe Dashboard**:
   - Webhook endpoint URL را به domain واقعی تغییر دهید
   - در Connect settings، redirect URLs را اضافه کنید

3. **Vercel Environment Variables**:
   - `NEXT_PUBLIC_APP_URL` را به domain واقعی تغییر دهید
   - **Redeploy** کنید

### ۶.۲ اجرای Database Migrations

```bash
# با استفاده از Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# یا در Production environment:
# از Vercel Dashboard → Project → Settings → General
# Connect to database و migrations را اجرا کنید
```

### ۶.۳ تست سیستم

1. **تست Authentication**:
   - به `https://YOUR-DOMAIN.vercel.app/sign-up` بروید
   - حساب بسازید
   - چک کنید که در database ذخیره شده

2. **تست Webhooks**:
   - در Clerk dashboard، test webhook ارسال کنید
   - در Stripe dashboard، test webhook ارسال کنید
   - لاگ‌ها را در Vercel چک کنید

3. **تست Payment (Test Mode)**:
   - محتوا بسازید
   - با کارت تست خرید کنید: `4242 4242 4242 4242`
   - چک کنید webhook دریافت شد

---

## مرحله ۷: تنظیمات Optional

### Redis (برای Caching)

```bash
# Upstash Redis (رایگان)
# در vercel.com/integrations
# Upstash Redis را نصب کنید
# Environment variables خودکار اضافه می‌شود
```

### File Storage (S3 یا R2)

```env
# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=cr8-content

# یا Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
```

---

## مرحله ۸: Switch به Production

وقتی آماده Production شدید:

### ۸.۱ Stripe Production Mode

1. در Stripe Dashboard، **Activate your account** کنید
2. Business information را کامل کنید
3. Test mode را **OFF** کنید
4. Production API keys را دریافت کنید
5. در Vercel environment variables را به‌روز کنید

### ۸.۲ Domain اختصاصی (Optional)

1. در Vercel → **Settings** → **Domains**
2. Domain خود را اضافه کنید
3. DNS records را تنظیم کنید
4. SSL certificate خودکار صادر می‌شود

---

## نکات مهم

### امنیت

- ❌ **هرگز** API keys را commit نکنید
- ✅ همیشه از `.env.local` استفاده کنید
- ✅ Webhook secrets را حتماً تنظیم کنید
- ✅ در production، HTTPS را enforce کنید

### Performance

- برای static assets از Vercel Edge Network استفاده می‌شود
- Images خودکار optimize می‌شوند
- API routes در Edge Functions اجرا می‌شوند

### Monitoring

لاگ‌ها را در Vercel Dashboard چک کنید:
- **Deployments** → انتخاب deployment → **Logs**
- Real-time logs برای debug

### Cost Optimization

**Vercel Free Tier شامل:**
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless Functions: 100 GB-hours

**Database:**
- Vercel Postgres: Free tier: 256 MB
- Supabase: Free tier: 500 MB

---

## عیب‌یابی

### Build Errors

```bash
# خطای Prisma
✅ راه‌حل: DATABASE_URL را در environment variables اضافه کنید

# خطای dependency
✅ راه‌حل: node version را چک کنید (>=20.11.0)
```

### Runtime Errors

```bash
# Database connection error
✅ راه‌حل: DATABASE_URL صحیح است؟ VPN خاموش است؟

# Webhook errors
✅ راه‌حل: Webhook URL صحیح است؟ Signing secret درست است؟
```

### Payment Issues

```bash
# Stripe webhook not receiving
✅ راه‌حل: Test mode فعال است؟ Endpoint URL صحیح است؟

# Connect account error
✅ راه‌حل: Platform settings در Stripe کامل شده؟
```

---

## منابع

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Clerk Docs](https://clerk.com/docs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

## پشتیبانی

مشکل دارید؟
- GitHub Issues را چک کنید
- با تیم توسعه تماس بگیرید

---

موفق باشید! 🚀
