import { mockDb } from '../db';
import { Supply, SupplyRequest, IssueCategory } from '../types';

export const supplyService = {
  getSupplies: () => {
    return [...mockDb.supplies];
  },

  getRequests: () => {
    return [...mockDb.supplyRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createRefillRequest: (data: { 
    workerId: string; 
    workerName: string; 
    supplyId: string; 
    quantity: number; 
  }) => {
    const supply = mockDb.supplies.find(s => s.id === data.supplyId);
    if (!supply) return null;

    const newRequest: SupplyRequest = {
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      workerId: data.workerId,
      workerName: data.workerName,
      supplyId: data.supplyId,
      supplyName: supply.name,
      quantity: data.quantity,
      status: 'Pending',
      type: 'Refill',
      createdAt: new Date().toISOString()
    };

    mockDb.supplyRequests.push(newRequest);
    mockDb.save();
    return newRequest;
  },

  approveRequest: (requestId: string) => {
    const request = mockDb.supplyRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'Pending') return;

    const warehouseSupply = mockDb.supplies.find(s => s.id === request.supplyId);
    const worker = mockDb.users.find(u => u.id === request.workerId);
    
    if (!warehouseSupply || !worker) return;

    // Check warehouse stock
    if (warehouseSupply.stock < request.quantity) return false;

    // Deduct from warehouse
    warehouseSupply.stock -= request.quantity;

    // Add to worker inventory
    if (!worker.inventory) worker.inventory = [];
    const workerItem = worker.inventory.find(i => i.supplyId === request.supplyId);
    
    if (workerItem) {
      workerItem.quantity += request.quantity;
    } else {
      worker.inventory.push({
        supplyId: warehouseSupply.id,
        name: warehouseSupply.name,
        quantity: request.quantity,
        unit: warehouseSupply.unit
      });
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
  },

  useSupplies: (workerId: string, usedItems: { supplyId: string, quantity: number }[]) => {
    const worker = mockDb.users.find(u => u.id === workerId);
    if (!worker || !worker.inventory) return;

    usedItems.forEach(used => {
      const item = worker.inventory?.find(i => i.supplyId === used.supplyId);
      if (item) {
        item.quantity = Math.max(0, item.quantity - used.quantity);
      }
    });

    mockDb.save();
  }
};