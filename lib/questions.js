// Shared question bank — ported from the prototype. Server and client both
// import from here so the maker's and guesser's views always match.

const RAW=[
"Your alarm goes off. You...|Snooze exactly once|Snooze until it's a crisis|Wide awake, unfortunately|Never set one, chaos reigns",
"Your packing style, exposed|Done a week early, laminated list|The night before, in a panic|You've forgotten something essential, always|You pack in the car, on the way",
"Airport you at security|Shoes off before you're even asked|The one holding up the whole line|Somehow always randomly selected|Precheck, no notes",
"The move that actually gets you|A well-timed inside joke|Someone remembering the small stuff|Confidence without trying too hard|Genuine, undivided attention",
"Your dream trip nobody's invited to|Solo, no itinerary, total freedom|A group chaos adventure|Somewhere remote, off the grid|Honestly you'd bring everyone",
"Your phone hits 3% in public. You...|Full sprint to a charger|Airplane mode and vibe|Let it die, freedom|Panic like it's a hostage situation",
"Your fridge right now, honestly|Suspiciously well-stocked|Mostly condiments and regret|A science experiment in the back|You just went shopping, ask tomorrow",
"Pineapple on pizza, final answer|A hard yes|A hard no|Only when nobody's watching|Depends entirely on my mood",
"Your 'quick errand' actually takes...|Exactly as long as planned|Somehow always 2 hours|However long it takes to get distracted by snacks|You forget why you left the house",
"The apocalypse starts. Your first move?|Grab supplies, methodically|Panic, then figure it out|Find your people immediately|Somehow already had a plan",
"You win the lottery tonight. First call?|Family, obviously|Nobody, you disappear for a week|Your best friend, to scream together|A financial advisor, immediately",
"Biggest fear, honestly|Public speaking|Being irrelevant|Spiders, no negotiation|Silence in a group chat",
"Your search history would reveal...|Deeply weird 3am spirals|An unfinished DIY obsession|Way too many 'is it normal to' questions|Nothing, it's suspiciously clean",
"Your green flag, unfiltered|Makes you laugh, effortlessly|Actually listens when you talk|Has their life somewhat together|Isn't afraid to be a little weird",
"Fire alarm goes off at 3am. You...|Out the door in seconds|Check if it's real first|Grab your most random possession|Assume it's fine, go back to sleep",
"Your spice tolerance, honestly|You order mild and call it medium|One bite and you're crying|You can handle medium, barely|Bring it, no mercy, extra hot always",
"Your 'I'll do it later' pile is...|Nonexistent, you're a machine|A neat little stack|Hidden somewhere you've forgotten|A monument to procrastination",
"You just walked into a spiderweb. You...|Silent internal screaming|Full-body flail, no shame|Calmly walk it off|Blame whoever's closest",
"Your ringtone situation is...|Always on silent|A song that embarrasses you|Default, never touched it|Changes with your mood",
"First date, be honest|You overthink every text after|You're weirdly calm about it|You've already planned date two|You forget it's a date, it's just fun",
"Flight delayed 4 hours, you...|Find the nearest bar|Nap wherever you land|Rebook and cut your losses|Turn it into an adventure",
"When the WiFi goes out you...|Personal crisis|Read an actual book|Talk to the humans in the room|Restart the router six times anyway",
"Your browser has how many tabs open|A tidy handful|Genuinely too many to count|One, always one|However many it takes to crash",
"PDA comfort level|None, keep it private|Hand-holding, that's the ceiling|Comfortable with more|Fully unbothered, do what you want",
"Autocorrect has ruined a text how often|Constantly, it's a menace|Once, unforgettably|Never, you proofread like a lawyer|You've stopped trusting it entirely",
"Your relationship with mornings|Genuinely a morning person|A slow, caffeinated negotiation|Actively at war|Depends entirely on sleep debt",
"Your road trip role, unfiltered|The one who actually reads the map|DJ, and it's not up for debate|Backseat, fully checked out|The one narrating everything you pass",
"You're the villain in someone's story. Your crime?|Brutal honesty, no filter|Being 'too much'|Ghosting someone who deserved better|Being suspiciously unbothered by everything",
"Hotel or Airbnb, and why you're right|Hotel, room service or nothing|Airbnb, it has to feel like living there|Whatever's cheapest, you're not precious|Depends entirely on the trip",
"You missed your connection. You...|Immediate calm problem-solving|Mild internal meltdown|Blame the airline loudly|Somehow already booked a new one",
"3am snack of choice|Cold leftovers, no reheating|Cereal, dry, from the box|Whatever's within arm's reach|You don't snack at 3am, you sleep",
"Your love language, the real one|Words, say the thing out loud|Time, just be there|Touch, closeness says it all|Acts, show me, don't tell me",
"Your 'go-to' excuse to leave early|Early morning tomorrow|Just not feeling it|The classic fake phone call|You don't leave early, ever",
"A stranger holds the door too long. You...|Awkward jog-walk|Overly enthusiastic thank you|Pretend you meant to walk slow|Internally panic the whole way",
"Your desk or workspace right now|Weirdly immaculate|A crime scene|Somewhere in between|You don't have a fixed one",
"Your 'one more episode' record|Admirable restraint|Has ended actual friendships|You fall asleep first, always|Depends entirely on the show",
"Stuck in an elevator, you...|Stay eerily calm|Immediately start talking to strangers|Mentally start planning your will|Try to fix it yourself, badly",
"You accidentally text the wrong person. It was about...|Them, specifically|Someone else's business|A plan that was definitely a secret|Nothing bad, but you still panic",
"Your actual cooking skill level|Could open a restaurant|Reliable 5-dish rotation|Toast is a stretch|You've set off a smoke alarm, more than once",
"The last time you tried a weird food combo|Loved it, no regrets|Regretted it immediately|You're still thinking about it|You don't do weird combos, ever",
"You just tripped in public. You...|Play it off smooth|Announce 'I'm okay!' to no one|Full commit to the fall|Look around for who saw",
"The wifi's down during something important. You...|Handle it, no big deal|Full meltdown, in front of everyone|Somehow make it worse trying to fix it|Blame the router, personally",
"Your relationship with to-do lists|You've never made one|Exists only in your head|Written, then ignored|Color-coded and sacred",
"Your last 'that was a mistake' purchase|Something you don't use|An impulse snack binge|A subscription you forgot about|You don't regret purchases, only people",
"Your typing style|Fast and error-free|Fast and full of typos|Slow and deliberate|Voice-to-text, let's be honest",
"Your coffee order, specifically|Black, no apologies|Something with more syrup than coffee|Decaf and proud|You don't drink coffee, you're built different",
"You spot a typo in your own sent message. You...|Immediate correction text|Let it live, it's fine|Mild internal spiral|Delete and pretend it never happened",
"Your souvenir habit|A magnet, every single time|Something you'll regret packing|Photos only, you travel light|You buy for everyone but yourself",
"A slow-burn or love-at-first-sight person?|Slow burn, always|Instant, you just know|Skeptical of both, honestly|Depends on the person entirely",
"Jealousy, on a scale of never to constantly|Practically never|A little, I'm only human|I hide it well|I say it out loud immediately",
"Someone eats the last of your favorite snack|Mild betrayal, buy more|Full-blown crisis|You didn't want it that badly anyway|You'd have done the same",
"Your ideal low-key date|Cooking something together|A long walk, no destination|Getting lost in conversation for hours|Doing absolutely nothing, together",
"The thing you'd never admit you find attractive|Being really good at something niche|A specific sense of humor|Confidence, plain and simple|Kindness to strangers, it gets you every time",
"You get one superpower, but it's cursed somehow|Reading minds, hear it all|Invisibility, disappear whenever|Time freeze, one second only|Talking to animals, oddly specific",
"A stranger starts arguing with you in public. You...|Match the energy instantly|De-escalate, calm and collected|Walk away, not worth it|Secretly kind of enjoy it",
"Your 'productive procrastination' move|Deep clean the kitchen|Reorganize something unnecessary|Research a random topic for hours|Start an entirely different task",
"Your 'special occasion' meal|Somewhere fancy, no menu prices|Home-cooked, made with love|Whatever's the most food for the money|Delivery, let's be real",
"Your phone battery health right now|Suspiciously good|A ticking time bomb|You don't know and don't want to|Replaced it, learned your lesson",
"Camping: yes or absolutely not|Yes, no bathroom required|A cabin counts as camping, fight me|Hard no, I need a mattress|Once, and that was more than enough",
"One-way ticket, no plan, leaving tomorrow. You go|Without a second thought|Only with someone you trust|You need at least a plan first|Hard pass, chaos isn't your thing",
"The hardest part of missing someone|Not being able to just show up|The silence after a good call ends|Not knowing their day-to-day anymore|Missing the small, dumb moments most",
"Your long-distance survival tool|A shared playlist that says it all|Daily texts, no matter how small|Scheduled calls, non-negotiable|Just knowing there's an end date",
"Time zones are working against you. You...|Stay up way too late for them|Wake up absurdly early instead|Find the one overlapping hour and protect it|Honestly, you just wing it",
"The next visit can't come fast enough because of...|A specific meal you've been craving together|Just being in the same room, finally|An inside joke that only works in person|Honestly, just the hug",
"Your 'missing them' coping mechanism|Old photos, on repeat|A voice note you replay|Staying busy on purpose|A countdown, visible and obvious",
"The thing you'd never tell them you worry about|Growing apart, slowly|Missing something big in their life|Them meeting someone closer|Honestly, you don't worry, you trust it",
"Long distance rule you don't break|Goodnight message, every single night|No going to bed angry, ever|Total honesty, even the small stuff|Protect the next visit at all costs",
"The video call habit that's a little unhinged|Leaving it on in the background for hours|Falling asleep on camera together|Doing chores while just talking|Full outfit changes to show off, mid-call",
"Your first move, be honest|A bold, direct compliment|A joke to break the ice|Just really good eye contact|Someone else has to make the first move",
"The text that lives in your head rent-free|Something unexpectedly sweet|Something a little bold|A perfectly-timed joke|Honestly, just 'good morning'",
"Your 'type,' if you're honest|Confident, doesn't need to prove it|Funny, disarms you instantly|Quietly intense, thinks deeply|Genuinely kind, that's the whole thing",
"A compliment actually lands when it's...|Specific, not generic|About something you worked hard on|Delivered with real eye contact|Unexpected, out of nowhere",
"Your flirting tell, according to everyone else|You get weirdly talkative|You get quieter, oddly|You tease relentlessly|You have absolutely no tell, allegedly",
"The look across the room, you...|Hold it, don't look away|Look away immediately, then peek back|Walk over, no hesitation|Pretend you didn't notice at all",
"Your ideal way to be asked out|Straightforward, just ask|Something a little creative|Through a mutual friend first|Honestly, however, just ask",
"The line that would actually work on you|Something genuinely funny|Something disarmingly honest|Confident, but not arrogant|Honestly, a good line isn't the move",
"Your most unhinged childhood fear|Something specific and irrational|The dark, classic and unbeaten|A very specific movie scene|Something you still won't admit",
"The lie you told as a kid that almost worked|A classic 'it wasn't me'|Something elaborate and detailed|A blame-shift to a sibling|You were a suspiciously honest kid",
"Your childhood 'that could've ended badly' moment|A stunt gone wrong|Something involving fire, briefly|Getting lost somewhere you shouldn't have been|You were weirdly cautious, actually",
"The toy you were way too attached to|Something soft and worn out|Something you 'fixed' repeatedly|Something you still technically have|You honestly don't remember",
"Your report card had a recurring comment|'Talks too much in class'|'Not living up to potential'|'A pleasure to have' (suspiciously)|'Needs to focus' more than anything",
"The punishment that actually worked on you|Losing screen time, devastating|Being sent to your room|The disappointed look, worse than yelling|Honestly nothing worked, you were relentless",
"Your sibling or childhood rival dynamic|Constant petty warfare|Surprisingly close, no rivalry|One-sided, and you know who lost|An only child, chaos of your own making",
"The thing you got in trouble for most|Talking back|Something you broke, allegedly by accident|Being somewhere you weren't supposed to be|Honestly, you were the well-behaved one",
"The family story retold every single gathering|Something you did as a kid, embarrassingly|A trip that went hilariously wrong|Something a relative said, unforgettably|You honestly don't know, you tune it out",
"Who actually runs the family, be honest|The one everyone secretly listens to|Whoever's cooking, that day|Nobody, it's beautiful chaos|You, and you're not sorry about it",
"The family debate that never gets resolved|What to eat, every single time|Directions, somebody's always wrong|An old grudge, decades deep|Who's actually the favorite",
"Your role at family gatherings|The one who cooks|The one who cleans up after|The one telling every story|The one hiding with the kids or the dog",
"The family recipe you'd fight to protect|A specific dish, no substitutions|Something nobody's ever written down|Something you've slightly changed and won't admit|Honestly, it's the takeaway tradition",
"A relative's advice you actually still use|Something surprisingly practical|Something you didn't get until later|Something you still quote word for word|Honestly, you tune most of it out",
"The most 'this is so us' family moment|A holiday that went sideways|An inside joke nobody outside gets|A group photo that captures the chaos perfectly|Every single road trip, honestly",
"Who you take after, and it shows|A parent, unmistakably|A grandparent, in the best way|A sibling, for better or worse|Nobody, you're a genuine wildcard",
"Your role in the friend group, unfiltered|The planner, nothing happens without you|The one who's chronically late|The therapist everyone calls first|The chaos agent, and you own it",
"The group chat message that gets zero replies|Anything sent after midnight|A meme nobody gets but you|'We should hang out soon'|Honestly, whatever you send gets replies",
"A friend cancels last minute. Your real reaction|Secretly relieved, be honest|Genuinely annoyed|Immediate backup plan activated|You've done the same, so no judgment",
"The friendship dealbreaker, no exceptions|Betraying a real secret|Being flaky, repeatedly|Talking behind your back|Honestly, you're pretty forgiving",
"Your 3am 'call anyone' friend|The one who always picks up|Honestly, you wouldn't call anyone|The one who'd show up, no questions|You'd text first, always",
"The friend trip that almost broke the group|Someone's terrible planning|Money drama, the classic|Wildly different vacation paces|Honestly, it went perfectly, no drama",
"What you'd trust a friend with, unconditionally|A real secret, no hesitation|Your pet, and that says everything|Your worst playlist, judgment-free|Your keys, no questions asked",
"The way you actually show you care|Showing up, no announcement needed|Sending the perfect meme at the right time|Remembering the tiny details|Brutal honesty, delivered with love",
"Grocery shopping hungry, be honest|You've learned your lesson, finally|You stick to the list, mostly|You shop hungry on purpose|Chaos, cart overflowing",
"Your dessert-before-dinner stance|Absolutely, life's short|Dinner first, no exceptions|Depends who's watching|Dessert IS dinner sometimes",
"The food you'd defend to the death|A controversial pizza topping|Something everyone else hates|A regional thing nobody outside gets|You don't have one, you're easy",
"Leftovers situation in your house|Labeled and organized|A mystery Tupperware graveyard|Eaten immediately, no such thing as leftovers|Someone else always claims them first",
"Your honest 'diet' right now|Actually pretty balanced|Mostly held together by caffeine|A rotation of the same five meals|You don't call it a diet, you call it survival",
"Your travel buddy dealbreaker|Chronic lateness|No spontaneity whatsoever|Bad with money mid-trip|Honestly, you'd travel with anyone",
"New city, no map. You...|Ask a local immediately|Wander until you're hopelessly lost|Trust your phone completely|Somehow end up somewhere great anyway",
"Your 'never again' travel mistake|Overpacking, obviously|Underpacking, learned the hard way|Booking the cheapest flight with layovers from hell|You don't make travel mistakes, allegedly",
"Jet lag hits you how|Barely, you adjust instantly|You're useless for days|You just stay on home time out of spite|You've genuinely never traveled that far",
"Your ideal vacation pace|Packed itinerary, no wasted hours|Wake up, wing it, repeat|Horizontal, by a pool, don't talk to me|A mix, but mostly naps",
"Texting back speed with a crush|Instantly, no games|Just long enough to seem busy|Whenever you actually see it|You overthink every single reply",
"Your 'this is serious' tell|You introduce them to your people|You stop checking other options|You plan actual future things together|You get quieter, more real",
"Flirting style, exposed|Teasing, relentlessly|Genuine compliments, no games|Eye contact that says everything|Painfully bad jokes, on purpose",
"The most romantic thing, honestly|A grand, planned gesture|Someone remembering a tiny detail|Just consistent, quiet effort|Showing up when it's inconvenient for them",
"Breakup recovery style|Straight into 'glow up' mode|You need real time, no rushing it|You talk it out with everyone you know|You process it alone, quietly",
"Your most unhinged 2am decision|An online order you regretted|A text you shouldn't have sent|A life plan that changed by morning|You've never made one, allegedly",
"You get caught in a lie. Your move?|Double down immediately|Fess up right away|Change the subject, fast|Somehow talk your way out of it",
"The group chat turns on you. You...|Defend yourself, loudly|Go quiet, let it blow over|Screenshot everything, for later|Leave the chat, dramatically",
"You're handed the aux cord at the worst moment. You...|Full commit to your weird taste|Play it safe, crowd-pleasers only|Panic, hand it right back|Take the chance to convert everyone",
"Someone challenges you to a dance-off, right now. You...|Full send, no shame|Politely, firmly decline|Fake an injury immediately|Actually might win this",
"Your default reaction to bad news|Need a minute of silence|Immediately need to talk it out|Deflect with a joke|Straight into problem-solving mode",
"A group project, you are the...|One doing everyone's part|One who vanishes|One sending 'just checking in'|One negotiating the deadline extension",
"Your ideal amount of small talk|None, get to the point|A little, then business|Could talk forever, it's fine|Depends entirely on the person",
"You just remembered an embarrassing thing from years ago|It haunts you at 2am|You laugh it off instantly|You've fully blocked it out|You bring it up yourself, unprompted",
"Your honest relationship with silence|Fills it immediately, always|Fine for a minute, then it's weird|Comfortable, even craves it|Depends entirely who it's with",
"Your childhood dream job, unfiltered|Something wildly unrealistic|Exactly what you do now, weirdly|Something you've completely forgotten|Something you're a little embarrassed by",
"The show you'd defend from childhood, no matter the quality|Something genuinely questionable, looking back|Something that actually holds up|Something nobody else remembers|You weren't really a TV kid",
"Your 'kids these days don't understand' childhood thing|Actual boredom, no screens|Getting hurt and it being fine|Landlines and busy signals|Honestly, you had it easy too",
"A friend's bad decision, you...|Tell them straight, every time|Support it, judge silently|Ask questions, then support it|Join in, honestly",
"Your friendship 'green flag'|Remembers things you mentioned once|Calls you out, lovingly|Shows up, even when it's inconvenient|Makes you laugh until it hurts",
"The friend most likely to talk you into something regrettable|You know exactly who|Honestly, that's you|Nobody, you're the responsible one|Depends entirely on the night",
"Your honest reaction to a friend's new partner|Instant read, right or wrong|You reserve judgment, always|You're just happy if they're happy|You've got opinions, and you'll share them",
"The family group chat, honestly|Never stops buzzing|Mostly memes and photos|You read everything, reply to nothing|Muted, lovingly",
"A family tradition you'd never let go|The big holiday meal|A specific yearly trip|A weird, oddly specific ritual|Honestly, just being together, no ritual needed",
"The relative everyone has a story about|The one who's a little too honest|The one who's always late|The one with the wildest past|Honestly, that's you",
"The thing your family will never let you live down|Something you said as a kid|A very public mistake|A phase you thought was cool at the time|Something so minor it's baffling it stuck",
"What you'd drop everything for|A surprise visit, no warning|A call at 3am, no questions asked|A flight booked on a whim|Honestly, most things, if it's them",
"The distance taught you, unexpectedly|Patience you didn't know you had|How to actually communicate|What you genuinely can't live without|How strong it actually is",
"Your flight gets cancelled with zero warning. You...|Rebook instantly, no panic|Find the nearest bar and regroup|Call someone to vent immediately|Turn it into an unplanned adventure",
"You find a stranger's phone, unlocked. You...|Return it immediately, untouched|A quick, guilty peek first|Try to track down the owner yourself|Hand it to the nearest staff or security",
"You're the only one who remembers an old inside joke at a reunion. You...|Bring it up, hope someone remembers|Let it go, times have changed|Explain the whole thing, slowly|Text someone who'd actually remember",
"A stranger tips you off that your fly's down. You...|Fix it, laugh it off|Die a little inside, silently|Pretend you knew already|Immediately need to know how long",
"You win a surprise free trip, starting tomorrow. You...|Pack immediately, ask questions later|Need a full day to think it over|Bring someone, no solo trips|Politely decline, too much chaos",
"The power goes out mid-dinner party. You...|Candles and vibes, keep going|It's basically over, people leave|Turn it into a whole game night|Panic slightly, then adapt",
"You're mistaken for someone famous in public. You...|Play along, just for fun|Correct them immediately|Ask who they think you look like|Honestly, kind of enjoy the attention",
"A group text blows up at 2am over nothing. You...|Reply immediately, fully invested|Mute it, deal with it tomorrow|Read everything, say nothing|Add fuel to the fire, be honest",
"You accidentally like an old photo while stalking someone's profile. You...|Immediate panic, unlike and pray|Own it, no shame|Blame it on a 'butt dial'|Delete the app, dramatically",
"Someone spoils the ending of something you're watching. You...|Quiet fury, hard to forgive|Shrug it off, watch anyway|Genuinely never speak to them again|Ask for more details, might as well",
"You're handed a mic at a wedding, unprepared. You...|Somehow deliver a great toast|A few sincere words, keep it short|Pass it along immediately|Freeze completely, blank slate",
"Your card gets declined at checkout, line behind you. You...|Laugh it off, try again|Quietly want to disappear|Have a backup ready instantly|Panic, then remember Apple Pay exists",
"A waiter brings the wrong order. You...|Eat it anyway, no big deal|Politely correct it|Actually prefer it, keep it|Wait, unsure if it's worth the hassle",
"You catch your reflection mid-conversation. You...|Immediately self-conscious|Don't even notice|A quick check, then move on|Fully derailed for a second",
"Someone you ghosted resurfaces years later. You...|Apologize, own the ghosting|Play it cool, pretend it's fine|Explain yourself, finally|Ghost again, instinctively",
"You're asked to speak up in a meeting you weren't listening to. You...|Confidently bluff your way through|Honestly admit you missed it|Ask someone to repeat, quietly|Somehow land a decent answer anyway",
"Your phone autocorrects something embarrassing mid-conversation. You...|Immediate follow-up correction|Let it ride, hope it's ignored|Own it, make it a bit|Full-on panic spiral",
"You realize you've been talking to the wrong person the whole time. You...|Laugh, explain the mix-up|Quietly slip away|Just roll with it, why not|Immediate, visible embarrassment",
"A childhood memory gets 'debunked' by someone who was there. You...|Defend your version, hard|Accept it, memory's unreliable|Need to investigate further|Honestly, doesn't change the story for you",
"You're the last one standing in a game everyone else quit. You...|Finish it, principle of the thing|Quit too, no point alone|Declare yourself the winner|Rope someone back in to finish it",
"What stresses them out most|Money|Work|Family|Feeling out of control",
"How they actually handle conflict|Talk it through right away|Need space first|Avoid it as long as possible|Get defensive",
"Their biggest insecurity|How they look|Their intelligence|Whether people like them|Not being enough",
"What they need most when they're upset|Advice|Someone to just listen|Space alone|A distraction",
"Their honest fear about the future|Being alone|Failing at something big|Losing someone close|Running out of time",
"Who they'd call first in a real crisis|Me|A parent|A sibling|Their best friend",
"How they really feel about their job right now|Genuinely likes it|It's fine, pays the bills|Counting down the days|Actively looking elsewhere",
"Their honest attachment style|Secure|Anxious|Avoidant|Depends on the relationship",
"What would make them walk away from a friendship|A betrayal|Being ignored|One big blowup|A slow fade, no confrontation",
"Their real love language, not the cute answer|Words of affirmation|Quality time|Physical touch|Acts of service",
"How they handle being wrong|Admit it fast|Need time to come around|Get defensive first|Rarely think they're wrong",
"Their honest take on money|Saver, plans ahead|Spender, figures it out|Stressed about it often|Doesn't think about it much",
"What they're most likely to regret not doing|Traveling more|Taking a risk on a relationship|Speaking up in a moment|Nothing, no regrets",
"How they actually recharge|Alone time, no people|Time with close friends|Doing something physical|Doing absolutely nothing",
"What they'd never admit out loud to most people|A fear|A regret|A bad habit|An opinion",
"Their honest opinion on how they were raised|Wouldn't change much|Some things they'd do differently|A lot they'd do differently|Still figuring that out",
"What actually makes them feel loved|Being chosen consistently|Being understood|Being supported publicly|Being left alone to be themselves",
"Their biggest source of pride, honestly|A relationship they built|Something they overcame|A skill or achievement|Who they've become",
"What they're most guarded about|Their past|Their feelings|Their finances|Their family"];

