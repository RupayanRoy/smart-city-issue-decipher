import { IssueCategory, IssuePriority } from '../types';

const CATEGORY_KEYWORDS: Record<IssueCategory, string[]> = {
  Water: ['flood', 'burst', 'leak', 'pipe', 'water', 'drainage', 'sewage'],
  Electricity: ['power', 'outage', 'shock', 'wire', 'electric', 'blackout', 'transformer'],
  Road: ['pothole', 'crack', 'street', 'road', 'asphalt', 'pavement', 'traffic'],
  Garbage: ['trash', 'waste', 'smell', 'dump', 'litter', 'collection', 'bin'],
  Other: []
};

const PRIORITY_KEYWORDS = {
  High: ['danger', 'emergency', 'risk', 'accident', 'immediate', 'dying', 'fire', 'hazard', 'critical'],
  Medium: ['broken', 'urgent', 'bad', 'annoying', 'blocking'],
  Low: ['minor', 'small', 'request', 'suggestion']
};

export const aiService = {
  detectCategoryAndPriority: (description: string): { category: IssueCategory; priority: IssuePriority } => {
    const desc = description.toLowerCase();
    
    // Detect Category
    let detectedCategory: IssueCategory = 'Other';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matches = keywords.filter(kw => desc.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedCategory = category as IssueCategory;
      }
    }

    // Detect Priority
    let detectedPriority: IssuePriority = 'Low';
    if (PRIORITY_KEYWORDS.High.some(kw => desc.includes(kw))) {
      detectedPriority = 'High';
    } else if (PRIORITY_KEYWORDS.Medium.some(kw => desc.includes(kw))) {
      detectedPriority = 'Medium';
    }

    return { category: detectedCategory, priority: detectedPriority };
  }
};