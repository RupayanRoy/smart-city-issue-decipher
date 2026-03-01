import { IssueCategory, IssuePriority } from '../types';

const CATEGORY_KEYWORDS: Record<IssueCategory, string[]> = {
  Water: [
    'flood', 'burst', 'leak', 'pipe', 'water', 'drainage', 'sewage', 'tap', 
    'overflow', 'stagnant', 'clogged', 'drain', 'gutter', 'hydrant', 'sprinkler',
    'pumping', 'well', 'tanker', 'contamination', 'smelly water'
  ],
  Electricity: [
    'power', 'outage', 'shock', 'wire', 'electric', 'blackout', 'transformer', 
    'light', 'bulb', 'sparking', 'short circuit', 'meter', 'pole', 'cable', 
    'darkness', 'streetlamp', 'voltage', 'fluctuation', 'hanging wire'
  ],
  Road: [
    'pothole', 'crack', 'street', 'road', 'asphalt', 'pavement', 'traffic', 
    'divider', 'bump', 'manhole', 'sidewalk', 'curb', 'signage', 'signal', 
    'marking', 'gravel', 'excavation', 'digging', 'blockage'
  ],
  Garbage: [
    'trash', 'waste', 'smell', 'dump', 'litter', 'collection', 'bin', 'garbage',
    'debris', 'junk', 'stench', 'overflowing', 'recycling', 'scavenger', 
    'fly-tipping', 'dead animal', 'carcass', 'plastic'
  ],
  Other: []
};

const PRIORITY_KEYWORDS = {
  High: [
    'danger', 'emergency', 'risk', 'accident', 'immediate', 'dying', 'fire', 
    'hazard', 'critical', 'live wire', 'flooding', 'injury', 'blocked', 
    'collapsed', 'toxic', 'explosion', 'urgent', 'asap'
  ],
  Medium: [
    'broken', 'urgent', 'bad', 'annoying', 'blocking', 'dark', 'smelly',
    'inconvenient', 'messy', 'leaking', 'damaged', 'faulty'
  ],
  Low: [
    'minor', 'small', 'request', 'suggestion', 'paint', 'dirty', 'old',
    'maintenance', 'checkup'
  ]
};

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

export const aiService = {
  analyzeIssue: (description: string) => {
    const text = description.toLowerCase();
    
    // Detect Category
    let category: IssueCategory = 'Other';
    let maxMatches = 0;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matches = keywords.filter(kw => text.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat as IssueCategory;
      }
    }

    // Detect Priority
    let priority: IssuePriority = 'Low';
    if (PRIORITY_KEYWORDS.High.some(kw => text.includes(kw))) {
      priority = 'High';
    } else if (PRIORITY_KEYWORDS.Medium.some(kw => text.includes(kw))) {
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
    const fullText = userMessages.join(' ').toLowerCase();
    const lastUserMessage = userMessages[userMessages.length - 1]?.toLowerCase() || '';
    
    // Detect Category (checking full history)
    let category: IssueCategory = 'Other';
    let maxMatches = 0;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matches = keywords.filter(kw => fullText.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat as IssueCategory;
      }
    }

    // Detect Priority (checking full history)
    let priority: IssuePriority = 'Low';
    if (PRIORITY_KEYWORDS.High.some(kw => fullText.includes(kw))) {
      priority = 'High';
    } else if (PRIORITY_KEYWORDS.Medium.some(kw => fullText.includes(kw))) {
      priority = 'Medium';
    }

    // Improved Location Detection
    const locationPatterns = [
      /(at|near|on|in|beside|opposite|behind|front of|next to)\s+([A-Z0-9][a-z0-9]+\s?)+/g,
      /\d+\s+[A-Z][a-z]+\s+(Street|Road|Ave|Avenue|Lane|Way|Blvd|Drive)/gi,
      /sector\s+\d+/gi,
      /block\s+[a-z0-9]/gi
    ];
    
    const hasLocationPattern = locationPatterns.some(pattern => pattern.test(lastUserMessage));
    const hasLocationKeywords = lastUserMessage.includes('street') || lastUserMessage.includes('road') || 
                               lastUserMessage.includes('avenue') || lastUserMessage.includes('area') ||
                               lastUserMessage.includes('landmark') || lastUserMessage.includes('near');

    const lastBotMessage = messages.filter(m => m.role === 'bot').pop()?.text.toLowerCase() || '';
    const isAnsweringLocation = lastBotMessage.includes('location') || lastBotMessage.includes('venue') || lastBotMessage.includes('where');

    return {
      category,
      priority,
      hasLocation: hasLocationPattern || (isAnsweringLocation && lastUserMessage.length > 5),
      isAnsweringLocation,
      suggestedTitle: userMessages[0]?.split('.').slice(0, 1)[0].substring(0, 50) + (userMessages[0]?.length > 50 ? '...' : '')
    };
  },

  generateResponse: (analysis: any, messages: ChatMessage[]) => {
    const userMessages = messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 1) {
      if (!analysis.hasLocation) {
        const catMsg = analysis.category !== 'Other' 
          ? `I've identified this as a ${analysis.category.toLowerCase()} issue.` 
          : "I've noted your report.";
        return `${catMsg} To help our teams respond quickly, could you please tell me the exact location or a nearby landmark?`;
      }
      return `I've analyzed your report. It looks like a ${analysis.priority} priority ${analysis.category} issue. I've also noted the location. Shall I go ahead and submit this for you?`;
    }

    if (analysis.isAnsweringLocation && analysis.hasLocation) {
      return `Thanks for the location details! I've updated the report. It's categorized as a ${analysis.priority} priority ${analysis.category} issue. Ready to submit?`;
    }

    if (!analysis.hasLocation) {
      return "I still need a specific location to pin this on the map. Could you please provide an address, street name, or a well-known landmark nearby?";
    }

    return "Got it. I have all the necessary details now. Does the summary look correct to you?";
  }
};