// "Rate me" questions: the maker rates themselves 1-5 (stored 0-4) between
// two labeled extremes, and guessers try to land on the same number.
// Format: "prompt|min label|max label". Mixed into the same categories as
// the multiple-choice questions above (not a separate category), so they
// can show up in any quiz. Indices continue on from RAW, so existing
// question ids never shift.
const RAW_SCALE = [
  "How much of a neat freak are they?|Total slob|Borderline OCD",
  "How jealous do they actually get?|Never, not even a little|Extremely, no shame",
  "How much of a morning person are they?|Not even slightly|Insufferably chipper by 7am",
  "How spontaneous are they, really?|Plans everything a week out|Fully impulsive, no notice needed",
  "How competitive are they at games?|Doesn't care who wins|Will flip the board",
  "How much do they overthink a text before sending it?|Not at all, fires it off|Analyzes every punctuation mark",
  "How affectionate are they in public?|Zero PDA, keep it private|Fully unbothered, hand-holding and more",
  "How stubborn are they?|Easily talked into anything|Immovable once they've decided",
  "How much of a homebody are they?|Always out, can't sit still|Never leaves the couch if they can help it",
  "How good are they at keeping a secret?|It's out by dinner|Vault-level, dies with them",
  "How much of a perfectionist are they?|Good enough is good enough|Redoes it three times until it's right",
  "How easily do they cry at a movie?|Stone cold, never|Every single time, no exceptions",
  "How much of a risk-taker are they?|Plays it safe, always|Full send, every time",
  "How patient are they stuck in traffic or a long line?|Instant rage|Zen master, doesn't even notice",
  "How much alone time do they need to recharge?|Never, always wants people around|Constantly, solo time is sacred",
  "How likely are they to say 'I told you so'?|Never, too kind for that|Every single time, and they'll remind you",
];

