# Discovery call email setup

The form saves each request through a server-side Supabase service-role client before attempting email. Keep the service-role key and Resend key on the server; never add either to a `NEXT_PUBLIC_` variable.

## Environment variables

Set these in Vercel Project Settings → Environment Variables, and in `.env.local` for local development:

| Variable | Value |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | The service-role key from the Supabase project. Keep it private. |
| `RESEND_API_KEY` | A Resend API key authorized to send mail. |
| `RESEND_FROM_EMAIL` | A sender such as `ProbeTech <calls@your-verified-domain.com>`, using a verified domain. |
| `OWNER_NOTIFICATION_EMAIL` | The address that should receive the full request. |
| `CRON_SECRET` | A long random secret used to authorize the email retry job. |

## Verify the sending domain

1. Add a domain you own in the Resend dashboard.
2. Resend will show the DNS records it needs. Add the displayed SPF and DKIM records at the DNS provider for that domain. The values and host names are specific to your domain, so copy them from Resend instead of using sample records.
3. Check for an existing SPF TXT record before adding or changing one. A domain should have one SPF policy; combine authorized senders according to the DNS provider’s guidance instead of publishing duplicate SPF records.
4. Return to Resend and verify the records. DNS changes can take time to propagate. Use the exact sender domain that Resend marks as verified in `RESEND_FROM_EMAIL`.
5. Add a DMARC policy for the domain and monitor reports as you begin sending. Start with a policy appropriate to your existing mail setup so legitimate mail is not rejected unexpectedly.

SPF identifies permitted sending infrastructure and DKIM lets receiving servers verify the message signature. Resend shows the records and their verification state in its dashboard; use those current values for this domain.

## Delivery and retries

The app attempts each email immediately after it saves the request. It records attempts and the latest error in Supabase. Pending mail is retried by `/api/cron/discovery-call-email-retries`, configured in `vercel.json` to run daily. The cron endpoint requires Vercel to send `Authorization: Bearer $CRON_SECRET`.

The initial synchronous send makes up to three attempts. The persistent retry worker continues pending deliveries up to eight total attempts. Requests remain in the database if email delivery fails. Check the request row’s email status and last-error fields when troubleshooting.

The retry migration must be applied after the base request-table migration. It adds storage for the kept questionnaire answers and email delivery state.
