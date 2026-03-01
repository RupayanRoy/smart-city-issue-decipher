import { IssueCategory, IssuePriority } from '../types';

const CATEGORY_PATTERNS: Record<IssueCategory, RegExp[]> = {
  Water: [
    /flood/i, /leak/i, /pipe/i, /water/i, /drain/i, /sewage/i, /tap/i, /overflow/i, 
    /stagnant/i, /clogged/i, /gutter/i, /hydrant/i, /sprinkler/i, /pumping/i, 
    /well/i, /tanker/i, /contamination/i, /smelly.*water/i, /no.*supply/i,
    /low.*pressure/i, /dirty.*water/i, /main.*break/i, /culvert/i, /aquifer/i
  ],
  Electricity: [
    /power/i, /outage/i, /shock/i, /wire/i, /electric/i, /blackout/i, /transformer/i, 
    /light/i, /bulb/i, /sparking/i, /short.*circuit/i, /meter/i, /pole/i, /cable/i, 
    /darkness/i, /streetlamp/i, /voltage/i, /fluctuation/i, /hanging.*wire/i,
    /exposed.*wires/i, /fuse/i, /substation/i, /grid/i, /current/i
  ],
  Road: [
    /pothole/i, /crack/i, /street/i, /road/i, /asphalt/i, /pavement/i, /traffic/i, 
    /divider/i, /bump/i, /manhole/i, /sidewalk/i, /curb/i, /signage/i, /signal/i, 
    /marking/i, /gravel/i, /excavation/i, /digging/i, /blockage/i, /zebra.*crossing/i,
    /speed.*breaker/i, /paving/i, /tar/i, /sinkhole/i, /pathway/i, /lane/i
  ],
  Garbage: [
    /trash/i, /waste/i, /smell/i, /dump/i, /litter/i, /collection/i, /bin/i, /garbage/i,
    /debris/i, /junk/i, /stench/i, /overflowing/i, /recycling/i, /scavenger/i, 
    /fly-tipping/i, /dead.*animal/i, /carcass/i, /plastic/i, /dumpster/i, /refuse/i,
    /sanitation/i, /unhygienic/i, /filth/i, /muck/i
  ],
  Other: []
};

const PRIORITY_PATTERNS = {
  High: [
    /danger/i, /emergency/i, /risk/i, /accident/i, /immediate/i, /dying/i, /fire/i, 
    /hazard/i, /critical/i, /live.*wire/i, /flooding/i, /injury/i, /blocked/i, 
    /collapsed/i, /toxic/i, /explosion/i, /urgent/i, /asap/i, /life.*threatening/i,
    /severe/i, /catastrophic/i, /bleeding/i, /trapped/i, /panic/i, /help.*now/i
  ],
  Medium: [
    /broken/i, /urgent/i, /bad/i, /annoying/i, /blocking/i, /dark/i, /smelly/i,
    /inconvenient/i, /messy/i, /leaking/i, /damaged/i, /faulty/i, /not.*working/i,
    /needs.*repair/i, /deteriorating/i, /trouble/i, /issue/i
  ],
  Low: [
    /minor/i, /small/i, /request/i, /suggestion/i, /paint/i, /dirty/i, /old/i,
    /maintenance/i, /checkup/i, /cosmetic/i, /faded/i, /notice/i, /info/i
  ]
};

const INTENT_PATTERNS = {
  Greeting: [/hi/i, /hello/i, /hey/i, /good.*morning/i, /good.*afternoon/i, /greetings/i],
  Thanks: [/thanks/i, /thank.*you/i, /awesome/i, /great/i, /cool/i, /ok/i, /fine/i],
  Help: [/help/i, /what.*can.*you.*do/i, /how.*does.*this.*work/i, /instructions/i]
};

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

