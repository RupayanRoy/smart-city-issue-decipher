"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supplyService } from '@/backend/services/supplyService';
import { IssueCategory } from '@/backend/types';
import { showSuccess, showError } from '@/utils/toast';

interface SupplyRequestDialogProps {
  worker: any;
  issue?: any;
  onSuccess?: () => void;
}

const SupplyRequestDialog: React.FC<SupplyRequestDialogProps> = ({ worker, issue, onSuccess }) => {
  const [supplies, setSupplies] = useState<any[]>([]);
  const [selectedSupplyId, setSelectedSupplyId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [requestType, setRequestType] = useState<'Usage' | 'Refill'>('Usage');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const allSupplies = supplyService.getSupplies();
      // If we have an issue, prioritize supplies for that category
      if (issue) {
        const filtered = allSupplies.filter(s => s.category === issue.category);
        setSupplies(filtered.length > 0 ? filtered : allSupplies);
      } else {
        setSupplies(allSupplies);
      }
    }
  }, [open, issue]);

  const handleSubmit = () => {
    if (!selectedSupplyId || quantity <= 0) {
      showError("Please select a supply and valid quantity.");
      return;
    }

    const result = supplyService.createRequest({
      workerId: worker.id,
      workerName: worker.name,
      supplyId: selectedSupplyId,
      quantity,
      type: requestType,
      issueId: issue?.id,
      issueTitle: issue?.title
    });

    if (result) {
      showSuccess(`${requestType} request submitted for approval.`);
      setOpen(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl font-black text-xs gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-50">
          <Package className="w-4 h-4" /> REQUEST SUPPLIES
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="text-amber-500 w-6 h-6" /> Logistics Request
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {issue ? `Requesting equipment for: ${issue.title}` : 'Request a stock refill for your department.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button 
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${requestType === 'Usage' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600' : 'text-slate-500'}`}
              onClick={() => setRequestType('Usage')}
            >
              USAGE
            </button>
            <button 
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${requestType === 'Refill' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600' : 'text-slate-500'}`}
              onClick={() => setRequestType('Refill')}
            >
              REFILL
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Select Supply</Label>
            <select 
              className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-bold px-4 outline-none focus:ring-2 focus:ring-amber-500"
              value={selectedSupplyId}
              onChange={e => setSelectedSupplyId(e.target.value)}
            >
              <option value="" disabled>CHOOSE ITEM</option>
              {supplies.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.stock} {s.unit} available)</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Quantity</Label>
            <Input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={e => setQuantity(parseInt(e.target.value))}
              className="rounded-xl h-12 border-slate-200 dark:border-slate-800 dark:bg-slate-950 font-bold"
            />
          </div>

          {selectedSupplyId && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                Requests are monitored by the Command Center. Please ensure usage is strictly for the assigned mission.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black px-8" onClick={handleSubmit}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupplyRequestDialog;