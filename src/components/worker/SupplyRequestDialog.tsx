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
import { showSuccess, showError } from '@/utils/toast';

interface SupplyRequestDialogProps {
  worker: any;
  onSuccess?: () => void;
}

const SupplyRequestDialog: React.FC<SupplyRequestDialogProps> = ({ worker, onSuccess }) => {
  const [supplies, setSupplies] = useState<any[]>([]);
  const [selectedSupplyId, setSelectedSupplyId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const allSupplies = supplyService.getSupplies();
      setSupplies(allSupplies);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!selectedSupplyId || quantity <= 0) {
      showError("Please select a supply and valid quantity.");
      return;
    }

    const result = supplyService.createRefillRequest({
      workerId: worker.id,
      workerName: worker.name,
      supplyId: selectedSupplyId,
      quantity
    });

    if (result) {
      showSuccess(`Refill request submitted for approval.`);
      setOpen(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl font-black text-[10px] gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-50">
          <Truck className="w-3 h-3" /> REFILL KIT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="text-amber-500 w-6 h-6" /> Kit Refill Request
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Request additional stock from the City Warehouse to replenish your personal kit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Select Item to Refill</Label>
            <select 
              className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-bold px-4 outline-none focus:ring-2 focus:ring-amber-500"
              value={selectedSupplyId}
              onChange={e => setSelectedSupplyId(e.target.value)}
            >
              <option value="" disabled>CHOOSE ITEM</option>
              {supplies.map(s => (
                <option key={s.id} value={s.id}>{s.name} (Warehouse: {s.stock} {s.unit})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Refill Quantity</Label>
            <Input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={e => setQuantity(parseInt(e.target.value))}
              className="rounded-xl h-12 border-slate-200 dark:border-slate-800 dark:bg-slate-950 font-bold"
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
              Refill requests are reviewed by the Command Center. Approved items will be added to your personal kit immediately.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black px-8" onClick={handleSubmit}>
            Request Refill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupplyRequestDialog;