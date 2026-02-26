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

export const aiService = {
  analyzeIssue: (text: string) => {
    const desc = text.toLowerCase();
    
    // Detect Category
    let category: IssueCategory = 'Other';
    let maxMatches = 0;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matches = keywords.filter(kw => desc.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat as IssueCategory;
      }
    }

    // Detect Priority
    let priority: IssuePriority = 'Low';
    if (PRIORITY_KEYWORDS.High.some(kw => desc.includes(kw))) {
      priority = 'High';
    } else if (PRIORITY_KEYWORDS.Medium.some(kw => desc.includes(kw))) {
      priority = 'Medium';
    }

    // Extract potential location hints
    const locationHints = text.match(/(at|near|on|in|beside|opposite)\s+([A-Z][a-z]+\s?)+/g);
    const hasLocation = locationHints !== null || desc.includes('street') || desc.includes('road') || desc.includes('avenue');

    return {
      category,
      priority,
      hasLocation,
      suggestedTitle: text.split('.').slice(0, 1)[0].substring(0, 50) + (text.length > 50 ? '...' : '')
    };
  },

  generateResponse: (analysis: any) => {
    if (!analysis.hasLocation) {
      return "I've analyzed your report. It sounds like a " + analysis.category.toLowerCase() + " issue. Could you please tell me the exact venue or location so I can pin it on the map?";
    }
    return "Got it! I've identified this as a " + analysis.priority + " priority " + analysis.category + " issue. I'm ready to submit this for you. Does everything look correct?";
  }
};