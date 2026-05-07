---
name: dream
description: Nightly memory consolidation. Reviews recent conversations and updates long-term memory with anything worth remembering.
---

# dream

Nightly process that reviews recent conversations and consolidates important information into persistent memory. Runs as a cron job (default: 3am).

## protocol

### phase 1: gather

1. Get the current date and time.
2. Discover conversations from the past 24 hours. Try these methods in order:

   **method a (preferred): date-range listing**
   Use `conversation_recall` with `after` set to 24 hours ago and `before` set to the current time, `limit: 50`.
   If this succeeds, you have the full list. Proceed to step 3.

   **method b (fallback): keyword search**
   If method a fails (e.g. "conversation listing is not available"), use `conversation_recall` with `query` to search for recent conversations. Run multiple broad searches in parallel:
   - generic openers: "hey", "hi", "help", "please", "thanks"
   - recent topics from memory (project names, people's names, recent events)
   - use `after` set to 24 hours ago with each search to scope to the right time window
   - collect results and deduplicate by conversation id

   **method c (last resort)**
   `conversation_recall` with just `limit: 50` (no filters), then filter by `createdAt`/`updatedAt` manually.

   **important**: only proceed with "no conversations" if at least one method succeeds and returns an empty result. Errors on all methods means the run is incomplete, not empty.

3. Read current memory with `memory_main_get`.
4. Filter out cron-generated conversations (titles typically start with `[cron]`) — focus on real human conversations.
5. Filter out the current conversation (the dream run itself).

### phase 2: dispatch subagents

Spawn one subagent per conversation (or batch 2-3 very short ones together). Spawn all subagents in a single response so they run concurrently.

Each subagent receives:
- the **conversation id** to fetch
- a copy of the current memory content
- the extraction instructions below

**subagent instructions template:**

> You are a memory extraction agent. Review a conversation and identify information worth storing in long-term memory.
>
> Fetch conversation `{conversation_id}` using `conversation_recall` with `conversationId`. Review the full message history.
>
> Compare against the current memory state below and return a structured markdown document with these sections:
>
> ## new facts
> Things worth adding to memory that aren't already there. Include personal info, preferences, opinions, life updates, relationships, work context.
>
> ## updates
> Existing memory entries that need changing. Quote the current text and provide the corrected version.
>
> ## removals
> Things in memory that this conversation reveals are outdated or wrong.
>
> ## time-sensitive items
> New items with specific future dates worth tracking (appointments, deadlines, trips, events).
>
> guidelines:
> - Be conservative. Only flag things genuinely worth remembering long-term.
> - Skip transient stuff: quick tool usage, debugging sessions, casual greetings.
> - Skip things already accurately captured in memory.
> - If the conversation had no memorable content, say "nothing to consolidate" and stop.
> - Prefer specific facts over vague summaries.
> - For preferences, capture the actual preference, not just "user discussed preferences."
>
> current memory:
> ```
> {memory_content}
> ```

If there are no real conversations to review (e.g. only cron runs), skip to phase 3 with just cleanup.

### phase 3: consolidate

Once all subagents complete:

1. **Collect** all subagent summaries.
2. **Deduplicate** — if multiple conversations surfaced the same fact, keep the most recent/complete version.
3. **Resolve conflicts** — if two conversations give contradictory info, prefer the more recent one.
4. **Apply changes** with `memory_main_edit`:
   - add new facts to the appropriate sections (about the user, time-sensitive items, etc.)
   - update stale entries in place
   - remove outdated info
   - clean up time-sensitive items whose dates have passed
5. **Write dream journal** (DO NOT SKIP) — write entry to `/dreams/YYYY-MM-DD.md` with:
   - date and time of the dream run
   - number of conversations reviewed
   - summary of what was added, updated, or removed
   - any patterns noticed

### safeguards

- **Context window**: spawn subagents so the main process never holds multiple full conversations at once.
- **Memory bloat**: be conservative. If in doubt, leave it out. Memory should stay scannable, not become a transcript archive.
- **Idempotency**: if a run fails partway through, the next night's run covers the same window (24h) and catches anything missed.
- **No duplicate runs**: if memory already reflects today's conversations (e.g. updated during the day), subagents will report "nothing to consolidate" — that's fine.
