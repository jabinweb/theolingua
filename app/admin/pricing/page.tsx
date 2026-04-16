'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tag, Plus, Pencil, Trash2, RefreshCw, AlertCircle, IndianRupee, Star } from 'lucide-react';
import { toast } from 'sonner';

interface PricingPlan {
  id: string;
  classId: number;
  name: string;
  durationMonths: number;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  isActive: boolean;
  isPopular: boolean;
  features: string[];
  sortOrder: number;
  workbookPrice: number | null;
  workbookNote: string | null;
  class: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Program {
  id: number;
  name: string;
  slug: string;
}

export default function PricingPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const authLoading = status === 'loading';
  const [programs, setPrograms] = useState<Program[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    classId: '',
    name: '',
    durationMonths: 3,
    price: 0,
    originalPrice: 0,
    discount: 0,
    isActive: true,
    isPopular: false,
    features: '',
    sortOrder: 0,
    workbookPrice: 0,
    workbookNote: 'inclusive of shipping',
  });

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, isLoadingAuth, user, userRole]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [programsRes, plansRes] = await Promise.all([
        fetch('/api/admin/programs'),
        fetch('/api/admin/pricing'),
      ]);

      if (programsRes.ok) {
        const data = await programsRes.json();
        setPrograms(Array.isArray(data) ? data : data.programs || []);
      }

      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData({
      classId: programs[0]?.id.toString() || '',
      name: '3 Months',
      durationMonths: 3,
      price: 0,
      originalPrice: 0,
      discount: 0,
      isActive: true,
      isPopular: false,
      features: '',
      sortOrder: 0,
      workbookPrice: 0,
      workbookNote: 'inclusive of shipping',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      classId: plan.classId.toString(),
      name: plan.name,
      durationMonths: plan.durationMonths,
      price: plan.price / 100,
      originalPrice: (plan.originalPrice || 0) / 100,
      discount: plan.discount || 0,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      features: plan.features.join('\n'),
      sortOrder: plan.sortOrder,
      workbookPrice: (plan.workbookPrice || 0) / 100,
      workbookNote: plan.workbookNote || 'inclusive of shipping',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.classId || !formData.name || formData.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        classId: parseInt(formData.classId),
        name: formData.name,
        durationMonths: formData.durationMonths,
        price: Math.round(formData.price * 100),
        originalPrice: formData.originalPrice > 0 ? Math.round(formData.originalPrice * 100) : null,
        discount: formData.discount > 0 ? formData.discount : null,
        isActive: formData.isActive,
        isPopular: formData.isPopular,
        features: formData.features.split('\n').filter(f => f.trim()),
        sortOrder: formData.sortOrder,
        workbookPrice: formData.workbookPrice > 0 ? Math.round(formData.workbookPrice * 100) : null,
        workbookNote: formData.workbookNote || null,
      };

      const url = editingPlan
        ? `/api/admin/pricing/${editingPlan.id}`
        : '/api/admin/pricing';

      const res = await fetch(url, {
        method: editingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }

      toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete "${planName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/pricing/${planId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Plan deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const toggleActive = async (plan: PricingPlan) => {
    try {
      const res = await fetch(`/api/admin/pricing/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      console.error('Error toggling plan:', error);
      toast.error('Failed to update plan');
    }
  };

  // Group plans by program
  const plansByProgram = plans.reduce((acc, plan) => {
    const programId = plan.classId;
    if (!acc[programId]) {
      acc[programId] = {
        program: plan.class,
        plans: []
      };
    }
    acc[programId].plans.push(plan);
    return acc;
  }, {} as Record<number, { program: { id: number; name: string; slug: string }; plans: PricingPlan[] }>);

  // Add programs with no plans
  programs.forEach(program => {
    if (!plansByProgram[program.id]) {
      plansByProgram[program.id] = {
        program: { id: program.id, name: program.name, slug: program.slug },
        plans: []
      };
    }
  });

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-theo-white/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-theo-black tracking-tight mb-2">
                Pricing Plans
              </h1>
              <p className="text-gray-500 font-medium text-lg">Manage subscription layouts and pricing strategy</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={fetchData} variant="outline" disabled={loading} className="rounded-2xl h-11 px-6">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={openCreateDialog} variant="theo" className="rounded-2xl h-11 px-6 shadow-lg shadow-theo-yellow/20">
                <Plus className="h-5 w-5 mr-2" />
                Add New Plan
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {Object.values(plansByProgram).map(({ program, plans: programPlans }) => (
              <Card key={program.id} className="border-0 shadow-sm rounded-[32px] overflow-hidden hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-theo-black text-theo-yellow p-8 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold uppercase tracking-tight">
                      <Tag className="h-6 w-6" />
                      {program.name}
                    </CardTitle>
                    <p className="text-theo-yellow/60 text-xs font-medium mt-1 uppercase tracking-widest">
                      {programPlans.length} PRICING PLAN(S) CONFIGURED
                    </p>
                  </div>
                  <Button onClick={() => {
                    setEditingPlan(null);
                    setFormData({
                      classId: program.id.toString(),
                      name: '3 Months',
                      durationMonths: 3,
                      price: 0,
                      originalPrice: 0,
                      discount: 0,
                      isActive: true,
                      isPopular: false,
                      features: '',
                      sortOrder: programPlans.length,
                      workbookPrice: 0,
                      workbookNote: 'inclusive of shipping',
                    });
                    setDialogOpen(true);
                  }} variant="theo" size="sm" className="rounded-xl h-10 px-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Plan
                  </Button>
                </CardHeader>
                <CardContent>
                  {programPlans.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-0 hover:bg-transparent">
                          <TableHead className="text-theo-black font-bold uppercase tracking-widest text-[10px] py-4">Plan Name</TableHead>
                          <TableHead className="text-theo-black font-bold uppercase tracking-widest text-[10px] py-4">Duration</TableHead>
                          <TableHead className="text-theo-black font-bold uppercase tracking-widest text-[10px] py-4">Current Price</TableHead>
                          <TableHead className="text-theo-black font-bold uppercase tracking-widest text-[10px] py-4">Original Price</TableHead>
                          <TableHead className="text-theo-black font-bold uppercase tracking-widest text-[10px] py-4">Status</TableHead>
                          <TableHead className="text-right text-theo-black font-bold uppercase tracking-widest text-[10px] py-4">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {programPlans.map(plan => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {plan.name}
                                {plan.isPopular && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    <Star className="h-3 w-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{plan.durationMonths} months</TableCell>
                            <TableCell className="font-bold text-theo-black text-lg py-6">
                              <div className="flex items-center">
                                <IndianRupee className="h-4 w-4 mr-1 text-theo-black" />
                                {(plan.price / 100).toLocaleString('en-IN')}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-400 font-medium py-6">
                              {plan.originalPrice ? (
                                <div className="flex items-center line-through">
                                  <IndianRupee className="h-3 w-3" />
                                  {(plan.originalPrice / 100).toLocaleString('en-IN')}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={plan.isActive}
                                  onCheckedChange={() => toggleActive(plan)}
                                />
                                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                                  {plan.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(plan)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDelete(plan.id, plan.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No pricing plans configured for this program.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {Object.keys(plansByProgram).length === 0 && (
              <div className="text-center py-8">
                <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Programs Found</h3>
                <p className="text-muted-foreground mb-4">Create programs first to add pricing plans.</p>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Program *</Label>
                <Select
                  value={formData.classId}
                  onValueChange={v => setFormData({ ...formData, classId: v })}
                  disabled={!!editingPlan}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map(program => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., 3 Months"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (months) *</Label>
                  <Input
                    type="number"
                    value={formData.durationMonths}
                    onChange={e => setFormData({ ...formData, durationMonths: parseInt(e.target.value) || 0 })}
                    min={1}
                    disabled={!!editingPlan}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    min={0}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                    min={0}
                    step={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features (one per line)</Label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
                  value={formData.features}
                  onChange={e => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Full course access&#10;Certificate included&#10;24/7 support"
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={checked => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isPopular}
                    onCheckedChange={checked => setFormData({ ...formData, isPopular: checked })}
                  />
                  <Label>Popular</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingPlan ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