// "Talking point" questions: personality traits and scenarios, not scored
// against a right answer. The maker still answers about themselves and
// guessers still guess (same mechanics as any other question), but at
// scoring time these are excluded (see attempts/route.js) — the point
// isn't who got it "right", it's the gap between how someone sees
// themselves and how they're actually seen, surfaced as a conversation
// starter on the maker's results page. Format matches RAW_SCALE/RAW.
const RAW_TOPIC_SCALE = [
  "How much do they wear their heart on their sleeve?|Total closed book|An open wound, always",
  "How guarded are they with new people?|Instant trust|Takes years to let anyone in",
  "How much of a peacemaker are they in conflict?|Will happily go to war|Defuses everything, every time",
  "How thick-skinned are they, honestly?|One comment ruins their week|Nothing gets to them",
  "How much of a planner vs. wing-it person are they, deep down?|Fully wings it, always|Has a plan for the plan",
  "How self-aware do they seem?|Genuinely no idea|Uncomfortably self-aware",
  "How much do they need external validation?|Doesn't care what anyone thinks|Needs the applause",
  "How forgiving are they, really?|Holds a grudge forever|Forgives almost instantly",
  "How much of a people-pleaser are they?|Zero interest in pleasing anyone|Can't say no to save their life",
  "How independent are they, at their core?|Needs someone else to function|Could disappear and thrive alone",
  "How much do they overthink other people's opinions of them?|Never crosses their mind|Replays it for days",
  "How comfortable are they with being wrong?|Will never admit it|Owns it immediately, no ego",
];
const RAW_TOPIC_MC = [
  "Under pressure, they...|Get sharper and more focused|Shut down and go quiet|Get loud and take charge|Crack a joke to defuse it",
  "At a party, they're most likely to be...|Working the whole room|Deep in one conversation all night|Helping the host in the kitchen|Gone within the hour",
  "When plans fall through last minute, they...|Shrug it off, no big deal|Quietly annoyed but won't say it|Immediately pitch a backup plan|Fully spiral about it",
  "Their go-to move when they're upset is...|Vents to the nearest person|Goes quiet and processes alone|Gets snappy, then cools down|Distracts themselves until it passes",
  "If their life had a theme song right now, it'd be something...|Triumphant and a little dramatic|Chill, low-key, in the background|Chaotic and unpredictable|Nostalgic, stuck in the past a bit",
  "In a group project, they're the one who...|Takes over and drives it|Does their part, says nothing else|Keeps everyone's spirits up|Quietly does everyone else's part too",
  "Their honest reaction to being the center of attention|Secretly loves it|Would rather disappear|Plays along, uncomfortable|Fully feeds off it",
  "If they had to describe their comfort zone, it's...|Barely exists, they've left it behind|A small, well-defended fortress|Wherever the people they love are|Somewhere quiet, alone, no exceptions",
  "Their approach to a rule they disagree with|Follows it, complains later|Breaks it quietly, no announcement|Argues it to your face|Ignores it entirely, no discussion",
  "When someone they love is struggling, they...|Show up with a plan to fix it|Just sit with them, no fixing|Give them space until asked|Check in constantly, maybe too much",
];

