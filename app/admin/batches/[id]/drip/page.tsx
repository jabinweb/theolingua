'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Lock, Unlock, Calendar, Zap, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SubjectConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  orderIndex: number;
  unlockAfterDays: number;
}

interface DripConfig {
  batchId: string;
  batchName: string;
  className: string;
  isDripEnabled: boolean;
  dripStartDate: string | null;
  subjects: SubjectConfig[];
}

export default function BatchDripConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: batchId } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  const [config, setConfig] = useState<DripConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authorization check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'MODERATOR' && userRole !== 'TEACHER')) {
      router.push('/');
    }
  }, [session, status, userRole, router]);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/batches/${batchId}/drip`);
      if (!res.ok) throw new Error('Failed to load drip configuration');
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/admin/batches/${batchId}/drip`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDripEnabled: config.isDripEnabled,
          dripStartDate: config.dripStartDate,
          subjects: config.subjects.map((s) => ({ id: s.id, unlockAfterDays: s.unlockAfterDays })),
        }),
      });
      if (!res.ok) throw new Error('Failed to save configuration');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateSubjectDays = (subjectId: string, days: number) => {
    if (!config) return;
    setConfig({
      ...config,
      subjects: config.subjects.map((s) =>
        s.id === subjectId ? { ...s, unlockAfterDays: Math.max(0, days) } : s
      ),
    });
  };

  const applyDefaultSchedule = () => {
    if (!config) return;
    setConfig({
      ...config,
      subjects: config.subjects.map((s, index) => ({
        ...s,
        unlockAfterDays: index * 7,
      })),
    });
  };

  // Calculate preview unlock dates
  const getUnlockDate = (days: number): string => {
    if (!config?.dripStartDate) return '—';
    const d = new Date(config.dripStartDate);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysStatus = (days: number): { unlocked: boolean; daysRemaining: number } => {
    if (!config?.dripStartDate || !config.isDripEnabled) return { unlocked: true, daysRemaining: 0 };
    const now = new Date();
    const start = new Date(config.dripStartDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysElapsed = Math.floor((now.getTime() - start.getTime()) / msPerDay);
    const unlocked = daysElapsed >= days;
    return { unlocked, daysRemaining: unlocked ? 0 : days - daysElapsed };
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-10 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-bold">{error || 'Batch not found'}</p>
        <Button className="mt-4" onClick={() => router.push('/admin/batches')}>Back to Batches</Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Navigation & Breadcrumbs */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <Link href="/admin/batches" className="hover:text-indigo-600 transition-colors">Batches</Link>
          <ChevronLeft className="h-3 w-3 rotate-180" />
          <span className="text-slate-900">Drip Schedule</span>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/batches')} className="rounded-xl shadow-sm border-slate-200">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Drip Content Schedule</h1>
            <p className="text-sm font-medium text-slate-500">
              <span className="font-bold text-indigo-600">{config.batchName}</span> · {config.className}
            </p>
          </div>
        </div>
      </div>


      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Master Controls */}
      <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Drip Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 bg-white">
            <div className="space-y-1">
              <p className="font-black text-slate-900">Enable Drip Unlock</p>
              <p className="text-xs font-medium text-slate-500">
                When enabled, units unlock progressively based on the schedule below.
                When disabled, all units are accessible immediately.
              </p>
            </div>
            <Switch
              checked={config.isDripEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, isDripEnabled: checked })}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="font-black text-slate-700 text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Drip Start Date
            </Label>
            <Input
              type="date"
              value={config.dripStartDate ? config.dripStartDate.split('T')[0] : ''}
              onChange={(e) => setConfig({ ...config, dripStartDate: e.target.value || null })}
              className="max-w-xs rounded-xl border-slate-200 font-medium"
              disabled={!config.isDripEnabled}
            />
            <p className="text-xs font-medium text-slate-400">
              All unlock timers count from this date. Students joining later still follow this same schedule.
            </p>
          </div>

          {/* Quick Apply Default */}
          <Button
            variant="outline"
            size="sm"
            onClick={applyDefaultSchedule}
            disabled={!config.isDripEnabled}
            className="font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl"
          >
            <Zap className="h-3.5 w-3.5 mr-2" />
            Apply Default (Unit 1 now, then +7 days each)
          </Button>
        </CardContent>
      </Card>

      {/* Unit Schedule Table */}
      <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Unit Unlock Schedule
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
            {config.subjects.length} Units
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {config.subjects.map((subject, index) => {
              const status = getDaysStatus(subject.unlockAfterDays);
              return (
                <div
                  key={subject.id}
                  className={`p-6 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${!config.isDripEnabled || status.unlocked ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                >
                  {/* Subject Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
                      style={{ backgroundColor: subject.color + '20', color: subject.color }}
                    >
                      {subject.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 truncate">{subject.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit {index + 1}</p>
                    </div>
                  </div>

                  {/* Days Input */}
                  <div className="flex items-center gap-3">
                    <div className="space-y-1 text-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Unlock After
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          value={subject.unlockAfterDays}
                          onChange={(e) => updateSubjectDays(subject.id, parseInt(e.target.value) || 0)}
                          disabled={!config.isDripEnabled}
                          className="w-24 text-center font-black text-lg rounded-xl border-slate-200"
                        />
                        <span className="text-sm font-bold text-slate-500">days</span>
                      </div>
                    </div>
                  </div>

                  {/* Status + Unlock Date */}
                  <div className="flex items-center gap-3 sm:min-w-[180px] justify-end">
                    {!config.isDripEnabled ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-black text-[10px] uppercase tracking-widest gap-1.5">
                        <Unlock className="h-3 w-3" /> Always Open
                      </Badge>
                    ) : status.unlocked ? (
                      <div className="text-right space-y-1">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-black text-[10px] uppercase tracking-widest gap-1.5">
                          <Unlock className="h-3 w-3" /> Unlocked
                        </Badge>
                        <p className="text-[10px] font-bold text-slate-400">{getUnlockDate(subject.unlockAfterDays)}</p>
                      </div>
                    ) : (
                      <div className="text-right space-y-1">
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-black text-[10px] uppercase tracking-widest gap-1.5">
                          <Lock className="h-3 w-3" /> {status.daysRemaining}d remaining
                        </Badge>
                        <p className="text-[10px] font-bold text-slate-400">{getUnlockDate(subject.unlockAfterDays)}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button - only for Admins and Moderators */}
      {(userRole === 'ADMIN' || userRole === 'MODERATOR') && (
        <div className="flex justify-end gap-3 pb-8">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Saved successfully!
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 rounded-xl shadow-lg shadow-indigo-600/20"
          >
            {saving ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" /> Save Schedule</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
