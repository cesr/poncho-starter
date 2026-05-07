export default {
  // Headless browser tools (Playwright). Chromium is installed in the Dockerfile.
  browser: true,

  // One-off reminders: agent gets `set_reminder`, `list_reminders`, `cancel_reminder`.
  reminders: {
    enabled: true,
    pollSchedule: "*/10 * * * *",
  },

  // Telegram messaging. Set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET env
  // vars, then point your bot's webhook at /api/messaging/telegram. Add your
  // own Telegram user ID(s) to allowedUserIds (find yours via @userinfobot).
  messaging: [
    {
      platform: "telegram",
      allowedUserIds: [],
    },
  ],

  // Sandboxed code execution.
  bash: { python: true, javascript: true },
  isolate: { memoryLimit: 128, timeLimit: 10000 },

  // Persist conversations + memory.
  // - On Railway (and anywhere DATABASE_URL is set), use Postgres.
  // - Locally, fall back to SQLite under ~/.poncho/store so `poncho dev` works
  //   with zero setup. No need to spin up Postgres just to chat with the agent.
  storage: {
    provider: process.env.DATABASE_URL ? "postgresql" : "sqlite",
    memory: {
      enabled: true,
      maxRecallConversations: 50,
    },
  },

  // Bearer auth on /api routes. Set PONCHO_AUTH_TOKEN env var.
  auth: { required: true, type: "bearer" },

  // Tool permissions. `byEnvironment` makes the agent read-only in production
  // and read-write locally — adjust to taste.
  tools: {
    list_directory: true,
    read_file: true,
    write_file: "approval",
    delete_file: "approval",
    delete_directory: "approval",
    send_email: "approval",
    browser_open: true,
    byEnvironment: {
      production: {
        write_file: false,
        delete_file: false,
        delete_directory: false,
      },
      development: {
        write_file: true,
      },
    },
  },
};