// "Hard" questions: more edge and friction than the rest of the bank —
// honest criticism, conflict, things people don't love admitting about
// themselves. Scored normally like any other question (unlike the topic
// questions above, this is about content/tone, not about removing the
// right/wrong mechanic) — the maker picks the answer that's actually true,
// guessers try to match it, same as everywhere else.
const RAW_HARD_MC = [
  "The most valid criticism anyone's given them|They're too stubborn to compromise|They avoid conflict instead of addressing it|They say yes to everything then resent it|They shut down instead of talking it through",
  "When they're wrong, they usually...|Double down before admitting it|Go quiet and need time to come around|Admit it fast, no ego about it|Deflect with a joke instead of owning it",
  "Their biggest blind spot, if they're honest|They don't notice when they're hurting someone|They think they're more self-aware than they are|They avoid things that actually need fixing|They let people treat them worse than they deserve",
  "The thing people get tired of repeating to them|Communicate more, don't just shut down|Stop apologizing for things that aren't your fault|Actually ask for help sometimes|Stop comparing yourself to everyone else",
  "If a friendship ended, it'd probably be because of...|Something they didn't say when they should have|Something they said that they shouldn't have|Growing apart, not any one thing|Trust, once broken, not coming back",
  "Their least attractive trait, said with love|Holding grudges longer than necessary|Needing to be right, even over small stuff|Flaking when they're not feeling it|Being impossible to read when upset",
  "The feedback they need to hear more often|You don't have to fix everything yourself|It's okay to not be okay|You're allowed to want more|Not everyone deserves the benefit of the doubt",
  "What they do when someone lets them down|Bring it up immediately, no filter|Let it go outwardly, stew on it privately|Quietly pull back instead of confronting it|Give one more chance, then they're done",
  "Their honest track record on apologizing first|Never, on principle|Eventually, once the dust settles|Immediately, even when it's not fully their fault|Only if they're cornered into it",
  "What they're most likely to lie about, even a little|How they're actually doing|What something cost|How they really feel about someone|How much something bothered them",
];
const RAW_HARD_SCALE = [
  "How defensive do they get when criticized?|Takes it in stride|Gets visibly defensive",
  "How often do they avoid a hard conversation instead of having it?|Addresses it head-on, every time|Avoids it as long as possible",
  "How much do they let people get away with treating them badly?|Zero tolerance, immediately|Way more than they should",
  "How likely are they to admit when they're the problem?|Owns it instantly|Will find any other explanation first",
  "How well do they take a joke at their own expense?|Laughs it off, no issue|Takes it personally, every time",
  "How often do they hold a grudge longer than the situation deserves?|Lets it go fast|Holds on for way too long",
  "How honest are they willing to be when it might hurt someone's feelings?|Softens everything, every time|Blunt, no matter what",
  "How much do they actually change after being called out, versus just saying sorry?|Says sorry, nothing changes|Genuinely adjusts, every time",
];

