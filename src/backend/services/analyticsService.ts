import { mockDb } from '../db';
import { AnalyticsData, IssueCategory, IssueStatus } from '../types';
import { differenceInHours, parseISO, format } from 'date-fns';

export const analyticsService = {
  getDashboardStats: (): AnalyticsData => {
    const issues = mockDb.issues;
    
    const byCategory = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<IssueCategory, number>);

    const byStatus = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<IssueStatus, number>);

    const resolvedIssues = issues.filter(i => i.status === 'Resolved' && i.resolvedAt);
    const avgResolutionTime = resolvedIssues.length > 0
      ? resolvedIssues.reduce((acc, i) => acc + differenceInHours(parseISO(i.resolvedAt!), parseISO(i.createdAt)), 0) / resolvedIssues.length
      : 0;

    const areaCounts = issues.reduce((acc, issue) => {
      acc[issue.location.address] = (acc[issue.location.address] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topAreas = Object.entries(areaCounts)
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const monthlyTrends = issues.reduce((acc, issue) => {
      const month = format(parseISO(issue.createdAt), 'MMM yyyy');
      const existing = acc.find(t => t.month === month);
      if (existing) existing.count++;
      else acc.push({ month, count: 1 });
      return acc;
    }, [] as { month: string; count: number }[]);

    return {
      totalIssues: issues.length,
      byCategory,
      byStatus,
      avgResolutionTimeHours: Math.round(avgResolutionTime),
      topAreas,
      monthlyTrends
    };
  }
};