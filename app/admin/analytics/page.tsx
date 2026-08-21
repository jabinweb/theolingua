'use client';

import { ContentLoader } from '@/components/ui/content-loader';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  DollarSign,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Activity,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TopPerformer {
  classId: string;
  subjectId: string;
  count: number;
}

interface AnalyticsData {
  overview: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    graceSubscriptions: number;
    recentSubscriptions: number;
    expiringSubscriptions: number;
    growthRate: number;
    churnRate: number;
    totalRevenue: number;
    arpu: number;
  };
  charts: {
    subscriptionsByStatus: Array<{ status: string; count: number; percentage: number }>;
    subscriptionsByType: Array<{ type: string; count: number; percentage: number }>;
    dailyData: Array<{
      date: string;
      newSubscriptions: number;
      dailyRevenue: number;
      expiredSubscriptions: number;
    }>;
  };
  insights: {
    topPerformers: TopPerformer[];
    churnData: number;
    revenueGrowth: number;
    customerLifetimeValue: number;
  };
}

interface LearningAnalyticsData {
  overview: {
    totalStudents: number;
    activeLearners: number;
    topicsCompleted: number;
    totalProgressRows: number;
    avgCompletionRate: number;
    totalTimeSpentMinutes: number;
    periodDays: number;
  };
  topTopics: Array<{
    topicId: string;
    topicName: string;
    chapterName: string;
    programName: string;
    completions: number;
  }>;
  programCompletion: Array<{
    id: number;
    name: string;
    topicCount: number;
    completions: number;
    uniqueLearners: number;
  }>;
  recentCompletions: Array<{
    id: string;
    userName: string;
    userEmail: string | null;
    topicName: string;
    completedAt: string | null;
  }>;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

function formatCompletedAt(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SubscriptionAnalyticsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const loading = status === 'loading';
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'learning'>('subscriptions');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [learningData, setLearningData] = useState<LearningAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLearningLoading, setIsLearningLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learningError, setLearningError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState('30');
  const [learningPeriod, setLearningPeriod] = useState('30');

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = loading || (user && userRole === null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/analytics/subscriptions?period=${timePeriod}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      setAnalyticsData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [timePeriod]);

  const fetchLearningAnalytics = useCallback(async () => {
    try {
      setIsLearningLoading(true);
      setLearningError(null);
      const response = await fetch(`/api/admin/analytics/learning?period=${learningPeriod}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch learning analytics');
      }

      setLearningData(data);
    } catch (err) {
      setLearningError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLearningLoading(false);
    }
  }, [learningPeriod]);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, isLoadingAuth, user, userRole, timePeriod, fetchAnalytics]);

  useEffect(() => {
    if (isAdmin && activeTab === 'learning') {
      fetchLearningAnalytics();
    }
  }, [isAdmin, activeTab, learningPeriod, fetchLearningAnalytics]);


  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#FFD700', '#1A1A1A', '#333333', '#666666', '#E5E5E5'];

  return (
    <div className="min-w-0">
      <div className="min-w-0 w-full">
        <div className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-theo-black sm:text-2xl mb-1">
                Analytics
              </h1>
              <p className="text-sm text-gray-600 sm:text-base">
                Monitor subscriptions and learning engagement
              </p>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'subscriptions' | 'learning')}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white border border-theo-black/10 p-1.5 h-12 rounded-2xl shadow-sm">
            <TabsTrigger
              value="subscriptions"
              className="rounded-xl data-[state=active]:bg-theo-yellow data-[state=active]:text-theo-black font-semibold text-gray-500"
            >
              Subscriptions
            </TabsTrigger>
            <TabsTrigger
              value="learning"
              className="rounded-xl data-[state=active]:bg-theo-yellow data-[state=active]:text-theo-black font-semibold text-gray-500"
            >
              Learning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-6 mt-0">
            <div className="flex items-center justify-end gap-4">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[180px] rounded-2xl h-11 border-theo-black/10 bg-white">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-theo-black/10">
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchAnalytics} variant="outline" disabled={isLoading} className="h-9 px-4">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <ContentLoader variant="page" message="Loading analytics..." />
            ) : analyticsData ? (
              <div className="space-y-6">
                <div className="admin-stats-grid">
                  <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Users className="h-4 w-4" />
                        Total subscriptions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tighter text-theo-black">{analyticsData.overview.totalSubscriptions.toLocaleString()}</div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        {analyticsData.overview.growthRate >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(analyticsData.overview.growthRate)}% growth rate
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-2xl border border-theo-yellow/40 bg-theo-yellow/10 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <UserCheck className="h-4 w-4" />
                        Active subscriptions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tighter text-theo-black">{analyticsData.overview.activeSubscriptions.toLocaleString()}</div>
                      <div className="mt-2 text-xs text-gray-600">
                        {((analyticsData.overview.activeSubscriptions / analyticsData.overview.totalSubscriptions) * 100).toFixed(1)}% conversion
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Clock className="h-4 w-4 text-theo-black" />
                        Expiring soon
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tighter text-theo-black">{analyticsData.overview.expiringSubscriptions.toLocaleString()}</div>
                      <div className="mt-2 text-xs text-gray-500">Next 7 days</div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <DollarSign className="h-4 w-4" />
                        Total revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tighter text-theo-black">₹{analyticsData.overview.totalRevenue.toLocaleString()}</div>
                      <div className="mt-2 text-xs text-gray-500">ARPU: ₹{analyticsData.overview.arpu}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <UserX className="h-4 w-4 text-red-500" />
                        Churn Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{analyticsData.overview.churnRate}%</div>
                      <p className="text-sm text-muted-foreground">Users who cancelled or expired</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-yellow-500" />
                        Grace Period
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{analyticsData.overview.graceSubscriptions}</div>
                      <p className="text-sm text-muted-foreground">Subscriptions in grace period</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        New Subscriptions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{analyticsData.overview.recentSubscriptions}</div>
                      <p className="text-sm text-muted-foreground">In selected period</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="p-8 pb-0">
                      <CardTitle className="flex items-center gap-3 text-2xl font-bold text-theo-black">
                        <div className="h-10 w-10 rounded-2xl bg-theo-yellow/10 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-theo-black" />
                        </div>
                        Growth Velocity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analyticsData.charts.dailyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} dx={-10} />
                            <Tooltip 
                              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}}
                              itemStyle={{fontWeight: 700, fontSize: '12px'}}
                            />
                            <Line type="monotone" dataKey="newSubscriptions" stroke="#FFD700" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} name="Acquisitions" />
                            <Line type="monotone" dataKey="expiredSubscriptions" stroke="#1A1A1A" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Attrition" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="p-8 pb-0">
                      <CardTitle className="flex items-center gap-3 text-2xl font-bold text-theo-black">
                        <div className="h-10 w-10 rounded-2xl bg-theo-black/5 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-theo-black" />
                        </div>
                        Daily Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.charts.dailyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} dx={-10} />
                            <Tooltip 
                              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}}
                              formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                            />
                            <Bar dataKey="dailyRevenue" fill="#FFD700" radius={[8, 8, 0, 0]} name="Volume" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.charts.subscriptionsByType.map((item, index) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium capitalize">{item.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{item.count}</span>
                            <Badge variant="outline">{item.percentage}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="learning" className="space-y-6 mt-0">
            <div className="flex items-center justify-end gap-4">
              <Select value={learningPeriod} onValueChange={setLearningPeriod}>
                <SelectTrigger className="w-[180px] rounded-2xl h-11 border-theo-black/10 bg-white">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-theo-black/10">
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchLearningAnalytics} variant="outline" disabled={isLearningLoading} className="h-9 px-4">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLearningLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {learningError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{learningError}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLearningLoading ? (
              <ContentLoader variant="page" message="Loading learning analytics..." />
            ) : learningData ? (
              <div className="space-y-6">
                <div className="admin-stats-grid">
                  <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <GraduationCap className="h-4 w-4" />
                        Total students
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tighter text-theo-black">
                        {learningData.overview.totalStudents.toLocaleString()}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">Role: STUDENT</div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-2xl border border-theo-yellow/40 bg-theo-yellow/10 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <UserCheck className="h-4 w-4" />
                        Active learners
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tighter text-theo-black">
                        {learningData.overview.activeLearners.toLocaleString()}
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Last {learningData.overview.periodDays} days
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <CheckCircle2 className="h-4 w-4 text-theo-black" />
                        Topics completed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tighter text-theo-black">
                        {learningData.overview.topicsCompleted.toLocaleString()}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        of {learningData.overview.totalProgressRows.toLocaleString()} progress rows
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Timer className="h-4 w-4" />
                        Time spent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tighter text-theo-black">
                        {formatMinutes(learningData.overview.totalTimeSpentMinutes)}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Avg completion {learningData.overview.avgCompletionRate}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="p-8 pb-0">
                      <CardTitle className="flex items-center gap-3 text-2xl font-bold text-theo-black">
                        <div className="h-10 w-10 rounded-2xl bg-theo-yellow/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-theo-black" />
                        </div>
                        Top topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="h-80">
                        {learningData.topTopics.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={learningData.topTopics}
                              layout="vertical"
                              margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                              <YAxis
                                type="category"
                                dataKey="topicName"
                                width={120}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 600 }}
                              />
                              <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                formatter={(value) => [Number(value).toLocaleString(), 'Completions']}
                                labelFormatter={(_, payload) => {
                                  const item = payload?.[0]?.payload as LearningAnalyticsData['topTopics'][number] | undefined;
                                  if (!item) return '';
                                  return `${item.topicName} · ${item.chapterName}`;
                                }}
                              />
                              <Bar dataKey="completions" fill="#FFD700" radius={[0, 8, 8, 0]} name="Completions" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-sm text-gray-500">
                            No topic completions yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="p-8 pb-0">
                      <CardTitle className="flex items-center gap-3 text-2xl font-bold text-theo-black">
                        <div className="h-10 w-10 rounded-2xl bg-theo-black/5 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-theo-black" />
                        </div>
                        Program completion
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="h-80">
                        {learningData.programCompletion.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={learningData.programCompletion}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dx={-10} />
                              <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                              />
                              <Bar dataKey="completions" fill="#FFD700" radius={[8, 8, 0, 0]} name="Completions" />
                              <Bar dataKey="uniqueLearners" fill="#1A1A1A" radius={[8, 8, 0, 0]} name="Learners" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-sm text-gray-500">
                            No programs found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-theo-black">Top topics by completions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {learningData.topTopics.length === 0 ? (
                          <p className="text-sm text-gray-500">No completions recorded</p>
                        ) : (
                          learningData.topTopics.map((topic, index) => (
                            <div key={topic.topicId} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                                  <span className="font-semibold text-theo-black truncate">{topic.topicName}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {topic.chapterName} · {topic.programName}
                                </p>
                              </div>
                              <Badge variant="outline" className="shrink-0 border-theo-yellow/50 bg-theo-yellow/10 text-theo-black">
                                {topic.completions}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-theo-black">Recent completions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {learningData.recentCompletions.length === 0 ? (
                          <p className="text-sm text-gray-500">No recent completions</p>
                        ) : (
                          learningData.recentCompletions.map((row) => (
                            <div key={row.id} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                              <div className="min-w-0">
                                <p className="font-semibold text-theo-black truncate">{row.userName}</p>
                                <p className="text-xs text-gray-500 truncate">{row.userEmail || 'No email'}</p>
                                <p className="text-xs text-gray-600 mt-1 truncate">{row.topicName}</p>
                              </div>
                              <span className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap">
                                {formatCompletedAt(row.completedAt)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-theo-black">Programs overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                            <th className="pb-3 pr-4 font-semibold">Program</th>
                            <th className="pb-3 pr-4 font-semibold">Topics</th>
                            <th className="pb-3 pr-4 font-semibold">Completions</th>
                            <th className="pb-3 font-semibold">Unique learners</th>
                          </tr>
                        </thead>
                        <tbody>
                          {learningData.programCompletion.map((program) => (
                            <tr key={program.id} className="border-b border-gray-50 last:border-0">
                              <td className="py-3 pr-4 font-medium text-theo-black">{program.name}</td>
                              <td className="py-3 pr-4 text-gray-600">{program.topicCount}</td>
                              <td className="py-3 pr-4 text-gray-600">{program.completions}</td>
                              <td className="py-3 text-gray-600">{program.uniqueLearners}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