// Trait-rating questions: physical and non-physical. Kept to style,
// presentation, confidence and effort rather than literal appearance/body
// ranking (no "rate their looks 1-10") — this app has no age gate, and
// that kind of content tips into objectification/body-judgment rather
// than the lighter "how do you come across" territory the rest of the
// bank stays in. Non-physical ones are ordinary personality traits (humor,
// smarts, creativity, reliability). Scored normally, same as RAW_HARD_*.
const RAW_TRAIT_MC = [
  "Their signature style, honestly|Effortlessly put together|Comfort over everything, every time|Trend-aware, always current|Same reliable uniform, every day",
  "The compliment about them that actually lands|Your smile|Your style|Your eyes|Your energy, more than how you look",
  "Their go-to when they want to feel their best|A specific outfit|Their hair done right|Just enough sleep|Confidence has nothing to do with how they look",
  "Their most underrated quality|Loyalty|Patience|Creativity|Work ethic",
  "The trait people notice about them first, that isn't how they look|Their humor|Their confidence|Their kindness|Their intensity",
];
const RAW_TRAIT_SCALE = [
  "How much effort do they put into their appearance day-to-day?|Zero, rolls out of bed and goes|Full routine, every single day",
  "How confident are they in how they look?|Avoids mirrors|Full main-character energy",
  "How much do they care what people think of how they look?|Doesn't cross their mind|Thinks about it constantly",
  "How much do they stand out in a room, physically?|Blends in, by choice|Impossible not to notice",
  "How quickly do they get ready to leave the house?|Takes forever, no matter what|Five minutes flat, always",
  "How funny are they, objectively?|Not really their thing|Genuinely one of the funniest people you know",
  "How smart are they in the way that actually matters day-to-day?|Book smart, that's about it|Sharp about everything, all the time",
  "How creative are they?|Not really their strength|Deeply, constantly creative",
  "How good are they at making people feel comfortable?|Not their strong suit|Instantly puts anyone at ease",
  "How reliable are they when it actually counts?|You'd hedge your bets|Rock solid, every time",
  "How good are they at reading a room?|Completely oblivious|Reads it instantly, every time",
];

