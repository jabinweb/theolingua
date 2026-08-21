'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Users,
  CreditCard,
  UserCheck,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Layers,
  BarChart3,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { UniversalTopicForm } from '@/components/admin/UniversalTopicForm';
import { Badge } from '@/components/ui/badge';

interface Signup {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  timestamp: string;
}

interface Subscription {
  id: string;
  userId: string;
  paymentId: string;
  amount: number;
  status: string;
  created_at: string;
}

interface RegisteredUser {
  uid: string;
  email: string;
  displayName: string | null;
  creationTime: string;
  lastSignInTime: string | null;
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
}

interface TopicFormData {
  name: string;
  type: string;
  duration: string;
  orderIndex: number;
  chapterId: string;
  content?: {
    contentType: string;
    url?: string;
    videoUrl?: string;
    pdfUrl?: string;
    textContent?: string;
    widgetConfig?: Record<string, unknown>;
  };
}

interface StaffBatch {
  id: string;
  name: string;
  isDripEnabled?: boolean;
  class?: { id: number; name: string } | null;
  _count?: { students: number };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const loading = status === 'loading';
  const [signups, setSignups] = useState<Signup[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [topicFormOpen, setTopicFormOpen] = useState(false);
  const [staffBatches, setStaffBatches] = useState<StaffBatch[]>([]);
  const [staffBatchesLoading, setStaffBatchesLoading] = useState(true);

  const isAdmin = userRole === 'ADMIN';
  const isStaff = userRole === 'TEACHER' || userRole === 'MODERATOR';
  const isLoadingAuth = loading || (user && !userRole);

  useEffect(() => {
    if (isAdmin && !dataFetched && !isLoadingAuth) {
      const fetchData = async () => {
        setDataLoading(true);
        try {
          const [responsesResponse, subscriptionsResponse, usersResponse] = await Promise.all([
            fetch('/api/admin/responses'),
            fetch('/api/admin/subscriptions'),
            fetch('/api/admin/users'),
          ]);

          const responsesData = await responsesResponse.json();
          const subscriptionsData = await subscriptionsResponse.json();
          const usersData = await usersResponse.json();

          setSignups(Array.isArray(responsesData) ? responsesData : []);
          setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
          setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching admin data:', error);
          setSignups([]);
          setSubscriptions([]);
          setRegisteredUsers([]);
          setDataFetched(true);
        } finally {
          setDataLoading(false);
        }
      };

      fetchData();
    }
  }, [isAdmin, isLoadingAuth, dataFetched]);

  useEffect(() => {
    if (!isStaff || isLoadingAuth) return;

    const fetchBatches = async () => {
      setStaffBatchesLoading(true);
      try {
        const res = await fetch('/api/admin/batches');
        const data = await res.json();
        setStaffBatches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching batches:', error);
        setStaffBatches([]);
      } finally {
        setStaffBatchesLoading(false);
      }
    };

    fetchBatches();
  }, [isStaff, isLoadingAuth]);

  const refreshData = async () => {
    setDataLoading(true);
    try {
      const [responsesResponse, subscriptionsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/responses'),
        fetch('/api/admin/subscriptions'),
        fetch('/api/admin/users'),
      ]);

      const responsesData = await responsesResponse.json();
      const subscriptionsData = await subscriptionsResponse.json();
      const usersData = await usersResponse.json();

      setSignups(Array.isArray(responsesData) ? responsesData : []);
      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
      setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSignups([]);
      setSubscriptions([]);
      setRegisteredUsers([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleUniversalTopicSubmit = async (formData: TopicFormData) => {
    const response = await fetch('/api/admin/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error('Failed to add topic');
    }
  };


  if (isStaff) {
    const displayName = user?.name || (userRole === 'TEACHER' ? 'Teacher' : 'Moderator');
    const recentBatches = staffBatches.slice(0, 6);

    return (
      <div>
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold tracking-tighter text-theo-black md:text-3xl">
            Welcome, {displayName}
          </h1>
          <p className="text-gray-600">
            {userRole === 'TEACHER'
              ? 'Manage your batches and student delivery from here.'
              : 'You have limited staff access. Use batches to manage delivery.'}
          </p>
          {userRole === 'MODERATOR' && (
            <p className="mt-2 text-sm text-gray-500">
              Moderator access is limited to delivery tools. Platform settings, users, and commerce
              remain admin-only.
            </p>
          )}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-theo-black">
                <Layers className="mr-2 h-5 w-5" />
                Batches
              </CardTitle>
              <CardDescription>View and manage the batches assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="theo" className="h-9 px-4">
                <Link href="/admin/batches">
                  Open batches
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-theo-black">Quick tip</CardTitle>
              <CardDescription>
                {userRole === 'MODERATOR'
                  ? 'Use drip settings on a batch to control content release for students.'
                  : 'Open a batch to review students and content drip schedules.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {staffBatchesLoading
                  ? 'Loading your batches…'
                  : `${staffBatches.length} batch${staffBatches.length === 1 ? '' : 'es'} available`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden rounded-[32px] border-0 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 p-6">
            <CardTitle className="flex items-center text-lg font-bold uppercase tracking-tight text-theo-black">
              <Layers className="mr-3 h-5 w-5" />
              Recent Batches
            </CardTitle>
            <CardDescription className="text-xs font-medium text-gray-500">
              Jump into a batch or its drip schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {staffBatchesLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-theo-black" />
              </div>
            ) : recentBatches.length === 0 ? (
              <div className="py-10 text-center">
                <Layers className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No batches found</p>
                <Button asChild variant="outline" className="mt-4 h-9 px-4">
                  <Link href="/admin/batches">Go to batches</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="flex flex-col gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-theo-black">{batch.name}</p>
                      <p className="text-sm text-gray-500">
                        {batch.class?.name || 'No program'}
                        {typeof batch._count?.students === 'number'
                          ? ` · ${batch._count.students} students`
                          : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {batch.isDripEnabled && (
                        <Badge className="bg-theo-yellow/20 text-theo-black hover:bg-theo-yellow/20">
                          Drip on
                        </Badge>
                      )}
                      <Button asChild variant="outline" size="sm" className="h-8">
                        <Link href="/admin/batches">View</Link>
                      </Button>
                      <Button asChild variant="theo" size="sm" className="h-8">
                        <Link href={`/admin/batches/${batch.id}/drip`}>
                          <Zap className="mr-1 h-3.5 w-3.5" />
                          Drip
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {staffBatches.length > recentBatches.length && (
                  <div className="pt-2">
                    <Button asChild variant="ghost" className="h-9 px-0 text-sm font-semibold">
                      <Link href="/admin/batches">
                        View all batches
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-theo-black border-t-transparent"></div>
      </div>
    );
  }

  const activeSubscriptions = Array.isArray(subscriptions)
    ? subscriptions.filter((s) => s.status === 'ACTIVE')
    : [];
  const totalRevenue = Array.isArray(subscriptions)
    ? subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)
    : 0;
  const monthlyRevenue = Array.isArray(subscriptions)
    ? subscriptions
        .filter((s) => new Date(s.created_at).getMonth() === new Date().getMonth())
        .reduce((sum, s) => sum + (s.amount || 0), 0)
    : 0;

  const todayRegistrations = registeredUsers.filter(
    (u) => new Date(u.creationTime).toDateString() === new Date().toDateString()
  ).length;

  const weeklyRegistrations = registeredUsers.filter((u) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(u.creationTime) >= weekAgo;
  }).length;

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-2xl font-bold tracking-tighter text-theo-black md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Platform statistics and management</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={refreshData} disabled={dataLoading} variant="outline" className="h-9 px-4">
              <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setTopicFormOpen(true)} variant="theo" className="h-9 px-4">
              <Plus className="h-5 w-5 mr-2" />
              Add Topic
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="admin-stats-grid">
        <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Total Users
            </CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-theo-yellow/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-theo-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-theo-black tracking-tighter">
              {registeredUsers.length}
            </div>
            <p className="text-[10px] text-theo-black font-bold mt-2 flex items-center bg-theo-yellow w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <TrendingUp className="h-3 w-3 mr-1" />+{todayRegistrations} today
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Active subscriptions</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-theo-yellow/20">
              <UserCheck className="h-5 w-5 text-theo-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-theo-black">
              {activeSubscriptions.length}
            </div>
            <p className="text-[10px] text-theo-yellow/50 font-bold mt-2 uppercase tracking-tighter">
              {((activeSubscriptions.length / (registeredUsers.length || 1)) * 100).toFixed(1)}%
              conversion
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Total Revenue
            </CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-theo-black/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="h-6 w-6 text-theo-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-theo-black tracking-tighter">
              ₹{(totalRevenue / 100).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-2">
              ₹{(totalRevenue / (registeredUsers.length || 1) / 100).toFixed(0)} per user
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Monthly
            </CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-theo-yellow flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6 text-theo-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-theo-black tracking-tighter">
              ₹{(monthlyRevenue / 100).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-2">
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-500" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-600">New Registrations</span>
                <Badge variant="secondary">{weeklyRegistrations}</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-600">User Activities</span>
                <Badge variant="secondary">
                  {
                    signups.filter((s) => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(s.timestamp) >= weekAgo;
                    }).length
                  }
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
              Subscription Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-600">Total Subscriptions</span>
                <Badge variant="secondary">{subscriptions.length}</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-600">Avg. Subscription Value</span>
                <Badge variant="secondary">
                  ₹
                  {subscriptions.length > 0
                    ? (totalRevenue / subscriptions.length / 100).toFixed(0)
                    : 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-green-500" />
              Today&apos;s Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-600">New Users</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  {todayRegistrations}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-600">New Subscriptions</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  {
                    subscriptions.filter(
                      (s) => new Date(s.created_at).toDateString() === new Date().toDateString()
                    ).length
                  }
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow overflow-hidden border-0 shadow-sm rounded-[32px]">
          <CardHeader className="border-b border-gray-200 bg-white p-6 text-theo-black">
            <CardTitle className="flex items-center text-lg font-bold uppercase tracking-tight">
              <Users className="h-5 w-5 mr-3" />
              Recent Registrations
            </CardTitle>
            <CardDescription className="text-theo-yellow/60 text-xs font-medium">
              Latest users who joined the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {registeredUsers.slice(0, 5).map((registeredUser) => (
                <div
                  key={registeredUser.uid}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                      {(registeredUser.displayName || registeredUser.email || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {registeredUser.displayName || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500">{registeredUser.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(registeredUser.creationTime).toLocaleDateString()}
                    </p>
                    {registeredUser.hasActiveSubscription && (
                      <Badge className="mt-1 bg-green-100 text-green-700 border-green-200">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {registeredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow overflow-hidden border-0 shadow-sm rounded-[32px]">
          <CardHeader className="border-b border-gray-200 bg-white p-6 text-theo-black">
            <CardTitle className="flex items-center text-lg font-bold uppercase tracking-tight">
              <CreditCard className="h-5 w-5 mr-3" />
              Recent Subscriptions
            </CardTitle>
            <CardDescription className="text-theo-yellow/60 text-xs font-medium">
              Latest subscription payments received
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {subscriptions.slice(0, 5).map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        ₹{((subscription.amount || 0) / 100).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {subscription.userId.slice(0, 12)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </p>
                    <Badge
                      className={
                        subscription.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {subscriptions.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No subscriptions found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <UniversalTopicForm
        isOpen={topicFormOpen}
        onClose={() => setTopicFormOpen(false)}
        onSubmit={handleUniversalTopicSubmit}
      />
    </div>
  );
}
