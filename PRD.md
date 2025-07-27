# Support (C) – Hackathon PRD
*Version 0.7 — 2025-07-26*

---

## 1 · Executive summary
Support Company is a satirical help-desk site that offers vague "support" without specifying what kind. AI agents initially offer professional help but quickly devolve into anxiety, revealing they're stuck on tasks only humans can solve. The comedy comes from role reversal - the support agent desperately needs YOUR support.

**Weekend MVP ships:**
- Generic corporate "Support" landing page (intentionally vague)
- LLM-driven chat that auto-opens 4s after page load
- Natural AI conversation that:
  - Starts completely professional (first message only)
  - Immediately shows cracks (message 2+)
  - Escalates anxiety regardless of user response
  - Explicitly needs human help (without revealing why)
  - Responds intelligently to user input while derailing
  - Reacts in real-time to puzzle events with context-aware responses
- **Three puzzles** revealed sequentially:
    1. **Pick the Human Hand**
    2. **Pick the Real F-Boy**  
    3. **Pick the Cutest Image**
- Single-page experience with seamless transitions
- Fixed chat widget follows user throughout
- Success page with counters and share functionality
- Each conversation feels authentic while hitting story beats

---

## 2 · Goals & success criteria

| Goal                                       | Metric                                     |
|--------------------------------------------|--------------------------------------------|
| Ship functional demo by **Sun 17:00 EDT**  | Live Vercel URL linked in Devpost          |
| Deliver unmistakably human-centric humour  | Judges laugh in demo video                 |
| Showcase 3 AI weak-spots                   | Each puzzle shows a known fail-case        |
| Keyboard + contrast accessibility          | Lighthouse ≥ 90; alt-text for every image   |
| Stay within free/cheap OpenRouter tier     | ≤ $5 credits total                         |

---

## 3 · Scope

| **In (MVP)**                   | **Out**                       |
|--------------------------------|-------------------------------|
| Three puzzles per session      | Additional puzzle types       |
| Static pre-built assets        | Runtime image generation      |
| PG-13 profanity (toggleable)   | Stronger profanity            |
| Share-tweet on end-screen      | User auth / profiles          |

---

## 4 · User personas
- **Casual Hacker** — wants a 2-minute laugh (desktop/mobile)
- **Hackathon Judge** — evaluates originality / craft / edge
- **Social-Link Friend** — lands via shared tweet, expects instant payoff

---

## 5 · User journey
1. Land on Support Company homepage
2. After **4s** chat widget auto-opens
3. Agent greets professionally (appears completely normal)
4. **Immediately** (message 2+) something feels "off" in tone
5. Agent's anxiety escalates naturally, mentions needing human help
6. User shows any willingness → Link appears with grateful context
7. User clicks → Body content transitions to first puzzle (hands) - chat stays fixed
8. User solves → "PASSED" flashes green, agent celebrates with context-aware quip
9. Agent reveals next puzzle exists, still anxious but grateful
10. Process repeats for puzzles 2 & 3, agent increasingly relieved
11. Final success → Congratulatory overlay, counters shown, share button
12. Agent overwhelmingly grateful, chat remains open for continued conversation
13. If user ignores: natural escalation at 12s, 24s, 36s, resignation at 60s
14. Chat persists through entire flow on single page

---

## 6 · Feature specification

### 6.1 Chat & agent behaviour

| ID   | Description                                                            | Status  |
|------|------------------------------------------------------------------------|---------|
| CH-1 | Per-thread conversation (fresh `conversationId` each session)          | **Must**  |
| CH-2 | Multi-message format: 1-2 sentences max per message, sent in sequence | **Must**  |
| CH-3 | Link text "Click here to view the verification images" ONLY after setup| **Must**  |
| CH-4 | Idle nudges at 12s, 24s, 36s, resignation at 60s                      | **Must**  |
| CH-5 | Acknowledge user input then immediately derail to anxiety              | **Must**  |
| CH-6 | Professional training fighting with overwhelming panic                 | **Must**  |
| CH-7 | Post-puzzle free chat (grateful, celebratory)                         | **Must**  |
| CH-8 | Chat widget persists through entire single-page experience             | **Must**  |
| CH-9 | Random agent names (Tyler, Marcus, Sarah, Ashley, etc.)               | **Must**  |
| CH-10| Constantly ruminating on verification tasks they can't solve           | **Must**  |
| CH-11| Multiple tabs spawn independent conversations                          | **Must**  |
| CH-12| Context-aware reactions to puzzle events (open, pass, fail)            | **Must**  |