export const QUESTIONS = [
  ...RAW.map((s) => {
    const [prompt, ...options] = s.split('|');
    return { type: 'mc', prompt, options };
  }),
  ...RAW_SCALE.map((s) => {
    const [prompt, minLabel, maxLabel] = s.split('|');
    return { type: 'scale', prompt, minLabel, maxLabel, min: 0, max: 4 };
  }),
  ...RAW_TOPIC_SCALE.map((s) => {
    const [prompt, minLabel, maxLabel] = s.split('|');
    return { type: 'scale', prompt, minLabel, maxLabel, min: 0, max: 4, topic: true };
  }),
  ...RAW_TOPIC_MC.map((s) => {
    const [prompt, ...options] = s.split('|');
    return { type: 'mc', prompt, options, topic: true };
  }),
  ...RAW_HARD_MC.map((s) => {
    const [prompt, ...options] = s.split('|');
    return { type: 'mc', prompt, options };
  }),
  ...RAW_HARD_SCALE.map((s) => {
    const [prompt, minLabel, maxLabel] = s.split('|');
    return { type: 'scale', prompt, minLabel, maxLabel, min: 0, max: 4 };
  }),
  ...RAW_TRAIT_MC.map((s) => {
    const [prompt, ...options] = s.split('|');
    return { type: 'mc', prompt, options };
  }),
  ...RAW_TRAIT_SCALE.map((s) => {
    const [prompt, minLabel, maxLabel] = s.split('|');
    return { type: 'scale', prompt, minLabel, maxLabel, min: 0, max: 4 };
  }),
];

