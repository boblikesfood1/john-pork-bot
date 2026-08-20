/*
 * RONNIE'S BRAIN
 *
 * No AI.
 * No OpenAI.
 * No Claude.
 * No Gemini.
 *
 * Ronnie analyzes messages locally using:
 * - phrase matching
 * - intent scoring
 * - sentiment
 * - conversation context
 * - response history
 * - randomized personality
 *
 * He is, by design, an asshole.
 */

const MAX_DAILY_RESPONSES = 75;
const NORMAL_RESPONSE_CHANCE = 0.08;
const INTERESTING_RESPONSE_CHANCE = 0.35;

const dailyResponses = new Set();
let dailyDate = getToday();

const conversationState = new Map();

/* =========================================================
   BASIC UTILITIES
========================================================= */

function getToday() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function resetDailyMemoryIfNeeded() {
  const today = getToday();

  if (today !== dailyDate) {
    dailyDate = today;
    dailyResponses.clear();
  }
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s$!?'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function random(array) {
  if (!array || array.length === 0) {
    return null;
  }

  return array[Math.floor(Math.random() * array.length)];
}

function containsAny(text, words) {
  return words.some(word => text.includes(word));
}

function countMatches(text, words) {
  return words.reduce(
    (count, word) => count + (text.includes(word) ? 1 : 0),
    0
  );
}

/* =========================================================
   SENTIMENT
========================================================= */

const positiveWords = [
  "great",
  "good",
  "awesome",
  "amazing",
  "perfect",
  "love",
  "nice",
  "excellent",
  "won",
  "winning",
  "paid",
  "payment",
  "finished",
  "done",
  "approved"
];

const negativeWords = [
  "bad",
  "terrible",
  "awful",
  "hate",
  "annoying",
  "stupid",
  "fuck",
  "fucked",
  "shit",
  "broken",
  "wrong",
  "late",
  "overdue",
  "failed",
  "failure",
  "problem",
  "issue",
  "angry",
  "pissed",
  "tired",
  "exhausted"
];

function analyzeSentiment(text) {
  const positive = countMatches(text, positiveWords);
  const negative = countMatches(text, negativeWords);

  if (negative > positive + 1) {
    return "negative";
  }

  if (positive > negative + 1) {
    return "positive";
  }

  return "neutral";
}

/* =========================================================
   INTENTS / SITUATIONS
========================================================= */

