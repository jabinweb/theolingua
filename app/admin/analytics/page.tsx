'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';

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

export default function SubscriptionAnalyticsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role; // Get actual role from session
  const loading = status === 'loading';
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState('30');

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = loading || (user && userRole === null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
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

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, isLoadingAuth, user, userRole, timePeriod, fetchAnalytics]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#FFD700', '#1A1A1A', '#333333', '#666666', '#E5E5E5']; // Theo Yellow, Black, Dark Gray, Mid Gray, Light Gray

  return (
    <div className="p-8 bg-theo-white/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-theo-black tracking-tight mb-2">
                Subscription Analytics
              </h1>
              <p className="text-gray-500 font-medium text-lg">Monitor growth, churn and revenue velocity</p>
            </div>
            <div className="flex items-center gap-4">
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
              <Button onClick={fetchAnalytics} variant="outline" disabled={isLoading} className="rounded-2xl h-11 px-6">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
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
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading analytics...</p>
          </div>
        ) : analyticsData ? (
          <div className="space-y-6">
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="bg-theo-black border-0 shadow-xl rounded-[32px] overflow-hidden group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-theo-yellow/70 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Base
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-theo-yellow tracking-tighter">{analyticsData.overview.totalSubscriptions.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-theo-yellow/50 text-xs font-bold mt-2 uppercase">
                    {analyticsData.overview.growthRate >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(analyticsData.overview.growthRate)}% Growth Rate
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-theo-yellow border-0 shadow-xl rounded-[32px] overflow-hidden group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-theo-black/50 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Active Pulse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-theo-black tracking-tighter">{analyticsData.overview.activeSubscriptions.toLocaleString()}</div>
                  <div className="text-theo-black/50 text-xs font-bold mt-2 uppercase">
                    {((analyticsData.overview.activeSubscriptions / analyticsData.overview.totalSubscriptions) * 100).toFixed(1)}% Conversion
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm rounded-[32px] overflow-hidden group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-theo-yellow" />
                    Renewal Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-theo-black tracking-tighter">{analyticsData.overview.expiringSubscriptions.toLocaleString()}</div>
                  <div className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">Next 7 days</div>
                </CardContent>
              </Card>

              <Card className="bg-theo-black border-0 shadow-xl rounded-[32px] overflow-hidden group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-theo-yellow/70 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-theo-yellow tracking-tighter">₹{analyticsData.overview.totalRevenue.toLocaleString()}</div>
                  <div className="text-theo-yellow/50 text-xs font-bold mt-2 uppercase">ARPU: ₹{analyticsData.overview.arpu}</div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Metrics */}
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Subscription Trends */}
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

              {/* Revenue Trends */}
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

            {/* Subscription Types */}
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
      </div>
    </div>
  );
}