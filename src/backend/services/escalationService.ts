import { mockDb } from '../db';
import { differenceInDays, parseISO } from 'date-fns';

export const escalationService = {
  runEscalationCheck: () => {
    let updatedCount = 0;
    const now = new Date();

    mockDb.issues.forEach(issue => {
      if (issue.status === 'Pending' && !issue.escalated) {
        const daysOld = differenceInDays(now, parseISO(issue.createdAt));
        
        if (daysOld >= 3) {
          issue.priority = 'High';
          issue.escalated = true;
          issue.statusHistory.push({
            status: 'Pending',
            timestamp: now.toISOString(),
            updatedBy: 'System (Auto-Escalation)'
          });
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) mockDb.save();
    return updatedCount;
  }
};