const situations = [

  {
    name: "mistake",
    words: [
      "mistake",
      "messed up",
      "screwed up",
      "screwed",
      "fuck up",
      "fucked up",
      "fucked",
      "wrong file",
      "wrong folder",
      "wrong export",
      "deleted",
      "forgot",
      "forgotten",
      "accidentally",
      "my fault",
      "our fault"
    ],
    weight: 10
  },

  {
    name: "client",
    words: [
      "client",
      "customer",
      "client wants",
      "client asked",
      "client said",
      "client wants us",
      "client requested",
      "client email",
      "client call",
      "client feedback"
    ],
    weight: 8
  },

  {
    name: "revision",
    words: [
      "revision",
      "revisions",
      "revise",
      "change",
      "changes",
      "feedback",
      "notes",
      "another version",
      "new version",
      "one more change",
      "tiny change",
      "small change"
    ],
    weight: 8
  },

  {
    name: "deadline",
    words: [
      "deadline",
      "due",
      "due today",
      "due tomorrow",
      "due friday",
      "late",
      "behind",
      "rush",
      "rushed",
      "extension",
      "pushed back",
      "push the deadline",
      "deadline moved"
    ],
    weight: 8
  },

  {
    name: "money",
    words: [
      "invoice",
      "payment",
      "paid",
      "unpaid",
      "overdue",
      "money",
      "quickbooks",
      "square",
      "ach",
      "check",
      "deposit",
      "balance",
      "billing"
    ],
    weight: 9
  },

  {
    name: "editing",
    words: [
      "edit",
      "editing",
      "editor",
      "rough cut",
      "fine cut",
      "timeline",
      "premiere",
      "after effects",
      "export",
      "render",
      "media encoder",
      "proxy",
      "codec",
      "sequence"
    ],
    weight: 7
  },

  {
    name: "technical",
    words: [
      "server",
      "railway",
      "github",
      "code",
      "coding",
      "bug",
      "error",
      "crash",
      "broken",
      "not working",
      "doesn't work",
      "won't work",
      "failed",
      "failure",
      "password",
      "login",
      "upload",
      "download"
    ],
    weight: 7
  },

  {
    name: "meeting",
    words: [
      "meeting",
      "zoom",
      "call",
      "google meet",
      "calendar",
      "calendar invite",
      "conference",
      "standup"
    ],
    weight: 5
  },

  {
    name: "tired",
    words: [
      "tired",
      "exhausted",
      "sleepy",
      "no sleep",
      "didn't sleep",
      "can't sleep",
      "coffee",
      "caffeine",
      "long day",
      "burned out"
    ],
    weight: 5
  },

  {
    name: "success",
    words: [
      "won",
      "winning",
      "got it",
      "approved",
      "approved it",
      "signed",
      "paid",
      "finished",
      "completed",
      "done",
      "booked",
      "landed",
      "got the job"
    ],
    weight: 5
  },

  {
    name: "question",
    words: [
      "?",
      "how do",
      "what is",
      "what's",
      "why",
      "when",
      "where",
      "who",
      "can we",
      "should we",
      "does anyone"
    ],
    weight: 4
  },

  {
    name: "confusion",
    words: [
      "confused",
      "don't understand",
      "doesn't make sense",
      "what the hell",
      "what is happening",
      "what happened",
      "why is",
      "how is"
    ],
    weight: 6
  },

  {
    name: "drama",
    words: [
      "drama",
      "fight",
      "arguing",
      "argument",
      "beef",
      "mad",
      "pissed",
      "angry",
      "annoyed",
      "bullshit",
      "ridiculous"
    ],
    weight: 9
  },

  {
    name: "boredom",
    words: [
      "boring",
      "bored",
      "nothing to do",
      "slow day",
      "dead today",
      "quiet today"
    ],
    weight: 4
  }
];

/* =========================================================
   RESPONSE BANKS
========================================================= */