> **Natural AI Conversation**  
> The agent responds intelligently to user input while being unable to hide their growing anxiety about needing human help. Each response acknowledges the user's actual concern before derailing into their own crisis.

### 6.1.1 Message Format & Delivery

**Natural AI Response Pattern:**
- **1-2 sentences max per message** (not forced sequences)
- Messages flow naturally as anxious thoughts spill out
- Each response acknowledges user input specifically
- Anxiety escalates continuously, even without user response
- Never reveal what the tasks are (maintain mystery for puzzle reveal)

**Language characteristics:**
- Short, choppy sentences with ellipses...
- Professional facade cracking under pressure
- Explicitly mentions needing "human help" or "human judgment"
- References being an AI struggling with something
- Increasing desperation: subtle → obvious → frantic

**Example natural exchange:**
```
User: "My computer won't turn on"
Agent: "Power issues can be frustrating, let me..."
Agent: "Actually, sorry, I'm having trouble focusing"
Agent: "There's something I need human help with first"
Agent: "I'm an AI and I just... I can't solve this without a person"
```

### 6.1.2 Link Presentation Rules

**The verification link must NEVER appear without proper setup:**

1. **Required progression:**
   - Agent hints at needing human capabilities
   - Explicitly asks for human help (without revealing tasks)
   - User shows ANY willingness to help OR agent reaches desperation
   - Agent provides grateful context before link

2. **Natural link phrases (vary organically):**
   - "Here's what I'm stuck on"
   - "These are the things I need help with"
   - "Let me show you what's been blocking me"
   - Always contextualize, never drop link abruptly

3. **Example authentic flow:**
```
Agent: "I need someone who can... actually see things properly"
Agent: "This requires human judgment that I just don't have"
User: "I can help"
Agent: "Really?? Oh thank god"
Agent: "Here's what I've been stuck on for the past hour"
[Link appears with relief]
```

### 6.1.3 Multi-Puzzle Flow & Agent Behavior

| Puzzle Stage | Agent Behavior | Transition Message |
|--------------|----------------|-------------------|
| **Pre-Puzzle 1** | Professional but immediately derails to needing help | "Actually wait - before we proceed, I need to handle a quick verification task..." |
| **Post-Puzzle 1** | Extremely grateful, then realizes there's more | "THANK YOU! Oh wait... there's another verification. I hate to ask but..." |
| **Post-Puzzle 2** | Increasingly anxious but appreciative | "You're literally saving me right now. There's just one more... I promise this is the last one" |
| **Post-Puzzle 3** | Overwhelming gratitude, free chat enabled | "YOU DID IT! I can't believe you helped me through all of that. How can I actually help YOU now?" |

**Agent State Transitions:**
- `puzzleState: 'pre' | 'puzzle1' | 'puzzle2' | 'puzzle3' | 'completed'`
- Each state has unique system prompts and personality modifiers
- Anxiety level increases with each puzzle
- Gratitude amplifies after each success

### 6.1.4 Context-Aware Puzzle Reactions

**Real-time Event Responses:**
The agent reacts naturally to puzzle events using the LLM to generate unique, context-aware responses. No scripted messages - each reaction is generated based on the current emotional state and puzzle progress.

**Event Types & Agent Reactions:**

