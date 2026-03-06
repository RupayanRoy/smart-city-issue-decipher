import { mockDb } from '../db';
import { Supply, SupplyRequest, IssueCategory } from '../types';

export const supplyService = {
  getSupplies: () => {
    return [...mockDb.supplies];
  },

  getSuppliesByCategory: (category: IssueCategory) => {
    return mockDb.supplies.filter(s => s.category === category);
  },

  getRequests: () => {
    return [...mockDb.supplyRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createRequest: (data: { 
    workerId: string; 
    workerName: string; 
    supplyId: string; 
    quantity: number; 
    type: 'Usage' | 'Refill';
    issueId?: string;
    issueTitle?: string;
  }) => {
    const supply = mockDb.supplies.find(s => s.id === data.supplyId);
    if (!supply) return null;

    const newRequest: SupplyRequest = {
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      workerId: data.workerId,
      workerName: data.workerName,
      issueId: data.issueId,
      issueTitle: data.issueTitle,
      supplyId: data.supplyId,
      supplyName: supply.name,
      quantity: data.quantity,
      status: 'Pending',
      type: data.type,
      createdAt: new Date().toISOString()
    };

    mockDb.supplyRequests.push(newRequest);
    mockDb.save();
    return newRequest;
  },

  approveRequest: (requestId: string) => {
    const request = mockDb.supplyRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'Pending') return;

    const supply = mockDb.supplies.find(s => s.id === request.supplyId);
    if (!supply) return;

    if (request.type === 'Usage') {
      if (supply.stock < request.quantity) return false; // Insufficient stock
      supply.stock -= request.quantity;
    } else {
      supply.stock += request.quantity;
    }

    request.status = 'Approved';
    mockDb.save();
    return true;
  },

  rejectRequest: (requestId: string) => {
    const request = mockDb.supplyRequests.find(r => r.id === requestId);
    if (!request) return;

    request.status = 'Rejected';
    mockDb.save();
  }
};