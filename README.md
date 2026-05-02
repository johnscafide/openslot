# Open Slot

Last-minute appointment deals from vetted local businesses.

## What it does

- **Businesses** (approved only) post empty appointment slots in 60 seconds
- **Consumers** browse a live board and claim slots at a discount
- **Emails** fire automatically on claims, price watch matches, and "I need" requests

---

## Tech stack

| Thing | What | Free tier |
|---|---|---|
| Framework | Next.js 14 (App Router) | Yes |
| Database | Supabase | 500MB free |
| Emails | Resend | 100/day free |
| Hosting | Vercel | Yes |

---

## Deploy in 4 steps

### Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (pick a name like `open-slot`)
3. Once it's ready, go to **SQL Editor** and paste the entire contents of `supabase/schema.sql` → Run it
4. Go to **Settings → API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2 — Set up Resend

1. Go to [resend.com](https://resend.com) and create a free account
2. Go to **API Keys** → Create API Key
3. Copy the key → this is your `RESEND_API_KEY`
4. (Later, when you buy a domain, add it to Resend so emails come from `@openslot.co`)

### Step 3 — Push to GitHub

```bash
# In your terminal:
cd open-slot
git init
git add .
git commit -m "initial commit"
# Go to github.com → New repository → copy the remote URL
git remote add origin https://github.com/yourusername/open-slot.git
git push -u origin main
```

### Step 4 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your `open-slot` GitHub repo
3. In **Environment Variables**, add all the values from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL` (your email)
   - `NEXT_PUBLIC_BASE_URL` (your Vercel URL, e.g. `https://open-slot.vercel.app`)
4. Click **Deploy** — Vercel handles everything automatically

---

## How to approve a business

When a business applies, you'll get an email. To approve them:

1. Open your [Supabase dashboard](https://supabase.com)
2. Go to **Table Editor → applications**
3. Find the application → change `status` to `approved`
4. Go to **Table Editor → businesses** → Add a row manually with their info
5. Copy their `post_token` (auto-generated) and email it to them with the posting URL:
   ```
   Your posting link: https://your-site.vercel.app/post?token=THEIR_TOKEN
   ```

That's their key. They bookmark it and use it every time they post a slot.

---

## Local development

```bash
# Install dependencies
npm install

# Create your local env file
cp .env.example .env.local
# Fill in your Supabase + Resend keys

# Run locally
npm run dev
# → http://localhost:3000
```

---

## Pages

| URL | What it is |
|---|---|
| `/` | Landing page |
| `/board` | Consumer slot board (live, public) |
| `/apply` | Business application form |
| `/post?token=xxx` | Business slot posting (token required) |

## API Routes

| Route | Method | What it does |
|---|---|---|
| `/api/slots` | GET | Verify business token |
| `/api/slots` | POST | Business posts a new slot |
| `/api/claim` | POST | Consumer claims a slot |
| `/api/apply` | POST | Business submits application |
| `/api/need` | POST | Consumer posts a need |
| `/api/watch` | POST | Consumer adds price watch |

---

## When you're ready to buy a domain

1. Buy `openslot.co` (or whatever you land on) from Namecheap or Google Domains
2. In Vercel → your project → **Settings → Domains** → add your domain
3. Follow Vercel's DNS instructions (takes ~10 min)
4. Update `NEXT_PUBLIC_BASE_URL` in Vercel env vars to your new domain
5. Add the domain to Resend so emails come from `notify@openslot.co`

---

Built with Next.js · Supabase · Resend · Deployed on Vercel