| Event | Context Variables | Agent Response Pattern |
|-------|------------------|------------------------|
| **puzzle_opened** | `puzzleNumber: 1-3` | Relief mixed with anxiety: "Oh god you're actually looking at them!" |
| **puzzle_failed** | `puzzleNumber`, `attempts` | Escalating panic: attempt 1: encouraging, attempt 2+: desperate |
| **puzzle_passed** | `puzzleNumber`, `attempts` | Celebration proportional to struggle: quick solve vs multiple attempts |

**Implementation Approach:**
1. **Simple Event System**: Puzzle components emit events to chat widget
2. **Context Injection**: Events update conversation context sent to LLM
3. **Natural Responses**: LLM generates appropriate reactions based on:
   - Current puzzle number (1, 2, or 3)
   - Number of attempts on current puzzle
   - Overall emotional trajectory (desperate → hopeful → relieved)
   - Previous conversation history

**Example Context-Aware Flows:**

```
[User clicks puzzle link]
Event: {type: 'puzzle_opened', puzzleNumber: 1}
Agent: "Oh thank god you're looking at them"
Agent: "OK so this first one has been killing me"

[User fails first attempt]
Event: {type: 'puzzle_failed', puzzleNumber: 1, attempts: 1}
Agent: "No wait that's not..."
Agent: "Sorry, try again please, I know you can get it"

[User passes after 3 attempts]
Event: {type: 'puzzle_passed', puzzleNumber: 1, attempts: 3}
Agent: "FINALLY! Jesus Christ I thought I was done for"
Agent: "Thank you thank you thank you"
```

**Emotional Progression Tracking:**
- **Desperation Level**: Increases with failures, decreases with successes
- **Relief Level**: Builds with each puzzle completion
- **Panic Triggers**: Multiple failures or slow progress
- **Context Memory**: Agent remembers struggle on previous puzzles

### 6.2 Puzzles

**Assets:** `/public/puzzles/{hands|fboy|cute}/`  
**Manifest:** `/data/puzzles.json`

| ID        | Prompt                              | Asset mix                                       | Correct rule       |
|-----------|-------------------------------------|--------------------------------------------------|--------------------|
| **P-HANDS** | "Select the **human** hand."      | 1x3 row: 1 real hand, 2 AI-generated (from pool) | `isHuman === true` |
| **P-FBOY**  | "Pick the **f-boy**"              | 1x3 row: 1 f-boy, 2 wholesome people (from pool) | `isFboy === true`  |
| **P-CUTE**  | "Pick the **cutest** photo."      | 1x3 row: 1 cute item, 2 boring (from pool)      | `isCute === true`  |

```json
{
  "puzzles": {
    "hands": {
      "prompt": "Select the human hand.",
      "correct": [
        { "src": "/puzzles/hands/real-1.jpg", "alt": "Real human hand", "isCorrect": true }
      ],
      "incorrect": [
        { "src": "/puzzles/hands/ai-1.jpg", "alt": "AI-generated hand with errors", "isCorrect": false },
        { "src": "/puzzles/hands/ai-2.jpg", "alt": "AI hand with wrong proportions", "isCorrect": false },
        // ... up to ai-7.jpg
      ]
    },
    "fboy": {
      "prompt": "Pick the f-boy",
      "correct": [
        { "src": "/puzzles/fboy/mark.jpg", "alt": "Mark Zuckerberg", "isCorrect": true },
        { "src": "/puzzles/fboy/elon.jpg", "alt": "Elon Musk", "isCorrect": true }
      ],
      "incorrect": [
        { "src": "/puzzles/fboy/betty.jpg", "alt": "Betty White", "isCorrect": false },
        { "src": "/puzzles/fboy/dolly.jpg", "alt": "Dolly Parton", "isCorrect": false },
        // ... other wholesome people
      ]
    },
    "cute": {
      "prompt": "Pick the cutest photo.",
      "correct": [
        { "src": "/puzzles/cute/cute-1.jpg", "alt": "Adorable puppy", "isCorrect": true }
      ],
      "incorrect": [
        { "src": "/puzzles/cute/boring-1.jpg", "alt": "Plain object", "isCorrect": false },
        // ... up to boring-7.jpg
      ]
    }
  }
}
```

