'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  User,
  LogIn,
  LogOut,
  Play,
  CheckCircle,
  CreditCard,
  UserCheck,
  Eye,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface UserActivity {
  id: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'TOPIC_STARTED' | 'TOPIC_COMPLETED' | 'SUBSCRIPTION_CREATED' | 
          'SUBSCRIPTION_CANCELLED' | 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 
          'PROFILE_UPDATED' | 'CLASS_ACCESSED' | 'SUBJECT_ACCESSED';
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  created_at: string;
  user: {
    name?: string;
    email?: string;
    role?: string;
  };
}

interface ActivityStats {
  totalActivities: number;
  uniqueUsers: number;
  activitiesByAction: Record<string, number>;
  recentTrends: { date: string; count: number; }[];
  topUsers: { userId: string; userName: string; count: number; }[];
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    uniqueUsers: 0,
    activitiesByAction: {},
    recentTrends: [],
    topUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);
  const itemsPerPage = 50;

  useEffect(() => {
    loadActivities();
    loadStats();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/activities');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/activities/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading activity stats:', error);
    }
  };

  const getActionIcon = (action: string) => {
    const actionConfig = {
      LOGIN: { icon: LogIn, className: 'text-green-600' },
      LOGOUT: { icon: LogOut, className: 'text-gray-600' },
      TOPIC_STARTED: { icon: Play, className: 'text-blue-600' },
      TOPIC_COMPLETED: { icon: CheckCircle, className: 'text-green-600' },
      SUBSCRIPTION_CREATED: { icon: CreditCard, className: 'text-purple-600' },
      SUBSCRIPTION_CANCELLED: { icon: CreditCard, className: 'text-red-600' },
      PAYMENT_INITIATED: { icon: CreditCard, className: 'text-yellow-600' },
      PAYMENT_COMPLETED: { icon: CheckCircle, className: 'text-green-600' },
      PAYMENT_FAILED: { icon: CreditCard, className: 'text-red-600' },
      PROFILE_UPDATED: { icon: UserCheck, className: 'text-blue-600' },
      CLASS_ACCESSED: { icon: Eye, className: 'text-indigo-600' },
      SUBJECT_ACCESSED: { icon: Eye, className: 'text-cyan-600' },
    };
    const config = actionConfig[action as keyof typeof actionConfig] || { icon: Activity, className: 'text-gray-600' };
    const IconComponent = config.icon;
    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      LOGIN: { label: 'Login', className: 'bg-green-600 text-white font-bold' },
      LOGOUT: { label: 'Logout', className: 'bg-theo-black text-theo-yellow font-bold' },
      TOPIC_STARTED: { label: 'Topic Started', className: 'bg-theo-yellow text-theo-black font-bold' },
      TOPIC_COMPLETED: { label: 'Topic Completed', className: 'bg-theo-black text-theo-yellow font-bold border-2 border-theo-yellow/20' },
      SUBSCRIPTION_CREATED: { label: 'Subscription', className: 'bg-theo-yellow text-theo-black font-bold' },
      SUBSCRIPTION_CANCELLED: { label: 'Cancelled', className: 'bg-red-600 text-white font-bold' },
      PAYMENT_INITIATED: { label: 'Payment Started', className: 'bg-theo-yellow text-theo-black font-bold' },
      PAYMENT_COMPLETED: { label: 'Payment Success', className: 'bg-theo-black text-theo-yellow font-bold' },
      PAYMENT_FAILED: { label: 'Payment Failed', className: 'bg-red-600 text-white font-bold' },
      PROFILE_UPDATED: { label: 'Profile Updated', className: 'bg-theo-yellow text-theo-black font-bold' },
      CLASS_ACCESSED: { label: 'Class Accessed', className: 'bg-theo-black text-theo-yellow font-bold' },
      SUBJECT_ACCESSED: { label: 'Subject Accessed', className: 'bg-theo-black text-theo-yellow font-bold' },
    };
    const config = actionConfig[action as keyof typeof actionConfig] || { label: action, className: 'bg-white border-theo-black/10 text-theo-black' };
    return <Badge className={`rounded-full px-4 py-1 uppercase tracking-tighter text-[10px] ${config.className}`} variant="outline">{config.label}</Badge>;
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'ALL' || activity.action === actionFilter;
    const matchesUser = !userFilter || activity.userId.includes(userFilter) || 
                       activity.user.email?.includes(userFilter);
    
    return matchesSearch && matchesAction && matchesUser;
  });

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const uniqueActions = Array.from(new Set(activities.map(activity => activity.action))).sort();

  const exportActivities = async () => {
    try {
      const response = await fetch('/api/admin/activities/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `user-activities-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting activities:', error);
    }
  };

  return (
    <div className="p-8 bg-theo-white/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-theo-black tracking-tight mb-2">
                User Activities
              </h1>
              <p className="text-gray-500 font-medium text-lg">Monitor user actions and system engagement</p>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Activities</CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-theo-yellow/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6 text-theo-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-theo-black tracking-tighter">{stats.totalActivities}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">All user actions logged</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Active Users</CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-theo-black/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="h-6 w-6 text-theo-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-theo-black tracking-tighter">{stats.uniqueUsers}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Unique active participants</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group bg-theo-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-theo-yellow/50">Top Dynamic</CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-theo-yellow/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="h-6 w-6 text-theo-yellow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-theo-yellow uppercase tracking-tight">
              {Object.keys(stats.activitiesByAction).length > 0 
                ? Object.entries(stats.activitiesByAction)
                    .sort(([,a], [,b]) => b - a)[0][0]
                    .replace('_', ' ')
                : 'None'}
            </div>
            <p className="text-xs text-theo-yellow/50 font-medium mt-1">Most frequent user action</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-400">24H Velocity</CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-theo-yellow/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-theo-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-theo-black tracking-tighter">
              {stats.recentTrends.length > 0 ? stats.recentTrends[0].count : 0}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">Actions in last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Actions
            </span>
            <div className="flex gap-2">
              <Button onClick={loadActivities} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportActivities} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by description, user, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action Filter</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">User Filter</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="user"
                  placeholder="Filter by user ID or email..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Activities ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading activities...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Action</th>
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-left py-3 px-4 font-medium">IP Address</th>
                    <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActivities.map((activity) => (
                    <tr 
                      key={activity.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedActivity(activity)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getActionIcon(activity.action)}
                          {getActionBadge(activity.action)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{activity.user.name || 'Unknown User'}</div>
                          <div className="text-xs text-gray-500">{activity.user.email}</div>
                          {activity.user.role && (
                            <Badge variant="outline" className="text-xs">
                              {activity.user.role}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <div className="text-sm">{activity.description}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-mono text-gray-600">
                          {activity.ipAddress || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedActivity(activity);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredActivities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No activities found matching your criteria
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getActionIcon(selectedActivity.action)}
                  <h2 className="text-xl font-semibold">Activity Details</h2>
                  {getActionBadge(selectedActivity.action)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedActivity(null)}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Activity ID</Label>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedActivity.id}</div>
                  </div>
                  <div>
                    <Label className="font-medium">Timestamp</Label>
                    <div className="text-sm bg-gray-100 p-2 rounded">
                      {format(new Date(selectedActivity.created_at), 'PPpp')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">User ID</Label>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedActivity.userId}</div>
                  </div>
                  <div>
                    <Label className="font-medium">Session ID</Label>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {selectedActivity.sessionId || 'N/A'}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Description</Label>
                  <div className="text-sm bg-gray-100 p-3 rounded">{selectedActivity.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">IP Address</Label>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {selectedActivity.ipAddress || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">User Agent</Label>
                    <div className="text-xs bg-gray-100 p-2 rounded break-all">
                      {selectedActivity.userAgent || 'N/A'}
                    </div>
                  </div>
                </div>

                {selectedActivity.metadata && (
                  <div>
                    <Label className="font-medium">Metadata</Label>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <Label className="font-medium text-blue-800">User Information</Label>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-blue-700">Name:</span>
                        <span className="ml-2 text-sm">{selectedActivity.user.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-700">Email:</span>
                        <span className="ml-2 text-sm">{selectedActivity.user.email || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-700">Role:</span>
                      <span className="ml-2 text-sm">{selectedActivity.user.role || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}