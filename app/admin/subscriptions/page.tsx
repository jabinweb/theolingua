'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, AlertCircle, Search, Crown, Calendar, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

interface Program {
  id: number;
  name: string;
}

interface Batch {
  id: string;
  name: string;
  classId: number;
  class: { id: number; name: string };
}

interface Subscription {
  id: string;
  userId: string;
  paymentId: string;
  amount: number;
  status: string;
  created_at: string;
  planType: string;
  planName?: string;
  class?: { id: number; name: string } | null;
  subject?: { id: string; name: string } | null;
}

interface RegisteredUser {
  uid: string;
  email: string;
  displayName: string | null;
  creationTime: string;
  lastSignInTime: string | null;
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  photoUrl?: string;
}

function resetGrantForm() {
  return {
    userId: '',
    batchId: '',
    selectedProgramIds: [] as number[],
    status: 'ACTIVE',
  };
}

export default function SubscriptionsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const loading = status === 'loading';
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState(resetGrantForm());
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = loading || (user && userRole === null);
  const allProgramIds = programs.map((p) => p.id);
  const allSelected =
    allProgramIds.length > 0 && allProgramIds.every((id) => form.selectedProgramIds.includes(id));

  useEffect(() => {
    if (!showCreateModal) return;

    Promise.all([
      fetch('/api/admin/programs').then((res) => res.json()),
      fetch('/api/admin/batches').then((res) => res.json()),
    ]).then(([programsData, batchesData]) => {
      setPrograms(Array.isArray(programsData) ? programsData : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
    });
  }, [showCreateModal]);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin && !dataFetched) {
      const fetchData = async () => {
        setDataLoading(true);
        try {
          const [subscriptionsResponse, usersResponse] = await Promise.all([
            fetch('/api/admin/subscriptions'),
            fetch('/api/admin/users'),
          ]);

          const subscriptionsData = await subscriptionsResponse.json();
          const usersData = await usersResponse.json();

          setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
          setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching subscription data:', error);
          setSubscriptions([]);
          setRegisteredUsers([]);
          setDataFetched(true);
        } finally {
          setDataLoading(false);
        }
      };

      fetchData();
    } else if (!isLoadingAuth && !user) {
      setDataLoading(false);
    } else if (!isLoadingAuth && userRole !== 'ADMIN') {
      setDataLoading(false);
    }
  }, [isAdmin, isLoadingAuth, dataFetched, user, userRole]);

  const toggleProgram = (programId: number, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      selectedProgramIds: checked
        ? [...new Set([...prev.selectedProgramIds, programId])]
        : prev.selectedProgramIds.filter((id) => id !== programId),
    }));
  };

  const toggleAllPrograms = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      selectedProgramIds: checked ? [...allProgramIds] : [],
    }));
  };

  const handleBatchChange = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    setForm((prev) => {
      const next = { ...prev, batchId: batchId === 'none' ? '' : batchId };
      if (batch && batchId !== 'none') {
        next.selectedProgramIds = [...new Set([...prev.selectedProgramIds, batch.classId])];
      }
      return next;
    });
  };

  const updateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, status: newStatus }),
      });

      if (response.ok) {
        setSubscriptions((prev) =>
          prev.map((sub) => (sub.id === subscriptionId ? { ...sub, status: newStatus } : sub))
        );
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const deleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      const response = await fetch(`/api/admin/subscriptions?id=${subscriptionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSubscriptions((prev) => prev.filter((sub) => sub.id !== subscriptionId));
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  const refreshData = async () => {
    setDataLoading(true);
    try {
      const [subscriptionsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/subscriptions'),
        fetch('/api/admin/users'),
      ]);

      const subscriptionsData = await subscriptionsResponse.json();
      const usersData = await usersResponse.json();

      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
      setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSubscriptions([]);
      setRegisteredUsers([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (!form.userId) {
        throw new Error('Select a user');
      }
      if (!form.batchId && form.selectedProgramIds.length === 0) {
        throw new Error('Select at least one program or assign a batch');
      }

      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId,
          classIds: form.selectedProgramIds,
          batchId: form.batchId || undefined,
          amount: 0,
          status: form.status,
          planType: 'CLASS',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to grant access');
      }

      setShowCreateModal(false);
      setForm(resetGrantForm());
      refreshData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to grant access');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    if (!searchTerm.trim()) return subscriptions;

    const searchLower = searchTerm.toLowerCase();
    return subscriptions.filter((subscription) => {
      const subUser = registeredUsers.find((u) => u.uid === subscription.userId);
      return (
        subUser?.displayName?.toLowerCase().includes(searchLower) ||
        subUser?.email?.toLowerCase().includes(searchLower) ||
        subscription.status.toLowerCase().includes(searchLower) ||
        subscription.paymentId.toLowerCase().includes(searchLower) ||
        subscription.class?.name?.toLowerCase().includes(searchLower) ||
        subscription.subject?.name?.toLowerCase().includes(searchLower) ||
        subscription.planName?.toLowerCase().includes(searchLower)
      );
    });
  }, [subscriptions, searchTerm, registeredUsers]);

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-theo-black border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-bold">Authentication Required</h1>
          <p className="text-sm text-muted-foreground">Please sign in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-xl font-bold">Access Denied</h1>
          <p className="text-sm text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-theo-black border-t-transparent" />
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE');
  const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Subscription Management"
        description="Grant program access, assign batches, and manage subscriptions."
        actions={
          <>
            <Button onClick={() => setShowCreateModal(true)} variant="theo" size="sm" className="font-semibold">
              Grant Access
            </Button>
            <Button onClick={refreshData} disabled={dataLoading} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </>
        }
      />

      <Dialog
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) {
            setForm(resetGrantForm());
            setFormError('');
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grant Access</DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleGrantAccess} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="grant-user">User</Label>
              <Select
                value={form.userId}
                onValueChange={(value) => setForm((prev) => ({ ...prev, userId: value }))}
              >
                <SelectTrigger id="grant-user">
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {registeredUsers.map((u) => (
                    <SelectItem key={u.uid} value={u.uid}>
                      {u.displayName || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grant-batch">Batch (optional)</Label>
              <Select value={form.batchId || 'none'} onValueChange={handleBatchChange}>
                <SelectTrigger id="grant-batch">
                  <SelectValue placeholder="No batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No batch</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} — {batch.class.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Batch assignment enables drip scheduling for that program.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Programs</Label>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                  <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleAllPrograms(checked === true)} />
                  Select all
                </label>
              </div>
              <div className="space-y-2 rounded-md border border-gray-200 p-3">
                {programs.length === 0 ? (
                  <p className="text-sm text-gray-500">No programs found.</p>
                ) : (
                  programs.map((program) => (
                    <label key={program.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={form.selectedProgramIds.includes(program.id)}
                        onCheckedChange={(checked) => toggleProgram(program.id, checked === true)}
                      />
                      <span>{program.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grant-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="grant-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" size="sm" disabled={formLoading}>
              {formLoading ? 'Saving...' : 'Grant Access'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="mb-4 border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by user, email, program, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="admin-stats-grid">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl font-bold">{subscriptions.length}</div>
            {searchTerm && (
              <p className="text-xs text-muted-foreground">{filteredSubscriptions.length} matching</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl font-bold">{activeSubscriptions.length}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Revenue</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl font-bold">₹{Math.round(totalRevenue / 100).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="admin-card-grid">
        {filteredSubscriptions.map((subscription) => {
          const subscriptionUser = registeredUsers.find((u) => u.uid === subscription.userId);
          const isActive = subscription.status === 'ACTIVE';

          return (
            <Card key={subscription.id} className="border border-gray-200 shadow-sm">
              <CardHeader className={`px-3 py-3 ${isActive ? 'bg-theo-yellow/5' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {subscriptionUser?.photoUrl && (
                        <AvatarImage src={subscriptionUser.photoUrl} alt={subscriptionUser.displayName || 'User'} />
                      )}
                      <AvatarFallback className="text-xs font-semibold">
                        {subscriptionUser?.displayName?.[0] || subscriptionUser?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">
                        {subscriptionUser?.displayName || 'Anonymous User'}
                      </h3>
                      <p className="truncate text-xs text-gray-500">{subscriptionUser?.email}</p>
                    </div>
                  </div>
                  <Badge variant={isActive ? 'theo' : 'secondary'} className="shrink-0 text-[10px]">
                    {subscription.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1.5">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-semibold">₹{subscription.amount / 100}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(subscription.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {subscription.class && (
                  <div className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1.5 text-xs">
                    <span className="font-medium">{subscription.class.name}</span>
                    {subscription.subject && (
                      <span className="text-gray-500"> · {subscription.subject.name}</span>
                    )}
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant={isActive ? 'theo' : 'outline'}
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => updateSubscriptionStatus(subscription.id, 'ACTIVE')}
                    disabled={isActive}
                  >
                    Active
                  </Button>
                  <Button
                    variant={subscription.status === 'INACTIVE' ? 'theo-black' : 'outline'}
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => updateSubscriptionStatus(subscription.id, 'INACTIVE')}
                    disabled={subscription.status === 'INACTIVE'}
                  >
                    Inactive
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 w-full text-xs"
                  onClick={() => deleteSubscription(subscription.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSubscriptions.length === 0 && (
        <Card className="mt-4 border-gray-200 p-8 text-center shadow-sm">
          <Crown className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="text-base font-medium text-gray-600">
            {searchTerm ? 'No matching subscriptions' : 'No subscriptions yet'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm ? `Nothing matches "${searchTerm}"` : 'Use Grant Access to add program access for a user.'}
          </p>
        </Card>
      )}
    </div>
  );
}