export const aiService = {
  analyzeIssue: (description: string) => {
    let category: IssueCategory = 'Other';
    let maxMatches = 0;
    for (const [cat, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      const matches = patterns.filter(p => p.test(description)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat as IssueCategory;
      }
    }

    let priority: IssuePriority = 'Low';
    if (PRIORITY_PATTERNS.High.some(p => p.test(description))) {
      priority = 'High';
    } else if (PRIORITY_PATTERNS.Medium.some(p => p.test(description))) {
      priority = 'Medium';
    }

    return {
      category,
      priority,
      suggestedTitle: description.split('.').slice(0, 1)[0].substring(0, 50) + (description.length > 50 ? '...' : '')
    };
  },

  analyzeConversation: (messages: ChatMessage[]) => {
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.text);
    const fullText = userMessages.join(' ');
    const lastUserMessage = userMessages[userMessages.length - 1] || '';
    
    // Detect Intent
    const isGreeting = INTENT_PATTERNS.Greeting.some(p => p.test(lastUserMessage));
    const isThanks = INTENT_PATTERNS.Thanks.some(p => p.test(lastUserMessage));
    const isHelp = INTENT_PATTERNS.Help.some(p => p.test(lastUserMessage));

    // Detect Category from full history
    let category: IssueCategory = 'Other';
    let maxMatches = 0;
    for (const [cat, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      const matches = patterns.filter(p => p.test(fullText)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat as IssueCategory;
      }
    }

    // Detect Priority from full history
    let priority: IssuePriority = 'Low';
    if (PRIORITY_PATTERNS.High.some(p => p.test(fullText))) {
      priority = 'High';
    } else if (PRIORITY_PATTERNS.Medium.some(p => p.test(fullText))) {
      priority = 'Medium';
    }

    // Advanced Location Detection - stricter patterns
    const locationPatterns = [
      /(at|near|on|in|beside|opposite|behind|front of|next to)\s+([A-Z0-9][a-z0-9]+\s?){2,}/gi, // Needs at least 2 words after preposition
      /\d+\s+[A-Z][a-z]+\s+(Street|Road|Ave|Avenue|Lane|Way|Blvd|Drive|Rd|St)/gi,
      /sector\s+\d+/gi,
      /block\s+[a-z0-9]/gi
    ];
    
    const hasLocationPattern = locationPatterns.some(pattern => pattern.test(lastUserMessage));
    
    const lastBotMessage = messages.filter(m => m.role === 'bot').pop()?.text.toLowerCase() || '';
    const isAnsweringLocation = /location|venue|where/i.test(lastBotMessage);

    // Only mark as having location if it matches a pattern OR if the user is specifically answering a location question with enough detail
    const hasLocation = hasLocationPattern || (isAnsweringLocation && lastUserMessage.length > 8 && !isGreeting);

    // Find the first non-greeting message to use as description
    const meaningfulMessages = userMessages.filter(msg => !INTENT_PATTERNS.Greeting.some(p => p.test(msg)));
    const suggestedDescription = meaningfulMessages.join(' ');

    return {
      category,
      priority,
      hasLocation,
      isAnsweringLocation,
      isGreeting,
      isThanks,
      isHelp,
      suggestedDescription,
      suggestedTitle: meaningfulMessages[0]?.split('.').slice(0, 1)[0].substring(0, 50) + (meaningfulMessages[0]?.length > 50 ? '...' : '')
    };
  },

  generateResponse: (analysis: any, messages: ChatMessage[]) => {
    const userMessages = messages.filter(m => m.role === 'user');
    
    if (analysis.isGreeting && userMessages.length === 1) {
      return "Hello! I'm your CityCare assistant. I can help you report issues like potholes, power outages, or garbage pile-ups. What's on your mind today?";
    }

    if (analysis.isHelp) {
      return "I'm here to make reporting city issues easy. Just describe what's wrong and where it is. You can even upload photos or videos. Once I have the details, I'll file an official report for you!";
    }

    if (analysis.isThanks && analysis.hasLocation && analysis.category !== 'Other') {
      return "You're very welcome! I'm glad I could help. Ready to submit this report now?";
    }

    // If we have everything, confirm
    if (analysis.hasLocation && analysis.category !== 'Other') {
      const priorityMsg = analysis.priority === 'High' ? "This sounds like an urgent matter, and I've marked it as High Priority." : "I've noted the details.";
      return `${priorityMsg} I've categorized this as a ${analysis.category.toLowerCase()} issue at the location you mentioned. Shall we go ahead and file the report?`;
    }

    // If we have category but no location
    if (analysis.category !== 'Other' && !analysis.hasLocation) {
      const catResponses: Record<IssueCategory, string> = {
        Water: "I've noted the water-related issue. To send a repair crew, I need to know the exact location or a nearby landmark.",
        Electricity: "Power issues can be dangerous. Please tell me where this is happening so we can alert the electrical grid team.",
        Road: "Road safety is important. Could you provide the street name or a landmark so we can locate this issue?",
        Garbage: "I've logged the sanitation report. Where exactly is the waste located?",
        Other: "I've noted your concern. Could you tell me where this is located?"
      };
      return catResponses[analysis.category as IssueCategory] || "I've got the description, but I'm missing the location. Where is this happening?";
    }

    // If we have location but no category
    if (analysis.hasLocation && analysis.category === 'Other') {
      return "I've pinned the location! Now, could you tell me a bit more about the problem? Is it something with the roads, water, lights, or maybe garbage?";
    }

    // Default fallback for vague descriptions
    if (userMessages.length > 0 && analysis.category === 'Other' && !analysis.hasLocation) {
      if (analysis.isGreeting) return "Hi there! How can I help you today? Please describe any city issues you've noticed.";
      return "I'm here to help, but I need a bit more detail. Could you describe the issue and tell me where it's located?";
    }

    return "I'm listening. Please describe the issue and its location so I can assist you.";
  }
};