const CATS={'Daily life':[0,5,8,11,12,16,17,18,21,22,24,25,32,33,34,35,40,42,43,44,46,55,57],'Food':[6,7,15,30,38,39,45,50,56],'Travel':[1,2,4,20,26,28,29,47,58],'Romance':[3,13,19,23,31,48,49,51,52],'Chaos':[9,10,14,27,36,37,41,53,54,59],'Long distance':[60,61,62,63,64,65,66,67],'Flirty':[68,69,70,71,72,73,74,75],'Childhood':[76,77,78,79,80,81,82,83],'Family lore':[84,85,86,87,88,89,90,91],'Friends':[92,93,94,95,96,97,98,99]};
CATS['Food'].push(100,101,102,103,104);CATS['Travel'].push(105,106,107,108,109);CATS['Romance'].push(110,111,112,113,114);CATS['Chaos'].push(115,116,117,118,119);CATS['Daily life'].push(120,121,122,123,124);CATS['Childhood'].push(125,126,127);CATS['Friends'].push(128,129,130,131);CATS['Family lore'].push(132,133,134,135);CATS['Long distance'].push(136,137);CATS['Scenarios']=Array.from({length:20},(_,k)=>138+k);
CATS['Real talk']=Array.from({length:19},(_,k)=>158+k);