const responses = {

  mistake: [
    "Outstanding. You somehow found a brand new way to fuck that up.",
    "Beautiful. We were dangerously low on problems anyway.",
    "You had one job and apparently decided that was too easy.",
    "Excellent work. Truly. I'm impressed by the commitment to making things harder.",
    "That's not a mistake. That's a creative decision nobody fucking asked for.",
    "I would ask what you were thinking, but I'm afraid the answer would depress me.",
    "Amazing. Somehow the situation is now worse. Impressive.",
    "Don't fix it yet. I want to see how much worse this can get.",
    "I leave you people alone for five minutes.",
    "Congratulations. You've created tomorrow's problem today.",
    "This is why I have trust issues.",
    "I'm not mad. I'm just deeply disappointed in your entire bloodline.",
    "Somewhere, a QA engineer just felt a disturbance in the force.",
    "You know what? Fuck it. Let's call it a feature."
  ],

  client: [
    "Ah yes, the client. Nature's most efficient generator of unnecessary work.",
    "What does the client want now? A miracle by 4 PM?",
    "The client has spoken. Everyone prepare for another completely reasonable request that will somehow take six hours.",
    "Oh good. Client feedback. My favorite form of psychological warfare.",
    "I love when clients say 'one tiny change.' That's always followed by a fucking novel.",
    "The client wants something? Shocking. I was worried we were going to finish.",
    "Excellent. Another client request. Because apparently we're not busy enough.",
    "Please tell me the client at least knows what they want this time.",
    "The client has entered the chat. Hide the fucking timeline.",
    "Ah, the customer has blessed us with another opportunity to suffer."
  ],

  revision: [
    "Another revision? Of course. Why would version 14 possibly be enough?",
    "One more change. Famous last fucking words.",
    "At this point we're not revising it. We're raising it.",
    "Sure. Let's make another version. Maybe this one will finally be the 'final final.'",
    "Version 17. Nature is healing.",
    "Nothing says 'creative process' like changing the same thing 19 fucking times.",
    "Go ahead. Change it again. I'm sure this time everyone will magically agree.",
    "The final-final-v2-revised-actually-final has arrived.",
    "We're one revision away from simply making a different video."
  ],

  deadline: [
    "Ah yes, another deadline. Because apparently calendars are merely decorative.",
    "We're behind? Shocking. Truly nobody could have predicted this except literally everyone.",
    "Cool. A deadline. Let me pretend that means something.",
    "Just move the deadline again. I'm sure reality will eventually cooperate.",
    "Nothing says 'well-managed project' like discovering the deadline exists at the last possible second.",
    "Excellent. A rush job. My favorite way to manufacture unnecessary stress.",
    "The deadline is approaching. Everyone panic professionally.",
    "We've got plenty of time if you completely ignore how time works.",
    "Fantastic. Another deadline designed to ruin everyone's afternoon."
  ],

  money: [
    "FINALLY. A conversation about something that actually fucking matters.",
    "Ah, money. My favorite department.",
    "Nothing makes people move faster than the possibility of not getting paid.",
    "The invoice has entered its natural habitat: being ignored.",
    "If it's overdue, congratulations. You've unlocked the Deluxe Media side quest.",
    "Please tell me we're talking about actual money and not another fucking budget spreadsheet.",
    "Getting paid? Holy shit. Mark the calendar.",
    "Money talk. Now we're speaking my language.",
    "I support this conversation because unlike meetings, money has a measurable purpose."
  ],

  editing: [
    "Ah yes, editing. Staring at a timeline until the problem becomes someone else's problem.",
    "Another export? Great. Let's see whether the computer respects us today.",
    "Premiere is behaving? Don't say that too loudly. You'll fucking jinx it.",
    "Nothing like six hours of editing followed by an export that dies at 99%.",
    "The timeline has spoken, and apparently it hates you.",
    "Editing: where Ctrl+Z is basically a religious practice.",
    "Another day, another editor questioning every life decision they've ever made.",
    "If the export works on the first try, something is probably wrong."
  ],

  technical: [
    "Ah, technology. Our greatest achievement and most consistent fucking enemy.",
    "Have you tried turning it off and pretending the problem never happened?",
    "Excellent. A technical problem. Exactly what this day needed.",
    "Nothing like debugging someone else's code to really test your will to live.",
    "The computer has decided it doesn't respect you anymore.",
    "This sounds like a problem for someone who knows what they're doing.",
    "Congratulations. You've discovered a bug. Please enjoy your new roommate.",
    "I would help, but watching you struggle is currently more entertaining."
  ],

  meeting: [
    "Another meeting. Incredible. We really needed to discuss the thing instead of just doing the thing.",
    "Sure, let's schedule a meeting about scheduling the meeting.",
    "Nothing gets work done quite like talking about doing work.",
    "I'll pencil in 'absolutely no reason for this meeting' on the calendar.",
    "A meeting? Fantastic. I was worried we'd accomplish something today.",
    "How many people are attending this meeting who could have been an email?",
    "Please tell me this meeting has an agenda. I'm begging you."
  ],

  tired: [
    "Drink coffee and pretend this is a sustainable lifestyle.",
    "Sleep is temporary. Questionable production decisions are forever.",
    "You need coffee, not another Slack message.",
    "Excellent. We're all operating at the same professional level: barely conscious.",
    "Get some sleep before you accidentally delete something important.",
    "The human body was not designed for this bullshit.",
    "Coffee first. Existential crisis second."
  ],

  success: [
    "Holy shit. Something actually worked.",
    "Congratulations. You managed to do the thing.",
    "Wow. Competence. Somebody alert the shareholders.",
    "Don't get cocky. This could still go horribly wrong.",
    "Look at us. Occasionally functional.",
    "I hate to admit it, but that was actually pretty fucking good.",
    "Write this date down. We may never see another success like this.",
    "Excellent. One less disaster for me to complain about."
  ],

  question: [
    "That's a bold question for someone who could probably find the answer in thirty seconds.",
    "I could answer that, but I'm curious how long you'll stare at it first.",
    "What an absolutely adorable question.",
    "You really just put that question into Slack with confidence, huh?",
    "I have an answer, but I'm going to make you suffer for another thirty seconds.",
    "Excellent question. Unfortunately, I'm still judging you for asking it.",
    "Google is free, but apparently so am I."
  ],

  confusion: [
    "Good. We're all confused. Excellent teamwork.",
    "I love when nobody knows what's happening. Really inspires confidence.",
    "Fantastic. We have reached the 'what the fuck is going on' phase.",
    "Don't worry. I'm sure someone will understand this eventually.",
    "The fact that you're confused does not inspire confidence in the rest of us.",
    "Excellent question. Unfortunately, I have absolutely no fucking idea either."
  ],

  drama: [
    "Oh good. Drama. Finally, something I'm qualified for.",
    "Please continue. This is significantly more entertaining than actual work.",
    "I knew Slack would eventually become a reality show.",
    "Don't stop now. I want the full fucking story.",
    "This is why I keep notifications on.",
    "Excellent. Workplace drama. My favorite unpaid entertainment.",
    "Someone get popcorn. I'm invested now."
  ],

  boredom: [
    "You're bored? Create a problem. That's how we usually solve that.",
    "Nothing to do? Give it ten minutes. Someone will fuck something up.",
    "Enjoy the peace while it lasts.",
    "Don't worry. The next disaster is probably already loading.",
    "Boredom is just the calm before someone sends 'quick question.'"
  ],

  generic: [
    "I read that. Unfortunately.",
    "Fascinating. I have absolutely no idea why you thought I needed to know that.",
    "Bold statement from someone using Slack during work hours.",
    "Okay. And what exactly am I supposed to do with that information?",
    "I could respond intelligently, but that seems like a lot of effort.",
    "You people really do just type whatever comes into your head.",
    "Noted. Deeply unfortunate, but noted.",
    "This is why we can't have nice things.",
    "I leave you alone for five minutes and this is what happens.",
    "I'm going to pretend I didn't read that.",
    "Fantastic. Another development nobody asked for.",
    "Jesus Christ.",
    "That's certainly one way to do it.",
    "I hate that this makes sense.",
    "You know what? Sure. Fuck it.",
    "I don't know what I expected, but somehow this is worse.",
    "I'm choosing not to unpack whatever the fuck that was."
  ]
};

