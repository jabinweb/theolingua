'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Layers, DollarSign } from 'lucide-react';
import { UnitForm } from '@/components/admin/UnitForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

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

interface ProgramItem {
    id: number;
    name: string;
    // add other properties if needed
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programParam = params.programId as string; // Can be either slug or ID
  
  const [programId, setProgramId] = useState<number | null>(null);
  const [programSlug, setProgramSlug] = useState<string | null>(null);
  const [subjects, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [className, setProgramName] = useState('');

  useEffect(() => {
    fetchProgramData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programParam]);

  useEffect(() => {
    if (programId) {
      fetchUnits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  const fetchProgramData = async () => {
    try {
      // Try to parse as number first (legacy ID)
      const asNumber = parseInt(programParam);
      if (!isNaN(asNumber)) {
        // It's a numeric ID
        setProgramId(asNumber);
        setProgramSlug(null);
        const response = await fetch('/api/admin/programs');
        const programs = await response.json();
        const currentProgram = programs.find((p: ProgramItem) => p.id === asNumber);
        setProgramName(currentProgram?.name || 'Unknown Program');
      } else {
        // It's a slug
        setProgramSlug(programParam);
        const response = await fetch(`/api/admin/programs/${programParam}`);
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, response.statusText);
          const errorData = await response.json();
          console.error('Error data:', errorData);
          setProgramName('Unknown Program');
          return;
        }
        
        const program = await response.json();
        console.log('Fetched program:', program);
        
        if (program && program.id) {
          setProgramId(program.id);
          setProgramName(program.name);
        } else {
          console.error('Invalid program data:', program);
          setProgramName('Unknown Program');
        }
      }
    } catch (error) {
      console.error('Error fetching program:', error);
      setProgramName('Unknown Program');
    }
  };

  const fetchUnits = async () => {
    if (!programId && !programSlug) return;
    
    setLoading(true);
    try {
      const queryParam = programSlug ? `programSlug=${programSlug}` : `programId=${programId}`;
      const response = await fetch(`/api/admin/units?${queryParam}`);
      const data = await response.json();
      setUnits(Array.isArray(data) ? data : []);
    } catch {
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUnit = async (formData: UnitFormData) => {
    const response = await fetch('/api/admin/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, programId }),
    });
    if (response.ok) fetchUnits();
    else throw new Error('Failed to create unit');
  };

  const handleUpdateUnit = async (formData: UnitFormData) => {
    const response = await fetch('/api/admin/units', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) fetchUnits();
    else throw new Error('Failed to update unit');
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Delete this unit and all its lessons and topics?')) return;
    const response = await fetch(`/api/admin/units?id=${unitId}`, { method: 'DELETE' });
    if (response.ok) fetchUnits();
  };

  const goToChapters = (unitId: string) => {
    const identifier = programSlug || programId;
    router.push(`/admin/programs/${identifier}/units/${unitId}/chapters`);
  };

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title={className}
        badge="Program curriculum"
        description="Manage educational units and structure"
        onBack={() => router.push('/admin/programs')}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/programs/${programSlug || programId}/pricing`)}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Pricing
            </Button>
            <Button size="sm" variant="theo" onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add unit
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <div className="admin-card-grid">
          {subjects.map((subject) => (
            <Card key={subject.id} className="min-w-0 overflow-hidden border border-gray-200 py-0 shadow-sm">
              <CardHeader className="gap-2 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-theo-yellow/15 text-xl">
                      {subject.icon}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base font-bold text-theo-black">{subject.name}</CardTitle>
                      <p className="text-xs text-gray-500">Order {subject.orderIndex}</p>
                    </div>
                  </div>
                  <Badge variant={subject.isLocked ? 'secondary' : 'default'} className="shrink-0 text-[10px]">
                    {subject.isLocked ? 'Locked' : 'Available'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Button
                  variant="theo-black"
                  size="sm"
                  className="w-full"
                  onClick={() => goToChapters(subject.id)}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  Manage lessons
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingUnit(subject);
                      setFormOpen(true);
                    }}
                    className="min-w-0 flex-1"
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUnit(subject.id)}
                    className="min-w-0 flex-1 text-red-600 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {programId && (
        <UnitForm
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingUnit(null);
          }}
          onSubmit={editingUnit ? handleUpdateUnit : handleCreateUnit}
          initialData={editingUnit || undefined}
          mode={editingUnit ? 'edit' : 'create'}
          programId={programId}
        />
      )}
    </div>
  );
}
