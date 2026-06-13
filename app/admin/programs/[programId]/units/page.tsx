'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { UnitForm } from '@/components/admin/UnitForm';

interface Unit {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  programId: number;
  price?: number; // Price in paisa
  currency?: string;
  created_at: string;
  updated_at: string;
}

interface UnitFormData {
  id?: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  programId: number;
}

interface ProgramData {
  id: number;
  name: string;
  // ...other fields if needed
}

export default function UnitsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role; // Get actual role from session
  const authLoading = status === 'loading';
  const programId = parseInt(params.programId as string);
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [className, setProgramName] = useState('');

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

  const fetchProgramName = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/programs');
      const programs: ProgramData[] = await response.json();
      const currentProgram = programs.find((c: ProgramData) => c.id === programId);
      setProgramName(currentProgram?.name || 'Unknown Program');
    } catch (error) {
      console.error('Error fetching program name:', error);
    }
  }, [programId]);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/units?programId=${programId}`);
      const data: Unit[] = await response.json();
      setUnits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin && programId) {
      fetchUnits();
      fetchProgramName();
    }
  }, [isAdmin, isLoadingAuth, programId, user, userRole, fetchUnits, fetchProgramName]);



  const handleCreateUnit = async (formData: UnitFormData) => {
    const response = await fetch('/api/admin/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, programId }),
    });

    if (response.ok) {
      fetchUnits();
    } else {
      throw new Error('Failed to create unit');
    }
  };

  const handleUpdateUnit = async (formData: UnitFormData) => {
    const response = await fetch('/api/admin/units', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      fetchUnits();
    } else {
      throw new Error('Failed to update unit');
    }
  };

  const handleDeleteUnit = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this unit? This will also delete all lessons and topics.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/units?id=${subjectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUnits();
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  // ...existing loading and auth checks...

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 page-toolbar">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.push('/admin/programs')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">{className} - Units</h1>
              <p className="text-muted-foreground">Manage units for this program</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchUnits} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </div>
        </div>

        {/* Unit Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="admin-card-grid">
            {units.map((subject) => (
              <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{subject.icon}</span>
                      <div>
                        <CardTitle className="text-xl">{subject.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Order: {subject.orderIndex}</p>
                        <p className="text-sm font-medium text-green-600">
                          Price: ₹{subject.price ? (subject.price / 100).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={subject.isLocked ? 'destructive' : 'default'}>
                      {subject.isLocked ? 'Locked' : 'Unlocked'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className={`h-4 rounded bg-gradient-to-r ${subject.color}`} />
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingUnit(subject); setFormOpen(true); }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUnit(subject.id)}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <UnitForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditingUnit(null); }}
          onSubmit={editingUnit ? handleUpdateUnit : handleCreateUnit}
          initialData={editingUnit || undefined}
          mode={editingUnit ? 'edit' : 'create'}
          programId={programId}
        />
      </div>
    </div>
  );
}