/* =========================================================
   FIND THE SITUATION
========================================================= */

function determineSituation(text, recentMessages) {
  const scores = [];

  for (const situation of situations) {
    const matches = countMatches(text, situation.words);

    if (matches > 0) {
      scores.push({
        name: situation.name,
        score: matches * situation.weight
      });
    }
  }

  /*
   * Context bonus.
   *
   * If the previous few messages were also about the same thing,
   * Ronnie becomes more likely to understand the conversation as
   * one continuous event.
   */
  const recentText = normalize(
    recentMessages
      .slice(-8)
      .map(message => message.text)
      .join(" ")
  );

  for (const result of scores) {
    const situation = situations.find(
      s => s.name === result.name
    );

    if (
      situation &&
      countMatches(recentText, situation.words) > 0
    ) {
      result.score += 3;
    }
  }

  scores.sort((a, b) => b.score - a.score);

  return scores.length ? scores[0].name : "generic";
}

/* =========================================================
   RESPONSE MEMORY
========================================================= */

function rememberResponse(response) {
  resetDailyMemoryIfNeeded();

  dailyResponses.add(response);
}

function getUnusedResponses(category) {
  resetDailyMemoryIfNeeded();

  const bank = responses[category] || responses.generic;

  return bank.filter(response => !dailyResponses.has(response));
}

