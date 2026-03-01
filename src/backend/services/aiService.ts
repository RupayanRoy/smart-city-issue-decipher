import { IssueCategory, IssuePriority } from '../types';

const CATEGORY_KEYWORDS: Record<IssueCategory, string[]> = {
  Water: [
    'flood', 'burst', 'leak', 'pipe', 'water', 'drainage', 'sewage', 'tap', 
    'overflow', 'stagnant', 'clogged', 'drain', 'gutter', 'hydrant', 'sprinkler',
    'pumping', 'well', 'tanker', 'contamination', 'smelly water', 'no supply',
    'low pressure', 'dirty water', 'main break', 'culvert'
  ],
  Electricity: [
    'power', 'outage', 'shock', 'wire', 'electric', 'blackout', 'transformer', 
    'light', 'bulb', 'sparking', 'short circuit', 'meter', 'pole', 'cable', 
    'darkness', 'streetlamp', 'voltage', 'fluctuation', 'hanging wire',
    'exposed wires', 'fuse', 'substation', 'grid'
  ],
  Road: [
    'pothole', 'crack', 'street', 'road', 'asphalt', 'pavement', 'traffic', 
    'divider', 'bump', 'manhole', 'sidewalk', 'curb', 'signage', 'signal', 
    'marking', 'gravel', 'excavation', 'digging', 'blockage', 'zebra crossing',
    'speed breaker', 'paving', 'tar', 'sinkhole'
  ],
  Garbage: [
    'trash', 'waste', 'smell', 'dump', 'litter', 'collection', 'bin', 'garbage',
    'debris', 'junk', 'stench', 'overflowing', 'recycling', 'scavenger', 
    'fly-tipping', 'dead animal', 'carcass', 'plastic', 'dumpster', 'refuse',
    'sanitation', 'unhygienic'
  ],
  Other: []
};

const PRIORITY_KEYWORDS = {
  High: [
    'danger', 'emergency', 'risk', 'accident', 'immediate', 'dying', 'fire', 
    'hazard', 'critical', 'live wire', 'flooding', 'injury', 'blocked', 
    'collapsed', 'toxic', 'explosion', 'urgent', 'asap', 'life threatening',
    'severe', 'catastrophic', 'bleeding', 'trapped'
  ],
  Medium: [
    'broken', 'urgent', 'bad', 'annoying', 'blocking', 'dark', 'smelly',
    'inconvenient', 'messy', 'leaking', 'damaged', 'faulty', 'not working',
    'needs repair', 'deteriorating'
  ],
  Low: [
    'minor', 'small', 'request', 'suggestion', 'paint', 'dirty', 'old',
    'maintenance', 'checkup', 'cosmetic', 'faded'
  ]
};

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

export const aiService = {
  analyzeIssue: (description: string) => {
    const text = description.toLowerCase();
    
    let category: IssueCategory = 'Other';
    let maxMatches = 0;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matches = keywords.filter(kw => text.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat as IssueCategory;
      }
    }

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
    
    // Detect Category from full history
    let category: IssueCategory = 'Other';
    let maxMatches = 0;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matches = keywords.filter(kw => fullText.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat as IssueCategory;
      }
    }

    // Detect Priority from full history
    let priority: IssuePriority = 'Low';
    if (PRIORITY_KEYWORDS.High.some(kw => fullText.includes(kw))) {
      priority = 'High';
    } else if (PRIORITY_KEYWORDS.Medium.some(kw => fullText.includes(kw))) {
      priority = 'Medium';
    }

    // Improved Location Detection (checking full history)
    const locationPatterns = [
      /(at|near|on|in|beside|opposite|behind|front of|next to)\s+([A-Z0-9][a-z0-9]+\s?)+/g,
      /\d+\s+[A-Z][a-z]+\s+(Street|Road|Ave|Avenue|Lane|Way|Blvd|Drive)/gi,
      /sector\s+\d+/gi,
      /block\s+[a-z0-9]/gi,
      /landmark|near the|opposite to|behind the/gi
    ];
    
    const hasLocationPattern = locationPatterns.some(pattern => pattern.test(fullText));
    const hasLocationKeywords = fullText.includes('street') || fullText.includes('road') || 
                               fullText.includes('avenue') || fullText.includes('area') ||
                               fullText.includes('landmark') || fullText.includes('near');

    const lastBotMessage = messages.filter(m => m.role === 'bot').pop()?.text.toLowerCase() || '';
    const isAnsweringLocation = lastBotMessage.includes('location') || lastBotMessage.includes('venue') || lastBotMessage.includes('where');

    return {
      category,
      priority,
      hasLocation: hasLocationPattern || hasLocationKeywords || (isAnsweringLocation && lastUserMessage.length > 5),
      isAnsweringLocation,
      suggestedTitle: userMessages[0]?.split('.').slice(0, 1)[0].substring(0, 50) + (userMessages[0]?.length > 50 ? '...' : '')
    };
  },

  generateResponse: (analysis: any, messages: ChatMessage[]) => {
    const userMessages = messages.filter(m => m.role === 'user');
    
    // If we have everything, confirm
    if (analysis.hasLocation && analysis.category !== 'Other') {
      return `I've got all the details. This looks like a ${analysis.priority} priority ${analysis.category.toLowerCase()} issue. I've also noted the location from our conversation. Ready to submit this report?`;
    }

    // If we have category but no location
    if (analysis.category !== 'Other' && !analysis.hasLocation) {
      return `I've identified this as a ${analysis.category.toLowerCase()} problem. To help our teams find it, could you tell me exactly where this is? (e.g., "Near the main gate" or a street name)`;
    }

    // If we have location but no category
    if (analysis.hasLocation && analysis.category === 'Other') {
      return `I've noted the location. Could you describe the issue in more detail? Is it related to roads, water, electricity, or garbage?`;
    }

    // Default fallback
    return "I'm listening. Please tell me more about the issue and where it's located so I can help you file a report.";
  }
};