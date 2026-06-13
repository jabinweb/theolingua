'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldAlert, Users, Info, Settings2, Save, RotateCcw, Plus, X, Lock, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AVAILABLE_CAPABILITIES, DEFAULT_RBAC_CONFIG } from '@/lib/rbac-config';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const ROLE_METADATA = {
  ADMIN: {
    name: 'Administrator',
    description: 'Full system access. Can manage users, batches, content, settings, and roles.',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: ShieldCheck
  },
  MODERATOR: {
    name: 'Moderator',
    description: 'Operational manager. Can manage users and batches, but cannot modify course content.',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: ShieldAlert
  },
  TEACHER: {
    name: 'Teacher',
    description: 'Educational staff. Can view all programs and manage their assigned batches.',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: Shield
  },
  STUDENT: {
    name: 'Student',
    description: 'General learner. Can access subscribed courses and their dashboard.',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: Users
  }
};

export default function GlobalRBACPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rolesConfig, setRolesConfig] = useState<Record<string, any>>({});
  const [selectedCap, setSelectedCap] = useState<Record<string, string>>({});
  const [customCap, setCustomCap] = useState<Record<string, string>>({});
  const [showCustom, setShowCustom] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();

      const baseConfig = { ...DEFAULT_RBAC_CONFIG };
      let currentPermissions = baseConfig;

      if (data.rbacConfig) {
        try {
          const parsed = JSON.parse(data.rbacConfig);
          Object.keys(parsed).forEach(role => {
            if (currentPermissions[role]) {
              currentPermissions[role] = parsed[role];
            }
          });
        } catch (e) {
          console.error('Invalid JSON in rbacConfig:', e);
        }
      }

      // Map permissions to the metadata for display
      const displayConfig = Object.keys(ROLE_METADATA).reduce((acc, role) => {
        acc[role] = {
          ...ROLE_METADATA[role as keyof typeof ROLE_METADATA],
          permissions: currentPermissions[role] || []
        };
        return acc;
      }, {} as any);

      setRolesConfig(displayConfig);
    } catch (error) {
      console.error('Failed to fetch RBAC config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configToSave = Object.keys(rolesConfig).reduce((acc, role) => {
        acc[role] = rolesConfig[role].permissions;
        return acc;
      }, {} as Record<string, string[]>);

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rbacConfig: JSON.stringify(configToSave) })
      });

      if (res.ok) {
        toast.success('RBAC configuration updated successfully');
        setIsEditing(false);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all roles to their system defaults?')) {
      const resetConfig = Object.keys(ROLE_METADATA).reduce((acc, role) => {
        acc[role] = {
          ...ROLE_METADATA[role as keyof typeof ROLE_METADATA],
          permissions: DEFAULT_RBAC_CONFIG[role] || []
        };
        return acc;
      }, {} as any);
      setRolesConfig(resetConfig);
      toast.info('Roles reset to defaults (click Save to persist)');
    }
  };

  const addCapability = (role: string, capName?: string) => {
    const cap = (capName || (showCustom[role] ? customCap[role] : selectedCap[role]))?.trim();
    if (!cap || cap === 'custom') return;

    setRolesConfig(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        permissions: [...new Set([...prev[role].permissions, cap])]
      }
    }));

    // Reset state
    if (showCustom[role]) {
      setCustomCap(prev => ({ ...prev, [role]: '' }));
      setShowCustom(prev => ({ ...prev, [role]: false }));
    } else {
      setSelectedCap(prev => ({ ...prev, [role]: '' }));
    }
  };

  const removeCapability = (role: string, cap: string) => {
    setRolesConfig(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        permissions: prev[role].permissions.filter((p: string) => p !== cap)
      }
    }));
  };

  if (!isAdmin) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only administrators can access the global RBAC management page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center">Loading RBAC configuration...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="page-toolbar mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Global RBAC Settings</h1>
            <p className="text-muted-foreground">Manage system-wide roles and access levels</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Settings2 className="h-4 w-4" />
                Customize Capabilities
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleReset} className="gap-2 text-red-600 hover:text-red-700">
                  <RotateCcw className="h-4 w-4" />
                  Restore Defaults
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <Alert className="mb-6 bg-amber-50 border-amber-100 text-amber-800">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="font-bold">Edit Mode Active</AlertTitle>
            <AlertDescription>
              Select capabilities from the Registry dropdown. Only use custom strings for future modules not yet listed.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {Object.entries(rolesConfig).map(([role, def]) => {
            const Icon = def.icon;
            return (
              <Card key={role} className={`overflow-hidden border-slate-200 transition-all ${isEditing ? 'ring-2 ring-indigo-500 shadow-sm' : 'hover:shadow-md'}`}>
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${def.color} border shadow-sm`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">{def.name}</CardTitle>
                        <Badge variant="outline" className={`${def.color} mt-1 font-bold text-[10px] uppercase tracking-widest`}>
                          Role: {role}
                        </Badge>
                      </div>
                    </div>
                    {isEditing && (role === 'ADMIN' || role === 'STUDENT') && (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" /> System Primary
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <CardDescription className="text-slate-600 mb-6 text-sm leading-relaxed">
                    {def.description}
                  </CardDescription>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capabilities</p>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {def.permissions.map((perm: string) => (
                        <Badge
                          key={perm}
                          variant="secondary"
                          className={`bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-md border-transparent flex items-center gap-1 ${isEditing ? 'pr-1' : ''}`}
                        >
                          {perm}
                          {isEditing && (
                            <button
                              onClick={() => removeCapability(role, perm)}
                              className="hover:bg-slate-200 p-0.5 rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>

                    {isEditing && (
                      <div className="pt-2 border-t border-slate-100">
                        {!showCustom[role] ? (
                          <div className="flex gap-2">
                            <Select
                              value={selectedCap[role] || ""}
                              onValueChange={(val) => {
                                if (val === 'custom') {
                                  setShowCustom(prev => ({ ...prev, [role]: true }));
                                } else {
                                  addCapability(role, val);
                                }
                              }}
                            >
                              <SelectTrigger className="h-9 text-xs w-full bg-slate-50">
                                <SelectValue placeholder="Add from Registry..." />
                              </SelectTrigger>
                              <SelectContent>
                                <div className="p-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">Available Registry</div>
                                {AVAILABLE_CAPABILITIES.filter(cap => !def.permissions.includes(cap)).map(cap => (
                                  <SelectItem key={cap} value={cap} className="text-xs">{cap}</SelectItem>
                                ))}
                                <DropdownMenuSeparator />
                                <SelectItem value="custom" className="text-xs text-indigo-600 font-bold italic">+ Use Custom String...</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="flex gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            <Input
                              placeholder="Type custom capability..."
                              className="h-9 text-xs"
                              value={customCap[role] || ''}
                              onChange={(e) => setCustomCap(prev => ({ ...prev, [role]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability(role))}
                              autoFocus
                            />
                            <Button size="sm" variant="secondary" className="h-9 w-9 p-0" onClick={() => addCapability(role)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={() => setShowCustom(prev => ({ ...prev, [role]: false }))}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Alert className="bg-blue-50 border-blue-100 text-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="font-bold">Role Assignment</AlertTitle>
          <AlertDescription>
            You can assign these roles to users via the <Button variant="link" className="p-0 h-auto text-blue-700 font-bold underline" onClick={() => window.location.href = '/admin/users'}>User Management</Button> panel. Each role inherits its permissions automatically.
          </AlertDescription>
        </Alert>

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            Access Control Policy (Dynamic)
          </h2>
          <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
            <table className="w-full min-w-[640px] text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-3">Module</th>
                  <th className="px-4 py-3 text-center">Student</th>
                  <th className="px-4 py-3 text-center">Teacher</th>
                  <th className="px-4 py-3 text-center">Moderator</th>
                  <th className="px-4 py-3 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { name: 'Dashboard', cap: 'View Dashboard' },
                  { name: 'Course Content (Read)', cap: 'Access Content' },
                  { name: 'Course Content (Write)', cap: 'Manage Content' },
                  { name: 'Batches (View)', cap: 'View Programs' },
                  { name: 'Batches (Manage)', cap: 'Manage Batches' },
                  { name: 'User Management', cap: 'Manage Users' },
                  { name: 'Analytics (Full)', cap: 'View Analytics' },
                  { name: 'Settings', cap: 'Manage Settings' },
                  { name: 'Roles & RBAC', cap: 'Role Management' },
                  { name: 'System Logs', cap: 'System Logs' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-700">{row.name}</td>
                    {(['STUDENT', 'TEACHER', 'MODERATOR', 'ADMIN'] as const).map(role => {
                      const hasAccess = rolesConfig[role]?.permissions.includes(row.cap);
                      return (
                        <td key={role} className="px-4 py-4 text-center">
                          {hasAccess ? (
                            <div className="flex justify-center">
                              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                <ShieldCheck className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-slate-50 border-t">
              <p className="text-xs text-slate-500 italic">
                The table above dynamically calculates access based on the "Capabilities" defined in the role cards. Adding a capability from the Registry automatically grants that module's access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