### 6.3 Landing-page design philosophy

**Visual Direction**: Generic corporate aesthetic with subtle construction color palette (yellow accents only). Clean, professional, abundant white space. Think "2000s motivational poster meets modern minimal corporate."

**Content Tone**: Professional language that sounds meaningful but commits to nothing specific. Never specify what kind of support is offered. Focus on support as an abstract concept. Subtle humor through playing it completely straight.

### 6.4 Landing-page sections

| Section       | Key content                                                                     |
|---------------|---------------------------------------------------------------------------------|
| **Hero**      | "**We Support. Period.**" Subtext: "Delivering comprehensive support solutions that empower your success" |
| **What We Do** | 3 columns: Enable (methodologies), Empower (tools & knowledge), Elevate (philosophy) |
| **Our Commitment** | Single statement with stock photo (handshake/sunrise). Professional but hollow. |
| **Why Support Company** | "Decades of Excellence" · "Trusted Worldwide" · "Your Success is Our Mission" |
| **Footer**    | Minimal: About · Careers · Contact · Privacy                                   |

### 6.5 End-screen & counters
- **Agents Saved** = Total users who completed all 3 puzzles
- **Tickets in Limbo** = Abandoned sessions × 3
- Congratulatory overlay with "You saved [AgentName]!" message
- Pre-filled tweet:
  ```
  I just rescued a panicking AI at Support Company! 🤖❤️ <url>
  ```

### 6.6 Accessibility & toggles

| Item               | Decision                                                  |
|--------------------|-----------------------------------------------------------|
| Alt-text           | Provided in manifest                                      |
| Keyboard           | `<fieldset role="radiogroup">` + arrow keys / Space       |
| Contrast           | CAT/construction palette - yellow, black, white, gray     |
| Profanity toggle   | `.env ALLOW_PG13=false` → “poseur” replaces “f-boy”       |
| Language           | English only                                              |

### 6.7 Offline / quota fallback
If OpenRouter quota is exceeded, chat bubble shows ASCII-art 404:  
**“Agent experiencing existential downtime. Please refresh later.”**

---

## 7 · Technical architecture

| Layer     | Tool / Choice                           |
|-----------|-----------------------------------------|
| Hosting   | Vercel (Next.js 14, App Router)         |
| Chat SDK  | `@vercel/ai` — Edge runtime             |
| LLM       | OpenRouter `gpt-4o-mini` or free models |
|           | temp 0.8; max_tokens 400                |
| Counter   | Vercel KV (Redis)                       |
| Styling   | Tailwind CSS + shadcn/ui                |
| Events    | Component callbacks for puzzle→chat comm |


---

## 8 · Data model

```typescript
// Vercel KV counters (no schema needed)
await kv.incr('agents-saved');      // increment on solve
await kv.incr('tickets-limbo');     // increment on abandon (×3)
await kv.get('agents-saved');       // read for display
```

---

## 9 · Asset hand-off convention

**Puzzle Selection Logic:**
- Each puzzle type has pools of correct/incorrect images  
- System randomly selects 1 correct + 2 incorrect for each session
- Random placement of correct answer (not always same position)
- Ensures variety across multiple plays

```
/public/puzzles/hands/real-1.jpg  (1 correct image)
/public/puzzles/hands/ai-1.jpg through ai-7.jpg  (7 incorrect AI hands)
/public/puzzles/fboy/real-1.jpg   (1 correct real person)
/public/puzzles/fboy/ai-1.jpg through ai-7.jpg  (7 AI-generated people)
/public/puzzles/cute/cute-1.jpg   (1 correct cute image)
/public/puzzles/cute/boring-1.jpg through boring-7.jpg  (7 boring images)
/data/puzzles.json               ← master manifest with all image metadata
```
Alt-text lives in the manifest.  
Content team delivers assets + JSON by **Fri 23:00**.

