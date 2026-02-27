import { IssueCategory, IssuePriority } from '../types';

const CATEGORY_KEYWORDS: Record<IssueCategory, string[]> = {
  Water: ['flood', 'burst', 'leak', 'pipe', 'water', 'drainage', 'sewage', 'tap'],
  Electricity: ['power', 'outage', 'shock', 'wire', 'electric', 'blackout', 'transformer', 'light', 'bulb'],
  Road: ['pothole', 'crack', 'street', 'road', 'asphalt', 'pavement', 'traffic', 'divider'],
  Garbage: ['trash', 'waste', 'smell', 'dump', 'litter', 'collection', 'bin', 'garbage'],
  Other: []
};

const PRIORITY_KEYWORDS = {
  High: ['danger', 'emergency', 'risk', 'accident', 'immediate', 'dying', 'fire', 'hazard', 'critical', 'live wire', 'flooding'],
  Medium: ['broken', 'urgent', 'bad', 'annoying', 'blocking', 'dark', 'smelly'],
  Low: ['minor', 'small', 'request', 'suggestion', 'paint']
};

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

export const aiService = {
  analyzeConversation: (messages: ChatMessage[]) => {
    // Combine all user messages to get full context
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.text);
    const fullText = userMessages.join(' ').toLowerCase();
    const latestText = userMessages[userMessages.length - 1]?.toLowerCase() || '';
    
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

    // Extract potential location hints (checking full history)
    const locationHints = fullText.match(/(at|near|on|in|beside|opposite)\s+([A-Z][a-z]+\s?)+/g);
    const hasLocation = locationHints !== null || fullText.includes('street') || fullText.includes('road') || fullText.includes('avenue');

    // Check if the user is answering a specific question from the bot
    const lastBotMessage = messages.filter(m => m.role === 'bot').pop()?.text.toLowerCase() || '';
    const isAnsweringLocation = lastBotMessage.includes('location') || lastBotMessage.includes('venue');

    return {
      category,
      priority,
      hasLocation,
      isAnsweringLocation,
      suggestedTitle: userMessages[0]?.split('.').slice(0, 1)[0].substring(0, 50) + (userMessages[0]?.length > 50 ? '...' : '')
    };
  },

  generateResponse: (analysis: any, messages: ChatMessage[]) => {
    const userMessages = messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 1) {
      if (!analysis.hasLocation) {
        return `I've noted that this is a ${analysis.category.toLowerCase()} issue. To help our teams find it, could you please tell me the exact location or a nearby landmark?`;
      }
      return `I've analyzed your report. It looks like a ${analysis.priority} priority ${analysis.category} issue at ${analysis.hasLocation ? 'the location mentioned' : 'your area'}. Shall I go ahead and submit this for you?`;
    }

    if (analysis.isAnsweringLocation && analysis.hasLocation) {
      return `Thanks for providing the location! I've updated the report. It's now a ${analysis.priority} priority ${analysis.category} issue. Ready to submit?`;
    }

    if (!analysis.hasLocation) {
      return "I still need a location to pin this on the map. Could you please provide an address or landmark?";
    }

    return "Got it. I have all the details now. Does everything look correct for submission?";
  }
};