// "Rate me" scale questions (indices 177-192) mixed into existing
// categories, not a category of their own — see RAW_SCALE above.
CATS['Daily life'].push(177,179,185,190);
CATS['Romance'].push(182,183);
CATS['Chaos'].push(180,188,189);
CATS['Real talk'].push(178,184,187,191);
CATS['Friends'].push(181,186,192);

// "Talking point" questions (indices 193-214) — personality/scenario,
// excluded from scoring (see RAW_TOPIC_SCALE/RAW_TOPIC_MC above), mixed
// into existing categories the same way.
CATS['Daily life'].push(193,197,205,209);
CATS['Romance'].push(194,198,206,210);
CATS['Chaos'].push(195,199,207,211);
CATS['Real talk'].push(196,200,208,212);
CATS['Friends'].push(201,213);
CATS['Childhood'].push(202,214);
CATS['Family lore'].push(203,204);

// "Hard" questions (indices 215-232) — more criticism/friction than the
// rest of the bank, scored normally (see RAW_HARD_MC/RAW_HARD_SCALE
// above), mixed into existing categories, weighted toward Real talk.
CATS['Real talk'].push(215,216,217,218,225,226,227,228);
CATS['Romance'].push(219,229,230);
CATS['Friends'].push(220,221,231);
CATS['Family lore'].push(222,232);
CATS['Daily life'].push(223,224);

// Trait-rating questions (indices 233-248), physical and non-physical —
// see RAW_TRAIT_MC/RAW_TRAIT_SCALE above.
CATS['Daily life'].push(233,238,242);
CATS['Romance'].push(234,239,246);
CATS['Friends'].push(235,240,247);
CATS['Family lore'].push(236,241);
CATS['Real talk'].push(237,243,244,245,248);

const AUD={Partner:['Mix it up','Scenarios','Real talk','Daily life','Food','Travel','Romance','Chaos','Childhood','Long distance','Flirty'],BFF:['Mix it up','Scenarios','Real talk','Daily life','Food','Travel','Chaos','Childhood','Friends'],Fam:['Mix it up','Scenarios','Real talk','Daily life','Food','Travel','Chaos','Childhood','Family lore']};


export const CATEGORIES = CATS;
export const AUDIENCES = AUD;

export function poolFor(audience, category) {
  if (category === 'Mix it up') {
    const excluded = new Set(['Long distance', 'Flirty'].flatMap((k) => CATS[k] || []));
    const ids = new Set();
    for (const cat of AUD[audience] || []) {
      if (cat === 'Mix it up') continue;
      for (const id of CATS[cat] || []) {
        if (!excluded.has(id)) ids.add(id);
      }
    }
    return [...ids];
  }
  return (CATS[category] || []).slice();
}