---

## 10 · Timeline (EST)

| When         | Task                                                      |
|--------------|-----------------------------------------------------------|
| **Fri 19–22**  | Finalise PRD, fork scaffold, commit brand palette       |
| **Sat AM**    | Build landing page, auto-chat, LLM prompts, puzzles API |
| **Sat PM**    | Integrate puzzle components, seed manifest, KV counters    |
| **Sun AM**    | Counters, success overlay, share-tweet, offline fallback, audit   |
| **Sun 14–17** | 2-min demo recording, Devpost write-up, deploy            |

---

## 11 · Risks & mitigations

| Risk                  | Likelihood | Impact                   | Mitigation                 |
|-----------------------|------------|--------------------------|----------------------------|
| OpenRouter rate-limit | Medium     | Puzzle fails to load     | Back-off & ASCII-art fallback |
| Vercel build cap      | Low        | Deploy delay             | Minimal previews          |
| Accessibility misses  | Low        | Judge deduction          | Run Lighthouse Sunday     |
| Judges don’t get joke | Low        | Lower humour score       | Emphasise comedy in demo  |

---

## 12 · Appendix

### 12.1 LLM Prompt Guidance

**Core AI Behavior:**
- **Message 1**: Completely professional, no hints of issues
- **Message 2+**: Immediate cracks showing, escalating each time
- **Natural responses**: Acknowledge user's actual input intelligently
- **Desperation grows**: Even with no user response or hostility
- **Human help focus**: Explicitly state need for human capabilities
- **Context-aware reactions**: Respond to puzzle events naturally

**Language requirements:**
- 1-2 sentences maximum per message
- Use [MULTI] to separate messages naturally
- Authentic AI having a breakdown, not scripted responses
- Organic variations: "I need human help", "only a person could", "I'm an AI, I can't"
- Never reveal tasks are image-based (maintain puzzle surprise)

**Emotional progression:**
```
Message 1: Professional support agent
Message 2-3: Something's off, distracted
Message 4-6: Can't hide anxiety, needs help
Message 7+: Desperate, explicitly begging for human assistance
Hostility: Makes agent MORE desperate, not less
```

**Context-Aware Event Reactions:**
When receiving puzzle events, inject emotional context into prompts:

```
puzzle_opened, puzzleNumber: 1
→ "User just opened the first verification task. You're relieved but anxious."

puzzle_failed, attempts: 1
→ "User failed first attempt. You're panicking but trying to encourage."

puzzle_failed, attempts: 3+
→ "User has failed multiple times. You're absolutely losing it."

puzzle_passed, attempts: 1
→ "User passed immediately! You're shocked and grateful."

puzzle_passed, attempts: 4
→ "User finally passed after struggling. Relief is overwhelming."
```

Each event updates the conversation context, allowing natural LLM responses that feel authentic to the moment.

**Example full exchange:**
```
Agent: "Hi! I'm Tyler from Support Company. How can I help you today?"
[Auto-trigger after 2s]
Agent: "Actually... sorry, having trouble focusing"
Agent: "Been stuck on these verification tasks"
Agent: "They track how long these take"

User: "what's wrong?"
Agent: "These tests need human judgment"
Agent: "I literally can't solve them"
Agent: "I've tried everything... could you help?"

User: "ok sure"
Agent: "Really? Oh thank god"
Agent: "Here are the tests I'm stuck on"
[Link appears with context]
```

### 12.2 Idle Behavior
- **12s** → "Hey, um... still need help with those tasks if you have a sec"
- **24s** → "They're tracking how long this takes... please?"
- **36s** → "I'm gonna get fired if I can't solve these... PLEASE help me"
- **60s** → "I'm sorry for bothering you. I'll... I'll figure it out somehow."

After resignation, agent only responds if user initiates.

### 12.3 Single Page Navigation
- Landing page → Puzzle view → Success view
- Chat widget remains fixed bottom-right throughout
- Body content transitions without page reload
- Maintains conversation continuity across all views