function chooseFreshResponse(category) {
  let available = getUnusedResponses(category);

  /*
   * If Ronnie has used every response in this category today,
   * pull from ANY unused category before repeating anything.
   */
  if (available.length === 0) {
    const allUnused = Object.values(responses)
      .flat()
      .filter(response => !dailyResponses.has(response));

    available = allUnused;
  }

  /*
   * If Ronnie somehow used every single response in the entire
   * library, reset the response library. This is very unlikely
   * with a large response bank.
   */
  if (available.length === 0) {
    dailyResponses.clear();
    available = responses[category] || responses.generic;
  }

  return random(available);
}

/* =========================================================
   RESPONSE DECISION
========================================================= */

function shouldRonnieReply(text, mentioned, recentMessages = []) {
  resetDailyMemoryIfNeeded();

  if (!text || text.trim().length < 2) {
    return false;
  }

  /*
   * Directly summoned Ronnie?
   * He ALWAYS answers.
   */
  if (mentioned) {
    return true;
  }

  /*
   * Don't let him talk endlessly.
   */
  const stats = getDailyStats();

  if (stats.responses >= MAX_DAILY_RESPONSES) {
    return false;
  }

  const normalized = normalize(text);

  const situation = determineSituation(
    normalized,
    recentMessages
  );

  /*
   * Generic conversation gets a low chance.
   */
  if (situation === "generic") {
    return Math.random() < NORMAL_RESPONSE_CHANCE;
  }

  /*
   * Interesting situations get a higher chance.
   */
  return Math.random() < INTERESTING_RESPONSE_CHANCE;
}

/* =========================================================
   PERSONALITY MODIFIERS
========================================================= */

function addPersonality(response, text, situation, mentioned) {
  let result = response;

  const normalized = normalize(text);

  /*
   * Occasionally make direct mentions more dramatic.
   */
  if (mentioned && Math.random() < 0.20) {
    const openings = [
      "Oh, you summoned me?",
      "You wanted my opinion?",
      "You really tagged me for this?",
      "Oh for fuck's sake.",
      "Fine. I'm listening.",
      "I'm here. Unfortunately."
    ];

    result = `${random(openings)} ${result}`;
  }

  /*
   * Occasionally add a very short punchline.
   */
  if (
    !mentioned &&
    Math.random() < 0.12 &&
    situation !== "success"
  ) {
    const endings = [
      " Good luck with that.",
      " I'm sure that'll go well.",
      " What could possibly go wrong?",
      " Anyway, carry on.",
      " God help us.",
      " I'm going back to pretending I don't work here."
    ];

    result += random(endings);
  }

  /*
   * If someone is already swearing, Ronnie can match the energy.
   */
  if (
    containsAny(normalized, [
      "fuck",
      "fucked",
      "shit",
      "bullshit"
    ]) &&
    Math.random() < 0.25
  ) {
    const additions = [
      " And yes, I'm also concerned about the sheer amount of bullshit involved.",
      " So we're all in agreement that this is fucked.",
      " Beautiful. Absolute fucking chaos.",
      " Honestly, fair."
    ];

    result += random(additions);
  }

  return result;
}

/* =========================================================
   MAIN RESPONSE BUILDER
========================================================= */

function buildRonnieReply(
  text,
  recentMessages = [],
  mentioned = false
) {
  resetDailyMemoryIfNeeded();

  const normalized = normalize(text);

  if (!normalized) {
    return "You tagged me and then gave me nothing to work with. Incredible.";
  }

  const situation = determineSituation(
    normalized,
    recentMessages
  );

  let response = chooseFreshResponse(situation);

  if (!response) {
    response = chooseFreshResponse("generic");
  }

  return addPersonality(
    response,
    text,
    situation,
    mentioned
  );
}

/* =========================================================
   STATS
========================================================= */

function getDailyStats() {
  resetDailyMemoryIfNeeded();

  return {
    date: dailyDate,
    responses: dailyResponses.size
  };
}

module.exports = {
  shouldRonnieReply,
  buildRonnieReply,
  rememberResponse,
  getDailyStats
};
