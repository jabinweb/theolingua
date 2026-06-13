import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, GraduationCap, Clock, CheckCircle2, History, CreditCard, Activity } from 'lucide-react';
import Link from 'next/link';

export default async function UserAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== 'ADMIN' && role !== 'TEACHER' && role !== 'MODERATOR')) {
    redirect('/');
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      batch: { include: { class: true } },
      progress: {
        include: { topic: { include: { chapter: { include: { subject: true } } } } },
        orderBy: { updatedAt: 'desc' }
      },
      activities: {
        orderBy: { created_at: 'desc' },
        take: 50
      },
      subscriptions: {
        orderBy: { created_at: 'desc' }
      }
    }
  });

  if (!user) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">User Not Found</h1>
        <Link href="/admin/users" className="text-blue-500 hover:underline">Return to User Management</Link>
      </div>
    );
  }

  const completedTopics = user.progress.filter(p => p.completed);
  const totalTimeSpent = user.progress.reduce((acc, p) => acc + (p.timeSpent || 0), 0);
  const formattedTimeSpent = `${Math.floor(totalTimeSpent / 3600)}h ${Math.floor((totalTimeSpent % 3600) / 60)}m`;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 fade-in animate-in">
      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Student Analytics</h1>
          <p className="text-sm font-medium text-slate-500">Detailed performance report</p>
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-theo-yellow/20 text-2xl font-bold text-theo-black">
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-theo-black">{user.name || 'Unnamed Student'}</h2>
              <Badge variant="secondary" className="border-gray-200 bg-gray-50 text-gray-700">
                {user.role}
              </Badge>
            </div>
            <p className="mb-1 font-medium text-gray-700">{user.email}</p>
            <p className="text-sm text-gray-500">
              {user.batch ? `Assigned to ${user.batch.name} (${user.batch.class.name})` : 'No batch assigned'} • Joined{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <Card className="rounded-2xl border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-500"></div>
           <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Topics Completed</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{completedTopics.length}</h3>
           </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="rounded-2xl border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute left-0 top-0 w-1.5 h-full bg-amber-500"></div>
           <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Active Time</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{formattedTimeSpent}</h3>
           </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="rounded-2xl border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute left-0 top-0 w-1.5 h-full bg-purple-500"></div>
           <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subscriptions</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{user.subscriptions.length}</h3>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Platform Activity */}
        <Card className="border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-50 mb-0 py-4 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="max-h-[500px] overflow-y-auto px-6 py-4 space-y-6">
                {user.activities.length > 0 ? (
                  user.activities.map((activity, index) => (
                    <div key={activity.id} className="relative flex gap-4 pl-4 before:absolute before:left-0 before:top-2 before:bottom-[-24px] before:w-px before:bg-slate-200 last:before:hidden pt-1">
                       <div className="absolute left-[-3.5px] top-2 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-white" />
                       <div>
                          <p className="text-sm font-bold text-slate-800">{activity.description}</p>
                          <div className="flex gap-2 items-center mt-1">
                             <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{activity.action.replace(/_/g, ' ')}</span>
                             <span className="text-xs text-slate-400 font-medium">{new Date(activity.created_at).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-10 font-medium">No activity recorded yet.</p>
                )}
             </div>
          </CardContent>
        </Card>

        {/* Module Progress */}
        <Card className="border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-50 mb-0 py-4 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-500" />
              Recent Module Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="max-h-[500px] overflow-y-auto p-6 space-y-3">
                {user.progress.length > 0 ? (
                  user.progress.map((prog) => (
                    <div key={prog.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{prog.topic.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{prog.topic.chapter.subject.name} • {prog.topic.chapter.name}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        {prog.completed ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none shadow-none uppercase tracking-widest text-[9px] font-black">Completed</Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-600 border-none shadow-none uppercase tracking-widest text-[9px] font-black">In Progress</Badge>
                        )}
                        <span className="text-[10px] text-slate-400 font-bold mt-1.5">{Math.floor((prog.timeSpent || 0) / 60)}m spent</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                     <History className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                     <p className="text-sm text-slate-500 font-medium">No module progress found.</p>
                  </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
