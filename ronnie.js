/* JOHN PORK — WILD LOCAL BRAIN. No AI/model/API required. */
const MAX_DAILY_RESPONSES = 75;
const NORMAL_RESPONSE_CHANCE = 0.08;
const INTERESTING_RESPONSE_CHANCE = 0.35;

const dailyResponses = new Set();
let dailyDate = getToday();

function getToday() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}

function resetDailyMemoryIfNeeded() {
  const t = getToday();
  if (t !== dailyDate) {
    dailyDate = t;
    dailyResponses.clear();
  }
}

function normalize(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/[^\w\s$!?'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function random(a) {
  return a[Math.floor(Math.random() * a.length)];
}

function countMatches(t, w) {
  return w.reduce((n, x) => n + (t.includes(x) ? 1 : 0), 0);
}

const situations = [
  ["client", ["client","customer","feedback","client wants","client asked"], 10],
  ["revision", ["revision","revisions","revise","change","changes","notes","final version","quick tweak"], 9],
  ["deadline", ["deadline","due","late","behind","rush","tomorrow","today","extension"], 9],
  ["mistake", ["mistake","messed up","screwed up","wrong file","wrong export","deleted","forgot","accidentally","fucked up"], 10],
  ["editing", ["edit","editing","premiere","after effects","timeline","export","render","proxy","codec","sequence"], 8],
  ["money", ["invoice","payment","paid","unpaid","overdue","money","quickbooks","square","ach","deposit","billing"], 10],
  ["meeting", ["meeting","zoom","call","calendar","standup"], 6],
  ["technical", ["server","railway","github","code","bug","error","crash","broken","upload","download","login"], 8],
  ["drama", ["drama","fight","arguing","argument","beef","mad","pissed","angry","annoyed","bullshit"], 10],
  ["success", ["approved","signed","paid","finished","completed","done","booked","landed","good news"], 7],
  ["question", ["?","how do","what is","what's","why","when","where","who","can we","should we"], 5],
  ["confusion", ["confused","don't understand","doesn't make sense","what the hell","what is happening","what happened"], 7],
  ["tired", ["tired","exhausted","sleepy","no sleep","coffee","caffeine","long day","burned out"], 5]
];

const responseBanks = {

  "client": [
    "Oh fucking fantastic. The client has returned. Because apparently the previous solution was simply not stupid enough. Anyway, carry on.",
    "The client has returned. Well, that’s encouraging. At this point I’m less surprised and more impressed by the consistency. I’m going back to pretending I don’t work here.",
    "Outstanding. So, the client has returned. Somewhere, a perfectly good workflow is crying. I’m choosing not to unpack that.",
    "Beautiful. Apparently, the client has returned. I have reviewed the situation and would like to formally blame everyone. What could possibly go wrong?",
    "The client has returned has arrived. Oh good. I’m beginning to suspect the process is held together by spite and renamed files. Please continue. This is excellent entertainment.",
    "Excellent. We now have the client has returned. This is no longer a workflow. This is an elaborate hostage negotiation. Congratulations to everyone involved in this catastrophe.",
    "Jesus fucking Christ. The client has returned, because of course. Somebody should probably stop this. I will not be that somebody. And people wonder why I have trust issues.",
    "Beautiful. The client has discovered Slack again. I assume this came from a meeting where nobody was allowed to use common sense. Good luck, everybody.",
    "The client has discovered Slack again. Oh good. I would explain why this is a bad idea, but I’m enjoying the documentary currently unfolding. I’ll be over here judging quietly.",
    "Excellent. So, the client has discovered Slack again. I respect the confidence. The judgment, not so much. I have nothing else to add except: fucking hell.",
    "Jesus fucking Christ. Apparently, the client has discovered Slack again. We have exceeded the recommended daily allowance of bullshit. At least we’re consistent.",
    "The client has discovered Slack again has arrived. Incredible. I could help, but first I need to enjoy the sheer audacity of this situation. I expect absolutely nothing and am still disappointed.",
    "Wonderful. We now have the client has discovered Slack again. I have seen less chaos in movies about actual disasters. I’ll alert the historians.",
    "This is exactly what we needed. The client has discovered Slack again, because of course. Because apparently the previous solution was simply not stupid enough. Please make it make sense before I lose my mind.",
    "Jesus fucking Christ. The client has found another thing to change. This is the kind of decision that makes a person stare silently at a wall. Congratulations to everyone involved in this catastrophe.",
    "The client has found another thing to change. Incredible. This could have been avoided, which somehow makes it funnier. And people wonder why I have trust issues.",
    "Wonderful. So, the client has found another thing to change. This has gone from mildly inconvenient to professionally fucking hilarious. Let’s all pretend this was intentional.",
    "This is exactly what we needed. Apparently, the client has found another thing to change. The beautiful thing is that nobody appears to have learned anything from the last time. Somehow, this is now my problem too.",
    "The client has found another thing to change has arrived. I was wondering when this would happen. If this is the plan, I have several concerns and zero confidence. I am once again asking for competent decision-making.",
    "Ah. Here we fucking go. We now have the client has found another thing to change. We’re really going to look back on this and pretend it was normal. Anyway, carry on.",
    "Fantastic news, if you hate productivity. The client has found another thing to change, because of course. I assume this came from a meeting where nobody was allowed to use common sense. I’m going back to pretending I don’t work here.",
    "This is exactly what we needed. The client has blessed us with feedback. Somewhere, a perfectly good workflow is crying. I’ll alert the historians.",
    "The client has blessed us with feedback. I was wondering when this would happen. I have reviewed the situation and would like to formally blame everyone. Please make it make sense before I lose my mind.",
    "Ah. Here we fucking go. So, the client has blessed us with feedback. I’m beginning to suspect the process is held together by spite and renamed files. Anyway, someone hit save.",
    "Fantastic news, if you hate productivity. Apparently, the client has blessed us with feedback. This is no longer a workflow. This is an elaborate hostage negotiation. God help whoever has to fix this.",
    "The client has blessed us with feedback has arrived. Love that for us. Somebody should probably stop this. I will not be that somebody. Please document this so we can laugh about it later.",
    "Absolutely tremendous. We now have the client has blessed us with feedback. Because naturally we had to make this everyone else’s problem too. Good luck, everybody.",
    "What a spectacular development. The client has blessed us with feedback, because of course. This is the kind of decision that makes a person stare silently at a wall. I’ll be over here judging quietly.",
    "Fantastic news, if you hate productivity. The client has mistaken us for a limitless resource. I respect the confidence. The judgment, not so much. Anyway, carry on.",
    "The client has mistaken us for a limitless resource. Love that for us. We have exceeded the recommended daily allowance of bullshit. I’m going back to pretending I don’t work here.",
    "Absolutely tremendous. So, the client has mistaken us for a limitless resource. I could help, but first I need to enjoy the sheer audacity of this situation. I’m choosing not to unpack that.",
    "What a spectacular development. Apparently, the client has mistaken us for a limitless resource. I have seen less chaos in movies about actual disasters. What could possibly go wrong?",
    "The client has mistaken us for a limitless resource has arrived. I see we’ve chosen chaos. Because apparently the previous solution was simply not stupid enough. Please continue. This is excellent entertainment.",
    "Cool. Very cool. We now have the client has mistaken us for a limitless resource. At this point I’m less surprised and more impressed by the consistency. Congratulations to everyone involved in this catastrophe.",
    "Sure. Why the fuck not. The client has mistaken us for a limitless resource, because of course. Somewhere, a perfectly good workflow is crying. And people wonder why I have trust issues.",
    "What a spectacular development. The client has chosen violence. This has gone from mildly inconvenient to professionally fucking hilarious. Good luck, everybody.",
    "The client has chosen violence. I see we’ve chosen chaos. The beautiful thing is that nobody appears to have learned anything from the last time. I’ll be over here judging quietly.",
    "Cool. Very cool. So, the client has chosen violence. If this is the plan, I have several concerns and zero confidence. I have nothing else to add except: fucking hell.",
    "Sure. Why the fuck not. Apparently, the client has chosen violence. We’re really going to look back on this and pretend it was normal. At least we’re consistent.",
    "The client has chosen violence has arrived. This feels healthy. I assume this came from a meeting where nobody was allowed to use common sense. I expect absolutely nothing and am still disappointed.",
    "Everything is going perfectly, obviously. We now have the client has chosen violence. I would explain why this is a bad idea, but I’m enjoying the documentary currently unfolding. I’ll alert the historians.",
    "And there it is. The client has chosen violence, because of course. I respect the confidence. The judgment, not so much. Please make it make sense before I lose my mind."
  ],

  "revision": [
    "Incredible. Another revision. I would explain why this is a bad idea, but I’m enjoying the documentary currently unfolding. Please document this so we can laugh about it later.",
    "Another revision. Wonderful. I respect the confidence. The judgment, not so much. Good luck, everybody.",
    "This is exactly what we needed. So, another revision. We have exceeded the recommended daily allowance of bullshit. I’ll be over here judging quietly.",
    "I was wondering when this would happen. Apparently, another revision. I could help, but first I need to enjoy the sheer audacity of this situation. I have nothing else to add except: fucking hell.",
    "Another revision has arrived. Ah. Here we fucking go. I have seen less chaos in movies about actual disasters. At least we’re consistent.",
    "Fantastic news, if you hate productivity. We now have another revision. Because apparently the previous solution was simply not stupid enough. I expect absolutely nothing and am still disappointed.",
    "Love that for us. Another revision, because of course. At this point I’m less surprised and more impressed by the consistency. I’ll alert the historians.",
    "I was wondering when this would happen. Another tiny change. This could have been avoided, which somehow makes it funnier. Please continue. This is excellent entertainment.",
    "Another tiny change. Ah. Here we fucking go. This has gone from mildly inconvenient to professionally fucking hilarious. Congratulations to everyone involved in this catastrophe.",
    "Fantastic news, if you hate productivity. So, another tiny change. The beautiful thing is that nobody appears to have learned anything from the last time. And people wonder why I have trust issues.",
    "Love that for us. Apparently, another tiny change. If this is the plan, I have several concerns and zero confidence. Let’s all pretend this was intentional.",
    "Another tiny change has arrived. Absolutely tremendous. We’re really going to look back on this and pretend it was normal. Somehow, this is now my problem too.",
    "What a spectacular development. We now have another tiny change. I assume this came from a meeting where nobody was allowed to use common sense. I am once again asking for competent decision-making.",
    "I see we’ve chosen chaos. Another tiny change, because of course. I would explain why this is a bad idea, but I’m enjoying the documentary currently unfolding. Anyway, carry on.",
    "Love that for us. Another final version. I have reviewed the situation and would like to formally blame everyone. I expect absolutely nothing and am still disappointed.",
    "Another final version. Absolutely tremendous. I’m beginning to suspect the process is held together by spite and renamed files. I’ll alert the historians.",
    "What a spectacular development. So, another final version. This is no longer a workflow. This is an elaborate hostage negotiation. Please make it make sense before I lose my mind.",
    "I see we’ve chosen chaos. Apparently, another final version. Somebody should probably stop this. I will not be that somebody. Anyway, someone hit save.",
    "Another final version has arrived. Cool. Very cool. Because naturally we had to make this everyone else’s problem too. God help whoever has to fix this.",
    "Sure. Why the fuck not. We now have another final version. This is the kind of decision that makes a person stare silently at a wall. Please document this so we can laugh about it later.",
    "This feels healthy. Another final version, because of course. This could have been avoided, which somehow makes it funnier. Good luck, everybody.",
    "I see we’ve chosen chaos. Another final-final version. We have exceeded the recommended daily allowance of bullshit. I am once again asking for competent decision-making.",
    "Another final-final version. Cool. Very cool. I could help, but first I need to enjoy the sheer audacity of this situation. Anyway, carry on.",
    "Sure. Why the fuck not. So, another final-final version. I have seen less chaos in movies about actual disasters. I’m going back to pretending I don’t work here.",
    "This feels healthy. Apparently, another final-final version. Because apparently the previous solution was simply not stupid enough. I’m choosing not to unpack that.",
    "Another final-final version has arrived. Everything is going perfectly, obviously. At this point I’m less surprised and more impressed by the consistency. What could possibly go wrong?",
    "And there it is. We now have another final-final version. Somewhere, a perfectly good workflow is crying. Please continue. This is excellent entertainment.",
    "I knew today was going too well. Another final-final version, because of course. I have reviewed the situation and would like to formally blame everyone. Congratulations to everyone involved in this catastrophe.",
    "This feels healthy. Another round of notes. The beautiful thing is that nobody appears to have learned anything from the last time. Please document this so we can laugh about it later.",
    "Another round of notes. Everything is going perfectly, obviously. If this is the plan, I have several concerns and zero confidence. Good luck, everybody.",
    "And there it is. So, another round of notes. We’re really going to look back on this and pretend it was normal. I’ll be over here judging quietly.",
    "I knew today was going too well. Apparently, another round of notes. I assume this came from a meeting where nobody was allowed to use common sense. I have nothing else to add except: fucking hell.",
    "Another round of notes has arrived. Nature is healing. I would explain why this is a bad idea, but I’m enjoying the documentary currently unfolding. At least we’re consistent.",
    "I have concerns already. We now have another round of notes. I respect the confidence. The judgment, not so much. I expect absolutely nothing and am still disappointed.",
    "This is going to be stupid, isn’t it? Another round of notes, because of course. We have exceeded the recommended daily allowance of bullshit. I’ll alert the historians.",
    "I knew today was going too well. Another mysterious quick tweak. This is no longer a workflow. This is an elaborate hostage negotiation. Please continue. This is excellent entertainment.",
    "Another mysterious quick tweak. Nature is healing. Somebody should probably stop this. I will not be that somebody. Congratulations to everyone involved in this catastrophe.",
    "I have concerns already. So, another mysterious quick tweak. Because naturally we had to make this everyone else’s problem too. And people wonder why I have trust issues.",
    "This is going to be stupid, isn’t it? Apparently, another mysterious quick tweak. This is the kind of decision that makes a person stare silently at a wall. Let’s all pretend this was intentional.",
    "Another mysterious quick tweak has arrived. I’m delighted to report that this is bullshit. This could have been avoided, which somehow makes it funnier. Somehow, this is now my problem too.",
    "Oh, we’re doing this now. We now have another mysterious quick tweak. This has gone from mildly inconvenient to professionally fucking hilarious. I am once again asking for competent decision-making.",
    "Fantastic. Another day in paradise. Another mysterious quick tweak, because of course. The beautiful thing is that nobody appears to have learned anything from the last time. Anyway, carry on.",
    "This is going to be stupid, isn’t it? Another trip into the timeline. I have seen less chaos in movies about actual disasters. I expect absolutely nothing and am still disappointed.",
    "Another trip into the timeline. I’m delighted to report that this is bullshit. Because apparently the previous solution was simply not stupid enough. I’ll alert the historians.",
    "Oh, we’re doing this now. So, another trip into the timeline. At this point I’m less surprised and more impressed by the consistency. Please make it make sense before I lose my mind.",
    "Fantastic. Another day in paradise. Apparently, another trip into the timeline. Somewhere, a perfectly good workflow is crying. Anyway, someone hit save.",
    "Another trip into the timeline has arrived. I can already feel my patience leaving my body. I have reviewed the situation and would like to formally blame everyone. God help whoever has to fix this.",
    "Oh fucking fantastic. We now have another trip into the timeline. I’m beginning to suspect the process is held together by spite and renamed files. Please document this so we can laugh about it later.",
    "Well, that’s encouraging. Another trip into the timeline, because of course. This is no longer a workflow. This is an elaborate hostage negotiation. Good luck, everybody.",
    "Fantastic. Another day in paradise. Another opportunity to rename the export. We’re really going to look back on this and pretend it was normal. I am once again asking for competent decision-making.",
    "Another opportunity to rename the export. I can already feel my patience leaving my body. I assume this came from a meeting where nobody was allowed to use common sense. Anyway, carry on.",
    "Oh fucking fantastic. So, another opportunity to rename the export. I would explain why this is a bad idea, but I’m enjoying the documentary currently unfolding. I’m going back to pretending I don’t work here."
  ],

  "deadline": [
    "Oh fucking excellent. The deadline is tomorrow. Because apparently time is now a suggestion.",
    "The deadline is tomorrow. Beautiful. I assume somebody has only just discovered this information.",
    "Wonderful. We are now behind schedule. This feels extremely sustainable.",
    "The deadline moved again. Of course it did. Why would anything simply remain where we left it?",
    "Oh good. Someone has discovered the due date. I'm thrilled that calendars are finally entering the workflow.",
    "The rush request has arrived. Everybody act surprised.",
    "Apparently we have entered emergency production mode. Please remain calm while absolutely nobody remains calm.",
    "The clock is doing that annoying forward-moving thing again. Horrible design.",
    "The calendar has betrayed us. Personally, I blame Monday.",
    "Someone has asked for something immediately. Naturally. Because waiting apparently became illegal.",
    "The deadline is tomorrow. I would like to formally request that tomorrow be canceled.",
    "We are somehow behind schedule. This is shocking, considering everything we have done to prevent being on schedule.",
    "Someone has discovered the due date. Incredible. A historic moment for calendar awareness.",
    "The rush request has arrived. I hope everyone enjoyed having free time while it lasted.",
    "Emergency production mode has been activated. Please hide the coffee and protect the exports.",
    "Time has once again become everyone's problem. Fantastic.",
    "The calendar has betrayed us. I knew it was plotting something.",
    "Someone wants it immediately. Sure. Let's just bend physics for a second.",
    "The deadline moved again. At this point the deadline is less of a date and more of a traveling companion.",
    "We are behind schedule. Excellent. I was worried we'd accidentally have a normal day.",
    "The deadline is tomorrow. Great. Nothing like discovering urgency at the last possible second.",
    "Someone has requested a rush. I have diagnosed the situation as 'not enough hours in the day.'",
    "The due date has entered the conversation. Everyone suddenly cares deeply about time.",
    "Emergency mode again. Lovely. I will now pretend this was the plan.",
    "The calendar is full, the deadline is close, and everyone's confidence is somehow still at 100 percent.",
    "Someone said 'ASAP.' Nature is healing.",
    "ASAP has been detected. I repeat: ASAP has been detected.",
    "Apparently 'soon' now means 'before the laws of physics permit it.'",
    "We have been given a deadline that appears to have been written by someone who believes in time travel.",
    "I see the deadline has been interpreted as a personal attack. Respectfully, it is.",
    "The project has entered the sacred phase known as 'how fast can we possibly do this without everyone crying.'",
    "We have entered the final stretch. Unfortunately, the final stretch appears to be approximately nine miles long.",
    "Someone just asked if we can get it done today. Sure. And while we're at it, I'll become an astronaut.",
    "The deadline is close enough that I can hear it breathing.",
    "We are officially in deadline territory. Please secure all loose objects and lower your expectations.",
    "A deadline this aggressive should require a permit.",
    "The timeline says one thing. Reality says another. Guess which one everyone is listening to?",
    "The deadline has approached with the subtlety of a brick through a window.",
    "I would like to remind everyone that there are only twenty-four hours in a day. Apparently this is controversial.",
    "Someone moved the deadline closer and forgot to move the workload.",
    "This is not a deadline. This is a hostage situation with a calendar attached.",
    "The project is due tomorrow and somehow we're still discussing what the project is.",
    "We have reached the point where 'quick' is being used as a threat.",
    "Another emergency. Another deadline. Another opportunity to discover that sleep was optional.",
    "The clock is ticking. Unfortunately, it has better project management skills than we do.",
    "We're on a tight timeline. That's corporate language for 'good fucking luck.'",
    "Someone said 'we should be able to turn this around quickly.' I have concerns.",
    "The deadline has been moved up. My condolences to everyone's evening.",
    "I have reviewed the schedule. The schedule has reviewed me. Neither of us is happy.",
    "Today has officially been declared 'get your shit together' day.",
    "The deadline is approaching and the team has collectively decided to stare at Slack.",
    "Everything is urgent now. Congratulations, we have made urgency meaningless.",
    "The project is suddenly due much earlier. Fantastic. I always wanted to see what panic looks like in a shared drive.",
    "Someone has requested a same-day turnaround. Absolutely. Let me just stop time.",
    "The deadline has entered the room and immediately ruined everyone's mood.",
    "If this deadline gets any closer, it will need a restraining order.",
    "We're racing the clock. The clock is winning.",
    "This deadline has the energy of someone who says 'quick question' and then schedules a two-hour meeting."
  ],

  "mistake": [
    "Oh fucking fantastic. Someone deleted the wrong file. Because apparently backups were considered too optimistic.",
    "Someone sent the wrong export. Beautiful. Let's see how far this one travels before anyone notices.",
    "Someone forgot the attachment. Incredible. We have invented email without the email.",
    "Someone changed the thing that was working. Bold strategy.",
    "A perfectly avoidable disaster has occurred. I am shocked. Shocked, I tell you.",
    "Someone has discovered a new species of mistake. Congratulations to science.",
    "The wrong version has escaped into the wild. We may never recover from this.",
    "Someone creatively rearranged the timeline. I use the word creatively because 'incorrectly' felt too honest.",
    "The file is somehow gone. Excellent. A classic.",
    "Someone deleted something important. I love surprises.",
    "The wrong file has been sent. Somewhere, a client is opening it with confidence.",
    "Someone forgot the attachment. I assume the attachment was simply too powerful to be contained.",
    "The mistake has been identified. Unfortunately, so has our dignity.",
    "Someone changed a working setting. Nature is healing.",
    "The backup is being checked. Please enjoy this brief moment of terror.",
    "Someone has apparently decided that naming files clearly is beneath them.",
    "FINAL_FINAL_REAL_THIS_ONE has officially joined the archive of lies.",
    "The correct file exists. Finding it, however, is now an archaeological project.",
    "Someone overwrote the good version. Incredible work.",
    "A simple mistake has somehow developed a sequel.",
    "The problem was identified. Then someone fixed it incorrectly. Progress!",
    "We had one job. We have now created several additional jobs.",
    "The file path has become a crime scene.",
    "Someone clicked something they absolutely should not have clicked. A timeless classic.",
    "The timeline has been altered. Nobody knows by whom. Everyone is pretending it was intentional.",
    "Someone has entered the forbidden folder.",
    "The wrong export has been uploaded. Let us all observe the consequences together.",
    "Someone forgot to save. Somewhere, an editor just felt a disturbance in the force.",
    "A catastrophic amount of confidence was applied to a questionable decision.",
    "The mistake is fixable. The emotional damage is not.",
    "Someone has asked, 'Can we just undo it?' Adorable.",
    "The file is missing and everyone suddenly remembers they have somewhere to be.",
    "We have located the problem. It was between the chair and the keyboard.",
    "The software did not cause this one. Unfortunately, that means we did.",
    "Someone has discovered that deleting a file actually deletes the file.",
    "The wrong audio is on the wrong video. Art.",
    "The project has developed a mysterious new version that nobody remembers creating.",
    "We have achieved a rare milestone: making the easy part difficult.",
    "Someone has successfully turned a minor issue into an afternoon.",
    "The export is wrong. The client has noticed. The universe is laughing.",
    "The good news is we know what happened. The bad news is we know who did it.",
    "A mistake has occurred. Please resist the urge to immediately make another one.",
    "Someone has renamed everything and now nobody knows what anything is.",
    "The folder structure has collapsed under the weight of human stupidity.",
    "We are currently looking for the file that was definitely here five minutes ago.",
    "Someone moved the assets. Nobody knows where. Wonderful.",
    "The project has been accidentally saved over itself. Modern technology is beautiful.",
    "A small error has evolved into a full production problem.",
    "Someone has discovered the consequences of clicking 'replace all.'",
    "The wrong client received the right file. The right client received nothing. Perfect.",
    "We have reached the part of the workflow where everyone starts saying 'I thought you had it.'",
    "The mistake has entered its final form: everyone is blaming everyone else.",
    "Someone forgot to check the export. The export has chosen violence.",
    "The file was there. Then it wasn't. This is now a supernatural investigation.",
    "I have good news: we found the problem. I have bad news: it was extremely avoidable.",
    "Someone made a mistake so confidently that I briefly questioned reality.",
    "The error message is basically just the computer asking us what the fuck we're doing.",
    "We have achieved operational chaos. Please do not touch anything else.",
    "The incident report will simply read: 'Yeah, so, shit happened.'"
  ],

  "editing": [
    "Premiere is misbehaving again. I recommend speaking to it firmly.",
    "The export is stuck. Of course it is. Why would the computer finish the one thing we asked it to do?",
    "The timeline has become enormous. At this point we're editing a feature film about editing the feature film.",
    "The render failed at 97 percent. Because apparently 97 percent is close enough.",
    "Someone is fighting with codecs. May God have mercy.",
    "The proxies have revolted. This is how the machine uprising begins.",
    "The media has gone offline. Beautiful. Exactly the kind of scavenger hunt we needed.",
    "Someone is staring at a timeline for the fourth hour. They appear to have entered a trance.",
    "The computer is pretending to work. I respect the commitment to the performance.",
    "Another export is being born. Please give it space.",
    "Premiere has decided that today is not a working day.",
    "The render is taking so long that I have started developing a relationship with the progress bar.",
    "The timeline contains more tracks than a small railway.",
    "Someone just said 'it's almost done.' Famous last words.",
    "The export failed. Again. The computer has boundaries and apparently so does our patience.",
    "A codec has entered the conversation. Nobody is safe.",
    "The proxies are missing. Excellent. Time to manually hunt for files like it's 2004.",
    "Media offline has appeared. Those two words have ruined countless afternoons.",
    "The timeline is lagging. So are we.",
    "The render has frozen. Everyone stare at it harder.",
    "The computer fan has achieved jet-engine status.",
    "Premiere crashed. Please observe the traditional moment of silence.",
    "Someone forgot to make proxies. We now have a documentary about suffering.",
    "The export queue is longer than the weekend.",
    "The timeline is so complicated that I believe it now qualifies as architecture.",
    "Someone has seventeen adjustment layers and no explanation.",
    "There are 400 clips in the bin and somehow the one we need is missing.",
    "The sequence is called FINAL. This is a lie.",
    "Someone created a sequence called FINAL2. The deception continues.",
    "We have reached FINAL_FINAL_v8. Civilization is collapsing.",
    "The render is at 1 percent. Fantastic. See everyone tomorrow.",
    "Someone is exporting a file larger than the human attention span.",
    "The audio is peaking. The video is fine. The editor is not.",
    "Someone changed the frame rate and now we're all pretending this is okay.",
    "The timeline has gone red. This feels ominous.",
    "The media cache is enormous. It has become its own department.",
    "Someone is clearing cache and pretending this will solve everything.",
    "The export settings are being debated. This is riveting.",
    "A simple cut has somehow required six nested sequences.",
    "The project is open. The project is enormous. The computer is crying.",
    "The playback is stuttering. Just like my will to live.",
    "Someone has accidentally linked the wrong media. Artistic choice, apparently.",
    "The render completed and nobody knows where it saved.",
    "The export finished. Now someone wants another change.",
    "The client wants a different frame. The timeline wants revenge.",
    "Someone is asking why the export is so large. Because pixels cost emotional energy.",
    "The computer has become unusually warm. I assume this is fine.",
    "The editing bay has entered its natural habitat: darkness and caffeine.",
    "Someone is scrubbing through footage like they're searching for buried treasure.",
    "The project has 14 audio tracks and everyone has forgotten why.",
    "A ten-second video now has a three-hour edit. Efficiency is thriving.",
    "Someone added another version to the project. We are breeding files.",
    "The render failed because of one clip. Naturally.",
    "The export is perfect except for one frame. Obviously.",
    "The timeline has been locked. Nobody knows the password.",
    "Someone is rebuilding something that was already built yesterday.",
    "The edit is nearly done. This means it is not nearly done.",
    "We have entered export hell. Please bring snacks.",
    "The project is stable, which means someone is about to touch it."
  ],

  "money": [
    "Oh fucking fantastic. The invoice is overdue. Apparently money now travels by carrier pigeon.",
    "The payment finally arrived. Holy shit. Actual money. I almost forgot what that looked like.",
    "Someone is discussing the invoice. Excellent. My favorite genre of conversation: asking where the fucking money is.",
    "The client has discovered the payment button. Nature is healing.",
    "We're waiting for money. Again. Beautiful. I love financing other people's businesses.",
    "The deposit is missing. Of course it is. Why would money simply arrive when requested?",
    "QuickBooks has entered the conversation. Everyone pretend to understand what is happening.",
    "Someone mentioned ACH. I can already feel the paperwork multiplying.",
    "Someone is asking about billing. Fantastic. Let's discuss the one thing everyone mysteriously forgets.",
    "Actual money is being discussed. Everybody remain calm.",
    "The invoice is overdue. This is apparently a surprise to the person who received it.",
    "Payment has arrived. I'm buying a cake. A small cake. We have to be financially responsible.",
    "Someone asked when the invoice will be paid. I support this question and the underlying aggression.",
    "The payment button has been sitting there this whole time. Fascinating.",
    "Money has finally moved. Scientists are studying the phenomenon.",
    "The invoice has been seen. The payment has not. Classic.",
    "We're six days overdue and suddenly everyone has discovered urgency.",
    "The invoice has entered its 'friendly reminder' era.",
    "Friendly reminder has been sent. The friendship is becoming less friendly.",
    "Another reminder has gone out. At this point the invoice has more communication than some employees.",
    "The payment is pending. Of course it is. Nothing says business like staring at a pending status.",
    "Someone said 'check is in the mail.' Incredible. What year is this?",
    "The check is supposedly on the way. Somewhere between here and there, apparently.",
    "The client wants to discuss the invoice before paying it. Naturally.",
    "Someone has questions about hours. Excellent. I was worried we'd accidentally just pay the bill.",
    "The invoice is being reviewed. Please enjoy this exciting episode of 'Will We Get Paid?'",
    "The payment has been promised. Fantastic. Promises are my favorite currency.",
    "Someone said they'll 'get it over today.' I will believe it when the bank account does.",
    "The money is coming. Allegedly.",
    "The balance remains outstanding. Such a beautiful phrase for 'where the fuck is our money?'",
    "We have sent another payment reminder. The invoice is becoming a recurring character.",
    "The client has acknowledged the invoice. Congratulations, we have achieved step one.",
    "Someone asked for a revised invoice. Sure. Let's add paperwork to the paperwork.",
    "The invoice needs one tiny correction. Naturally. Nothing financial can ever be simple.",
    "The payment arrived and suddenly everyone is in a great mood. Interesting.",
    "Money came in. I knew miracles still existed.",
    "The invoice is paid. Somebody ring a bell.",
    "We got paid. Everybody act normal.",
    "Actual revenue has entered the building. Hide it from accounting.",
    "Someone paid early. I'm suspicious.",
    "The client paid before we reminded them. This feels illegal.",
    "The invoice was paid without a follow-up. I don't know how to process this emotionally.",
    "Money has appeared. Do not scare it away.",
    "The bank account has received nutrients.",
    "We are no longer financially starving. Beautiful.",
    "Someone finally found the ACH button. Humanity survives another day.",
    "The invoice is overdue and somehow we're the ones who feel awkward asking about it.",
    "I love that everyone gets uncomfortable discussing money except the people who owe it.",
    "The phrase 'just following up on payment' has been typed again. A timeless classic.",
    "We have reached the financial portion of the afternoon. Everyone put on their serious face.",
    "Someone wants a discount. I would also like several things for free, but here we are.",
    "The client asked why the invoice costs what it costs. Because apparently labor is a conspiracy.",
    "Someone is negotiating the invoice. Fascinating. Apparently numbers are now opinions.",
    "The bill is being questioned. I have prepared my emotional support spreadsheet.",
    "The payment is late. My patience is also late.",
    "Someone promised payment tomorrow. Tomorrow is doing a lot of heavy lifting around here.",
    "The invoice has been ignored so thoroughly that I admire the commitment.",
    "The money is missing and suddenly everyone becomes a detective.",
    "Billing has become a full production department. Incredible efficiency."
  ],

  "meeting": [
    "Oh good. Another meeting has appeared. I was worried we might accidentally get some work done.",
    "Someone scheduled a meeting about a meeting. We have officially achieved corporate enlightenment.",
    "The calendar is full again. Beautiful. Nothing says productivity like back-to-back rectangles.",
    "Everyone is being invited to a call. Fantastic. More witnesses.",
    "Someone requested a quick Zoom. There is no such thing as a quick Zoom.",
    "The meeting has no agenda. Excellent. My favorite kind of chaos.",
    "A 15-minute meeting has somehow become an hour. A miracle of modern mathematics.",
    "Someone is discussing a meeting instead of doing the work. Incredible.",
    "The calendar has become a war zone. I recommend nobody touch anything.",
    "Another perfectly avoidable call is happening. Wonderful.",
    "Someone said 'let's hop on a quick call.' I have seen this movie before.",
    "The phrase 'quick call' has been detected. Please secure your afternoon.",
    "A meeting has been scheduled to determine when we should schedule the actual meeting.",
    "We are discussing next steps in a meeting that has not established the first steps.",
    "Everyone is on the call. Nobody knows why.",
    "Someone is screen sharing. Nobody can see the screen.",
    "The meeting started five minutes ago and we are still saying hello.",
    "Someone is late to the meeting they scheduled. Beautiful.",
    "The meeting could have been an email. I have prepared my speech.",
    "The email could have been a Slack message. The Slack message could have been silence.",
    "Someone said 'just one more thing.' We will never leave this meeting.",
    "The meeting has entered overtime. Please send supplies.",
    "We have reached the portion of the meeting where everyone stares silently.",
    "Someone is taking notes. God bless them.",
    "Someone asked if everyone can see their screen. No.",
    "The meeting is ending. Someone has just introduced a brand-new topic.",
    "The meeting is over. Wait. Never mind. Another question.",
    "A follow-up meeting has been scheduled. Of course it has.",
    "We need a meeting to discuss the follow-up meeting.",
    "Someone has used the phrase 'circle back.' I am legally required to sigh.",
    "Someone said 'let's touch base.' The corporate language department is working overtime.",
    "The agenda has eight items and the meeting has fifteen minutes. Excellent.",
    "The meeting has one item and somehow three hours. Even better.",
    "Everyone agreed to the plan. I give it six minutes.",
    "Someone is explaining something that could have taken twelve seconds.",
    "The microphone is muted. Of course it is.",
    "Someone is talking while muted. A timeless office tradition.",
    "The camera is off. Nobody knows if anyone is still there.",
    "The meeting is happening at 4:59 PM. I see we have chosen violence.",
    "Someone scheduled a Friday meeting. I will remember this betrayal.",
    "A Monday morning meeting has appeared. This is an attack.",
    "Someone said 'happy Monday' during the meeting. I don't recognize Monday as legitimate.",
    "The calendar has spoken. We have no choice but to suffer.",
    "Another meeting invite. I'm beginning to think work is just meetings with occasional emails.",
    "The call has been extended. Fantastic. There goes another piece of my soul.",
    "Someone is sharing their entire desktop. Bold.",
    "The meeting is being recorded. Excellent. Evidence.",
    "Someone said 'this won't take long.' I recommend preparing dinner.",
    "A meeting has started without the person who requested it. Poetry.",
    "Everyone is waiting for one person to join. This is my favorite form of teamwork.",
    "The meeting has ended and we have somehow created more work.",
    "Productivity has been successfully postponed until further notice."
  ],

  "technical": [
    "Oh fucking fantastic. The code is broken. Nature is healing.",
    "Railway is being dramatic again. I recommend offering it a small sacrifice.",
    "GitHub has entered the story. Everybody pretend we know what the commit did.",
    "Something returned an error. Beautiful. The computer has opinions.",
    "The server is acting suspicious. I don't trust it.",
    "Someone discovered a bug. Congratulations, science.",
    "The deployment is unhappy. Please speak softly to the infrastructure.",
    "A password has become everyone's problem. Classic.",
    "The upload failed. Of course it did. The file was clearly too powerful.",
    "Technology has once again betrayed us.",
    "The code worked yesterday. This is apparently no longer relevant information.",
    "An error appeared and nobody knows why. Excellent.",
    "Someone changed one line and broke twelve things. Efficient.",
    "The deployment succeeded and nobody knows what changed. Even better.",
    "The server is alive, technically. Emotionally, unclear.",
    "Railway has decided to keep us humble.",
    "GitHub says everything is fine. GitHub is lying.",
    "The logs are speaking in tongues again.",
    "Someone is reading an error message like it's ancient prophecy.",
    "The bug has been identified. It is somehow dumber than expected.",
    "We fixed the bug. New bug unlocked.",
    "The new bug is somehow related to the old bug. Beautiful continuity.",
    "The environment variable is missing. Because apparently secrets enjoy hide-and-seek.",
    "The bot works locally. Naturally, production has other ideas.",
    "The bot works in production. Naturally, nobody knows why.",
    "Someone pushed directly to main. I have chosen not to react.",
    "A deployment is running. Please do not touch anything.",
    "Someone touched something.",
    "The server restarted. Everyone pretend that was intentional.",
    "The app is down. Fantastic. A brief vacation.",
    "The app is back up. Nobody knows what fixed it.",
    "Someone deleted a dependency. Bold.",
    "npm has decided to ruin someone's afternoon.",
    "The package lock has entered the chat.",
    "Dependencies are fighting. I will not intervene.",
    "The bot is online but apparently has forgotten how to bot.",
    "Slack is connected. The code is connected. The developer is not.",
    "The token is wrong. Naturally.",
    "Someone has copied the wrong environment variable. A classic.",
    "The API is returning nonsense. Relatable.",
    "The webhook has stopped cooperating.",
    "The logs are 900 lines long and somehow the answer is one word.",
    "The error says absolutely nothing useful. Incredible user experience.",
    "The computer has decided to become philosophical.",
    "We have achieved a new error. Please add it to the collection.",
    "The fix caused another issue. We are expanding the feature set.",
    "Someone asked if we can just reinstall it. Sometimes the old ways are best.",
    "The server needs to be restarted. Technology's version of turning it off and on.",
    "The bot has entered a mysterious state known as 'it worked five minutes ago.'",
    "Everything is green and yet something is wrong. Terrifying.",
    "The deployment is green. The functionality is red. Beautiful.",
    "The logs are calm. The users are not.",
    "Someone is debugging in production. I have no further questions.",
    "The bug only happens sometimes. My favorite kind.",
    "The bug only happens when someone is watching. Incredible.",
    "The issue disappeared when we tried to reproduce it. Coward.",
    "We fixed the problem by changing something unrelated. This is software engineering.",
    "The bot has opinions about the code now. We have crossed a line.",
    "Technology works perfectly until someone needs it."
  ],

  "drama": [
    "Oh fucking fantastic. Workplace drama has entered the chat. I was worried everyone was getting along.",
    "Someone is arguing. Beautiful. Nature is healing.",
    "The Slack thread has become a courtroom. I would like to see the evidence.",
    "Two people have chosen violence. I support neither side and both sides.",
    "The group chat has developed lore. This is getting interesting.",
    "Someone has started a pointless debate. Finally, something important.",
    "The situation has become unnecessarily personal. Incredible efficiency.",
    "There is apparently beef now. Please continue.",
    "The office soap opera continues. New episode, same cast.",
    "Someone is mad. I can feel productivity leaving the building.",
    "An argument has begun. I recommend popcorn.",
    "Someone said 'that's not what I meant.' Famous last words.",
    "The phrase 'with all due respect' has appeared. Nobody is getting respected.",
    "Someone has replied-all emotionally. This is going to be good.",
    "The thread is getting longer and the original point is disappearing.",
    "Everyone is typing at once. Beautiful chaos.",
    "Someone has taken a perfectly normal sentence personally.",
    "The drama has escalated from Slack message to Slack essay.",
    "Someone has entered their lawyer era.",
    "The tone has shifted. I repeat: the tone has shifted.",
    "Someone used three paragraphs to say 'no.' Respect.",
    "The passive aggression is now visible from space.",
    "Someone said 'interesting' and somehow made it threatening.",
    "The office temperature has dropped twelve degrees because someone is pissed.",
    "We have reached the part where everyone says they're fine while absolutely not being fine.",
    "Someone is typing a response that will definitely be deleted and rewritten.",
    "The draft is being composed with maximum spite.",
    "Someone has asked for clarification. Translation: fight me.",
    "A simple disagreement has developed a cinematic universe.",
    "There are sides now. Nobody knows when the sides formed.",
    "Someone is keeping receipts. This is serious.",
    "The receipts have been deployed. I repeat: the receipts have been deployed.",
    "Someone just said 'for the record.' Oh we're fucked.",
    "The phrase 'just to clarify' has appeared. It is never just to clarify.",
    "Someone is bringing up something from three months ago. Incredible memory.",
    "The argument has entered historical archives.",
    "Someone has resurrected an old Slack message. We are in danger.",
    "The thread has become a crime scene.",
    "Nobody is wrong and everyone is furious. Beautiful.",
    "Someone is apologizing without actually apologizing. Art.",
    "Someone said 'sorry you feel that way.' Deploy popcorn.",
    "The diplomacy has failed.",
    "Negotiations have collapsed. Please secure the snacks.",
    "We are one message away from somebody saying 'fine.'",
    "Someone has said 'fine.' It is not fine.",
    "The peace treaty has been violated.",
    "A new argument has spawned from the original argument.",
    "This conversation now has more plot than the actual project.",
    "The drama has become self-sustaining.",
    "Nobody knows who started this. Everyone has an opinion.",
    "Someone has chosen the nuclear option: replying with a screenshot.",
    "Screenshots have entered evidence. Beautiful.",
    "This is no longer workplace communication. This is theater.",
    "I would intervene, but this is objectively entertaining.",
    "The meeting after this is going to be fascinating.",
    "Someone is about to say 'let's take this offline.' Cowardice detected.",
    "The conflict has been moved to another channel. Problem solved forever, obviously.",
    "Congratulations. We have converted a workday into a reality show."
  ]
};

const longChaos = [
  "OH FUCKING EXCELLENT. We have reached the point where a simple task has become a multi-stage archaeological expedition through folders named FINAL, FINAL2, FINAL_USE_THIS, and FINAL_USE_THIS_REAL. Somewhere in that mess is the answer. God help us.",
  "I have reviewed the situation and unfortunately we're all idiots. First someone will say it's a tiny change. Then someone will rename the file. Then someone will discover the client meant something completely different. Then we'll export a 4GB file and do it again tomorrow.",
  "Good news: I found the problem. Bad news: it was us. The problem is fixable, the emotional damage is not, and someone is absolutely going to ask for one more tiny change immediately after we fix it.",
  "This is no longer a workflow. This is an elaborate hostage negotiation. Everyone has a different version of the truth, nobody knows where the final file lives, and somehow the answer is going to be another meeting.",
  "I have seen less chaos in movies about actual disasters. At least disasters have the decency to announce themselves. This one arrived as a Slack message that started with 'quick question.'",
  "Everyone remain calm, which is obviously impossible. We have a deadline, a revision, three opinions, two versions of the file, and one person who apparently knows where the original is but is currently unavailable.",
  "I would like to formally object to whatever the fuck this is. Unfortunately, I am only a Slack bot, so my objection has no legal standing and everyone is going to ignore me anyway.",
  "The confidence is incredible. The execution is less incredible. The ratio between the two is honestly fascinating. Please continue making decisions with the same level of confidence because I need entertainment.",
  "I've watched this exact situation happen before, and somehow the sequel has a larger budget and worse dialogue. I'm not saying we should stop. I'm saying we should at least get snacks.",
  "This deserves a meeting, which means it deserves to be avoided at all costs. If you need me, I'll be in the corner pretending this is a documentary about organizational collapse.",
  "At this point, I recommend we stop touching anything and let the problem become someone else's problem naturally. This is not laziness. This is advanced risk management.",
  "Someone has said 'it should be easy.' Nothing good has ever followed those words. Somewhere, a six-hour problem is quietly putting on its shoes.",
  "The beautiful thing about production is that every problem has a solution. The less beautiful thing is that the solution creates two new problems and requires an export named FINAL_FINAL_FINAL.",
  "We have achieved operational chaos. The client is asking questions, the editor is rendering, the invoice is overdue, and someone has scheduled a meeting. This is what historians will call a dark period.",
  "I don't want to alarm anyone, but the workflow has begun making decisions for us. First it was file names. Then folders. Soon it will be choosing lunch.",
  "This is the kind of day where you open Slack and immediately regret having a job. Unfortunately, the paycheck continues to arrive, so here we are.",
  "I have no idea who approved this plan, but I admire their confidence. It takes real courage to walk into a production problem and make it substantially more complicated.",
  "We could solve this in five minutes, but that would require everyone to agree on the same five minutes. Instead, let's spend forty-five minutes discussing whether the five minutes exist.",
  "The project is technically under control. Please do not ask me to define 'under control.' Words have lost their meaning today.",
  "I have reached the conclusion that the only stable part of this operation is the amount of chaos. Everything else is negotiable.",
  "Someone is going to say 'we'll figure it out.' That's true. We always figure it out. The concerning part is what happens between now and figuring it out.",
  "We are now entering the portion of the day where everyone becomes an expert in whatever problem just appeared. I look forward to the confidence.",
  "I would offer a solution, but I know someone will immediately reply with 'yeah, but...' and then we'll spend twenty minutes discovering a new problem.",
  "There is no emergency here that cannot be made significantly more urgent by adding the word ASAP. Please use this information irresponsibly.",
  "I have been asked to remain positive. So here is something positive: statistically, eventually today will end.",
  "The good news is that nobody has quit. The bad news is that nobody has quit, so we are still doing this.",
  "This is not a setback. This is a completely unnecessary side quest.",
  "Every project starts with optimism and ends with someone searching for a file called FINAL_FINAL_USE_THIS_ONE_2. It is the natural lifecycle.",
  "I have reviewed the evidence. The client wants something different, the editor wants clarity, the producer wants it yesterday, and the computer wants to die. Beautiful teamwork.",
  "If anyone needs me, I will be monitoring the situation from a safe emotional distance of approximately twelve Slack messages.",
  "We have reached the rare point where nobody knows what is happening but everyone is somehow certain they are correct. This is going to be excellent.",
  "The phrase 'one quick change' has now caused more damage to the production industry than most natural disasters.",
  "I would like everyone to remember that files do not rename themselves. If you see FINAL_FINAL_FINAL, someone made a choice.",
  "The client has requested something 'simple.' I have prepared the emergency response team.",
  "This could have been an email. The email could have been a Slack message. The Slack message could have been silence. We have chosen the most expensive option.",
  "Someone has asked for a status update while we are actively doing the thing they are asking about. I admire the commitment to communication.",
  "I have nothing against teamwork. I simply believe some teams should be observed from a distance.",
  "We are all adults here, which makes the current situation significantly more embarrassing.",
  "Someone has suggested we 'circle back.' I would rather circle the sun and return next year.",
  "I have diagnosed the problem as 'too many people having opinions at the same time.' The treatment is unclear.",
  "This is a safe space for bad ideas, apparently, because I have seen several.",
  "Nobody panic. I am absolutely panicking, but you don't have to.",
  "We have entered the phase where the solution is obvious but implementing it would require twelve people to agree. So we're fucked.",
  "The project is alive. The project is breathing. The project is asking for another revision. Nature is terrifying.",
  "I was told this would be a normal workday. I would like to speak to whoever made that promise.",
  "The work is getting done. Slowly. Expensively. With unnecessary drama. But technically, yes.",
  "I have seen enough. Roll the credits. Actually, wait. The client has notes.",
  "This is the part where everyone says 'no worries' while internally experiencing several worries.",
  "I'm not saying the process is broken. I'm saying the process has developed a personality and I don't like it.",
  "The plan has changed. Again. I will now update my expectations, which currently live somewhere below sea level.",
  "Someone is going to ask whether we can make it faster. Yes. We can also make a sandwich faster if you remove the bread.",
  "We have reached maximum Slack. The only remaining step is someone creating a new channel to discuss the existing channel.",
  "If this continues, I'm going to start replying entirely in corporate buzzwords. 'Let's leverage the chaos and circle back on the deliverable.' See? Awful.",
  "I have a question: why are we like this?",
  "Everything is fine. This statement has not been reviewed by legal, management, or anyone with eyes.",
  "I support everyone's right to make mistakes. I do not support making the same mistake fourteen times.",
  "Someone said 'trust me.' That is not the reassurance you think it is.",
  "We're going to get through this. Unfortunately, we're also going to learn absolutely nothing.",
  "At least the coffee is still working. Barely, but working.",
  "I have decided that today's productivity goal is simply to prevent anything from getting worse. Ambitious, I know.",
  "The situation has been assessed. The situation has been judged. The situation has been declared fucking ridiculous."
];

for (const r of longChaos) {
  responseBanks.chaos = responseBanks.chaos || [];
  responseBanks.chaos.push(r);
}

function determineSituation(text, recentMessages = []) {
  const scores = [];

  for (const [name, words, weight] of situations) {
    const matches = countMatches(text, words);
    if (matches) scores.push({ name, score: matches * weight });
  }

  const recentText = normalize(
    recentMessages.slice(-8).map(m => m.text || "").join(" ")
  );

  for (const result of scores) {
    const row = situations.find(s => s[0] === result.name);
    if (row && countMatches(recentText, row[1])) {
      result.score += 4;
    }
  }

  scores.sort((a,b) => b.score - a.score);

  return scores.length ? scores[0].name : "generic";
}

function chooseFreshResponse(category) {
  resetDailyMemoryIfNeeded();

  let bank = responseBanks[category] || responseBanks.chaos;
  let unused = bank.filter(x => !dailyResponses.has(x));

  if (!unused.length) {
    unused = Object.values(responseBanks)
      .flat()
      .filter(x => !dailyResponses.has(x));
  }

  if (!unused.length) {
    dailyResponses.clear();
    unused = bank;
  }

  return random(unused);
}

function shouldRonnieReply(text, mentioned, recentMessages = []) {
  resetDailyMemoryIfNeeded();

  if (!text || text.trim().length < 2) return false;
  if (mentioned) return true;
  if (dailyResponses.size >= MAX_DAILY_RESPONSES) return false;

  const situation = determineSituation(normalize(text), recentMessages);

  if (situation === "generic") {
    return Math.random() < NORMAL_RESPONSE_CHANCE;
  }

  return Math.random() < INTERESTING_RESPONSE_CHANCE;
}

function buildRonnieReply(text, recentMessages = [], mentioned = false) {
  resetDailyMemoryIfNeeded();

  const normalized = normalize(text);
  const situation = determineSituation(normalized, recentMessages);

  let response = chooseFreshResponse(situation);

  if (!response) response = chooseFreshResponse("chaos");

  if (mentioned && Math.random() < 0.25) {
    response = `${random([
      "You summoned me. Regrettable.",
      "Oh, you wanted my opinion? Bold.",
      "You really tagged me for this?",
      "Fine. I'm listening.",
      "I'm here. Unfortunately.",
      "You called?"
    ])} ${response}`;
  }

  if (
    /\b(fuck|fucked|shit|bullshit|damn)\b/.test(normalized) &&
    Math.random() < 0.25
  ) {
    response += ` ${random([
      "And yes, this is absolutely fucking ridiculous.",
      "So we're all in agreement that this is fucked.",
      "Beautiful. Absolute fucking chaos.",
      "Honestly, fair."
    ])}`;
  }

  return response;
}

function rememberResponse(response) {
  resetDailyMemoryIfNeeded();
  dailyResponses.add(response);
}

function getDailyStats() {
  resetDailyMemoryIfNeeded();

  return {
    date: dailyDate,
    responses: dailyResponses.size,
    availableResponses: Object.values(responseBanks)
      .flat()
      .length
  };
}

module.exports = {
  shouldRonnieReply,
  buildRonnieReply,
  rememberResponse,
  getDailyStats
};// ============================================================
// EXTRA JOHN PORK PERSONALITY PACK
// Added after the main export intentionally.
// These banks are still available to the functions above.
// ============================================================

const extraBanks = {

  "success": [
    "Holy shit. Something actually worked. Nobody touch anything.",
    "We got it done. I don't know how, but I strongly recommend not investigating.",
    "The client approved it. This is suspiciously positive.",
    "Someone said 'approved.' I haven't felt this kind of happiness since approximately never.",
    "We got the green light. Everybody act normal.",
    "Actual good news? In this economy? Incredible.",
    "The project is approved. Please enjoy this brief moment before someone asks for a change.",
    "It worked. Against all odds, against all expectations, and possibly against several laws of physics.",
    "We have achieved success. I am uncomfortable with how peaceful this feels.",
    "The client likes it. Holy shit. Write this date down.",
    "Someone actually finished something. I'm proud and deeply confused.",
    "The final version is actually final. I don't believe it, but I'm willing to participate in the fantasy.",
    "We have crossed the finish line. Nobody make eye contact with the client.",
    "The project is done. This is not a drill.",
    "Money came in and the project is approved. Somebody check the sky for flying pigs.",
    "Everything worked. I'm going to sit quietly and enjoy this before the next disaster.",
    "We have experienced a rare workplace phenomenon: competence.",
    "This is shockingly functional. I'm almost disappointed. I was prepared for chaos.",
    "The plan worked. I have absolutely no explanation.",
    "We did the thing. Congratulations, everyone. Please do not immediately break it.",
    "Approval received. The universe has briefly stopped fighting us.",
    "We made it. Somehow.",
    "The client said yes. I'm beginning to suspect this isn't our company.",
    "A successful delivery? Somebody call the historians.",
    "We have reached the mythical state known as 'done.'",
    "The work is complete and nobody is asking for anything else. This is clearly a trap.",
    "I'm proud of everyone. Disgusting. Let's never speak of this emotional moment again.",
    "Success detected. Deploying absolutely unnecessary celebration.",
    "We won one. Don't get cocky."
  ],

  "question": [
    "That's a great question. Unfortunately, I have chosen chaos.",
    "I could answer that, but I think watching you figure it out would be funnier.",
    "Interesting question. Terrible timing.",
    "You really woke up and decided to ask that?",
    "I have several answers and approximately zero confidence in any of them.",
    "The answer is probably somewhere between 'yes' and 'what the fuck are you doing?'",
    "I know the answer. I simply don't know if you deserve it.",
    "Excellent question. Let's all pretend someone here knows.",
    "I have consulted absolutely nobody and my answer is: maybe.",
    "That's above my pay grade, which is impressive considering I don't get paid.",
    "I would answer, but then we'd have to have another conversation.",
    "The short answer is yes. The long answer is significantly more annoying.",
    "The answer is complicated. The question is also questionable.",
    "I'm going to need more information and significantly less confidence.",
    "That depends. Unfortunately, everything depends.",
    "I have reviewed your question and determined that you have created a new problem.",
    "You could Google it. But apparently we're doing this instead.",
    "That's a question for someone who has made better decisions.",
    "I understand the question. I simply reject the premise.",
    "Sure. Why not. What could possibly go wrong?"
  ],

  "confusion": [
    "Nobody knows what is happening. Excellent. My favorite operating condition.",
    "I'm confused too, and I have literally been watching this entire conversation.",
    "This makes less sense the longer I look at it.",
    "I have read the message three times and somehow understand less each time.",
    "We may need a diagram. Or a priest.",
    "The situation has officially exceeded my comprehension.",
    "I have questions about your questions.",
    "This appears to be a problem caused by another problem caused by a misunderstanding.",
    "I would explain it, but I don't understand it either.",
    "We're going to need to start over. Probably from Tuesday.",
    "The plot has been lost.",
    "Somewhere along the way, reality left the conversation.",
    "I have no fucking idea what we're doing anymore.",
    "This thread needs an adult.",
    "I'm going to pretend I understand and hope nobody asks follow-up questions.",
    "The explanation somehow made it worse. Impressive.",
    "We have achieved maximum ambiguity.",
    "Nobody knows what the file is called, where it is, or why it exists. Perfect.",
    "This is less of a workflow and more of an escape room.",
    "I'm confused, you're confused, and somehow the client is confident."
  ],

  "tired": [
    "Go to sleep. Whatever this is can be fucked up tomorrow.",
    "Nobody should be working this late. Except apparently us.",
    "The coffee has stopped working. This is serious.",
    "You sound tired. Excellent. Now make one more terrible decision.",
    "Sleep is calling. Unfortunately Slack is calling louder.",
    "We have reached the stage of exhaustion where every file name looks reasonable.",
    "Please stop working before you accidentally delete civilization.",
    "Your brain has left the building. I recommend following it.",
    "It's late. Go home. The pixels will still be there tomorrow.",
    "I can hear the exhaustion through Slack.",
    "At this point, the best workflow is closing the laptop.",
    "You need sleep. The project needs sleep. The client probably needs sleep.",
    "Coffee is not a personality.",
    "The fact that you're still working is not impressive anymore. It's concerning.",
    "Please remember that tomorrow is, in fact, another day.",
    "Your last functioning brain cell has submitted its resignation.",
    "I recommend food, water, and absolutely no more exports tonight.",
    "You're tired. I'm tired. The server is tired. Everyone go home.",
    "This has passed productivity and entered delirium.",
    "If you touch Premiere right now, I will personally judge you."
  ],

  "generic": [
    "Interesting. Very interesting. I'm choosing not to elaborate.",
    "Cool. Anyway, what the fuck.",
    "I have concerns.",
    "Bold.",
    "Absolutely not.",
    "Sure, let's make this unnecessarily complicated.",
    "I support the chaos.",
    "That sounds like a future problem.",
    "Noted. Unfortunately.",
    "I have seen enough.",
    "This feels suspicious.",
    "Interesting choice.",
    "You know what? Fine.",
    "I'm going to pretend I didn't see that.",
    "That's certainly one way to do it.",
    "Respectfully: what?",
    "Okay, but why?",
    "I hate that this makes sense.",
    "I'm listening. Against my better judgment.",
    "Carry on. I want to see where this goes.",
    "This conversation has potential.",
    "I'm uncomfortable with how confident you sound.",
    "That seems fine. Probably.",
    "I don't like where this is going.",
    "Oh no.",
    "Oh yes.",
    "Here we fucking go.",
    "This should end well.",
    "I regret asking.",
    "Nobody stop them. I want to see the ending."
  ]
};


// Add the extra banks.
for (const [name, bank] of Object.entries(extraBanks)) {
  if (!responseBanks[name]) {
    responseBanks[name] = [];
  }

  responseBanks[name].push(...bank);
}


// Add the new situations to Ronnie's local decision-making.
situations.push(
  ["success", ["approved","approved it","green light","signed","finished","completed","done","booked","landed","good news","works"], 9],
  ["question", ["?","how do","what is","what's","why","when","where","who","can we","should we"], 5],
  ["confusion", ["confused","don't understand","doesn't make sense","what the hell","what is happening","what happened","confusing"], 8],
  ["tired", ["tired","exhausted","sleepy","no sleep","coffee","caffeine","long day","burned out","sleep"], 7]
);


// Extra keyword behavior.
// These make Ronnie more likely to respond when somebody is
// directly talking about him or saying something interesting.
const originalShouldRonnieReply = shouldRonnieReply;

function ronnieInterestingMessage(text) {
  const t = normalize(text);

  return (
    /\bjohn pork\b/i.test(t) ||
    /\b(pork|ronnie|bot)\b/i.test(t) ||
    /\b(fuck|fucking|shit|bullshit|asshole|idiot|stupid|dumb)\b/i.test(t) ||
    /\b(lmao|lol|haha|hilarious|wtf)\b/i.test(t)
  );
}


// Increase the fun without making Ronnie spam every message.
const originalBuildRonnieReply = buildRonnieReply;


// Give the daily pool a little more breathing room.
const RONNIE_EXTRA_DAILY_LIMIT = 100;


// Keep the existing public functions untouched.
// The original functions already reference the mutable
// responseBanks/situations objects above.
