# poncho-starter

A starter template for building [Poncho](https://github.com/cesr/poncho-ai)
agents and deploying them to [Railway](https://railway.com).

One-click deploy on Railway provisions:
- The agent service (Node 22, Chromium for browser tools, in-process scheduler)
- A managed Postgres for conversation history + agent memory

> **TODO**: replace this with the actual Railway template URL once published.
>
> [![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/REPLACE_ME)

## What's included

- **Browser tools** — agent can open URLs, click, and read pages via headless Chromium.
- **Bash sandbox** — `run_code` tool with Python and JavaScript, isolated via `isolated-vm`.
- **Reminders** — agent can set, list, and cancel reminders via tools (`set_reminder`, etc.).
- **Crons** — define scheduled tasks in `AGENT.md` frontmatter; they run via the in-process scheduler (no external trigger needed on Railway).
- **Telegram messaging** — wire up a bot and the agent responds to mentions. Optional.
- **Postgres storage** — conversations, memory, and agent state all persisted.
- **Bearer auth** — `/api` routes are protected by `PONCHO_AUTH_TOKEN`.
- **Production-safe tool defaults** — write/delete tools are off in production by default.

## Deploy

1. Click the Deploy on Railway button above.
2. Railway will prompt for required env vars:
   - `ANTHROPIC_API_KEY` — your Anthropic API key
   - `PONCHO_AUTH_TOKEN` — any random string; clients must send it as a Bearer token
   - `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` — optional
3. Railway provisions the Postgres service and connects it via `DATABASE_URL`.
4. Once deployed, copy your service URL (e.g. `https://your-agent.up.railway.app`).

### Wire up Telegram (optional)

```sh
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  --data-urlencode "url=https://<your-railway-url>/api/messaging/telegram" \
  --data-urlencode "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

Then add your Telegram user ID to `allowedUserIds` in `poncho.config.js` (find your ID by messaging [@userinfobot](https://t.me/userinfobot)).

## Local development

```sh
git clone https://github.com/cesr/poncho-starter.git my-agent
cd my-agent
cp .env.example .env  # fill in ANTHROPIC_API_KEY and DATABASE_URL
npm install
npx poncho dev
```

The dev server runs on http://localhost:3000 with a built-in web UI for chatting with the agent locally.

## Customizing

- **Persona / system prompt**: edit `AGENT.md`.
- **Add a skill**: create `skills/<name>/SKILL.md`. Skills are activated by the agent when relevant.
- **Add a cron job**: add an entry under `cron:` in `AGENT.md` frontmatter.
- **Tools and feature flags**: edit `poncho.config.js`.
- **Tests**: put YAML test files under `tests/`, run with `npx poncho test`.

## Crons stay running on Railway

By default Railway's "App Sleeping" puts the container to sleep when there's
no traffic. While asleep, the in-process scheduler doesn't run, so crons
won't fire. To keep crons reliable, disable App Sleeping in your service's
Settings, or have an external pinger keep it warm.

## Updating

```sh
npm install @poncho-ai/cli@latest @poncho-ai/browser@latest
npx poncho build railway --force  # regenerate Dockerfile from latest scaffold
```

## License

MIT
