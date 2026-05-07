# poncho-starter

A one-click [Poncho](https://github.com/cesr/poncho-ai) agent for [Railway](https://railway.com).

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/zQHXif)

![Poncho CLI and Web UI](https://raw.githubusercontent.com/cesr/poncho-ai/main/assets/poncho.png)

Click deploy and you get a working AI agent: built-in chat UI, Telegram-ready, browser automation, sandboxed code execution, scheduled jobs, persistent memory in Postgres. Customize the `AGENT.md` and skills to make it your own.

## What is Poncho?

[Poncho](https://github.com/cesr/poncho-ai) is a multi-tenant harness for building AI agents you can share. You define behavior in a single `AGENT.md` file, add skills and tools, develop locally by chatting with the agent, and deploy it as a web app your team accesses through a chat UI, Slack, Telegram, email, or REST API.

**For your team**, the agent is a web app. They don't need to know how it works.

**For you**, the agent is a git repo. Behavior, skills, tests, and configuration are all version-controlled. You iterate locally with `poncho dev`, review changes in PRs, and deploy anywhere that runs Node.

## What's in the box

This template provisions two services on Railway:

- **`poncho-starter`** — the agent service. Node 22, Chromium installed for browser tools, in-process scheduler for crons.
- **`Postgres`** — managed Postgres for conversations, memory, and agent state.

Pre-configured features:

- **Web UI + REST API** — chat with the agent in your browser, or via SSE-streaming HTTP.
- **Browser automation** — headless Chromium with snapshot/ref interaction, live viewport.
- **Sandboxed code execution** — `run_code` tool with Python and JavaScript via V8 isolates.
- **Reminders** — agent gets `set_reminder`, `list_reminders`, `cancel_reminder` tools.
- **Crons** — define scheduled tasks in `AGENT.md` frontmatter; they run automatically (no external triggers).
- **Telegram messaging** — wire up a bot and the agent responds. Optional.
- **Persistent memory** — semantic recall across conversations, backed by Postgres.
- **Bearer auth** — `/api` routes are protected by `PONCHO_AUTH_TOKEN`.
- **Production-safe tool defaults** — write/delete tools are disabled in production by default; opt back in per environment in `poncho.config.js`.

### Bundled skills

The starter ships with three example skills (and two example crons in `AGENT.md`) so you can see the patterns in action. Keep, customize, or replace:

- **`dream`** — nightly memory consolidation. Reviews the day's conversations and writes anything worth remembering to long-term memory. Wired up to a 3am cron (Etc/UTC).
- **`daily-question` cron** — asks you a thoughtful, present-focused question once a day to learn about your life and store it in memory. Defined in `AGENT.md`, fires via Telegram if configured.
- **`engaging-writer`** — a writing style guide for longform content. Covers narrative techniques, register-shifting, and a long list of AI writing tropes to avoid. Activates when you ask the agent to draft an essay, newsletter, or anything else that needs to read well.
- **`weather`** — fetches current weather and forecast for any city via Open-Meteo (no API key needed). A useful tool *and* a clean example of how a script-backed skill is structured.

## Deploy

1. Click **Deploy on Railway** above.
2. Railway will prompt for:
   - `ANTHROPIC_API_KEY` — your Anthropic API key ([get one](https://console.anthropic.com))
   - `PONCHO_AUTH_TOKEN` — auto-generated; clients send it as a Bearer token
   - `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` — optional, for Telegram
3. Railway provisions Postgres and connects it via `DATABASE_URL` automatically.
4. Once deployed, copy your service URL (e.g. `https://your-agent.up.railway.app`).

### Wire up Telegram (optional)

```sh
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  --data-urlencode "url=https://<your-railway-url>/api/messaging/telegram" \
  --data-urlencode "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

Then add your Telegram user ID to `allowedUserIds` in `poncho.config.js` (find your ID by messaging [@userinfobot](https://t.me/userinfobot)).

### Keep crons running

Railway's "App Sleeping" pauses the container when there's no traffic — and while paused, the in-process cron scheduler doesn't run. To keep crons firing reliably:

- **Service Settings → Serverless → toggle App Sleeping off**, or
- Have an external pinger hit your service every few minutes (UptimeRobot, healthchecks.io, GitHub Actions cron, etc.)

## Local development

```sh
gh repo clone cesr/poncho-starter my-agent
cd my-agent
cp .env.example .env  # fill in ANTHROPIC_API_KEY and DATABASE_URL
npm install
npx poncho dev
```

The dev server runs on http://localhost:3000 with the built-in web UI for chatting with the agent locally.

## Customizing

- **Persona / system prompt**: edit `AGENT.md`
- **Add a skill**: create `skills/<name>/SKILL.md` — the agent activates it when relevant
- **Add a cron job**: add an entry under `cron:` in `AGENT.md` frontmatter
- **Tools and feature flags**: edit `poncho.config.js`

For the full feature reference, see the [Poncho documentation](https://github.com/cesr/poncho-ai#readme).

## Updating

When new versions of Poncho ship, update the runtime deps and regenerate the Dockerfile from the latest scaffold:

```sh
npm install @poncho-ai/cli@latest @poncho-ai/browser@latest
npx poncho build railway --force
```

## Links

- [Poncho documentation](https://github.com/cesr/poncho-ai)
- [Discord](https://discord.gg/92QanAxYcf)
- [Issues](https://github.com/cesr/poncho-ai/issues)

## License

MIT
