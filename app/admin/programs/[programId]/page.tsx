'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowLeft, Layers, DollarSign } from 'lucide-react';
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
    <div className="p-8 bg-theo-white/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => router.push('/admin/programs')}
                className="rounded-2xl h-12 w-12 border-theo-black/10 hover:bg-theo-yellow hover:border-theo-yellow transition-all shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-5xl font-bold text-theo-black tracking-tight mb-2">
                  {className}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant="theo-black" className="rounded-full px-4 font-bold uppercase tracking-tighter text-[10px]">PROGRAM CURRICULUM</Badge>
                  <p className="text-gray-500 font-medium text-lg">Manage educational units and structure</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/admin/programs/${programSlug || programId}/pricing`)}
                className="rounded-2xl h-12 px-6 border-theo-black/10 hover:bg-theo-black hover:text-theo-yellow"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing Strategy
              </Button>
              <Button 
                onClick={() => setFormOpen(true)}
                variant="theo"
                className="rounded-2xl h-12 px-6 shadow-lg shadow-theo-yellow/20"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Unit
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject.id} className="border-0 shadow-sm rounded-[32px] overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-[20px] bg-theo-yellow/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {subject.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-theo-black">{subject.name}</CardTitle>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ORDER INDEX: {subject.orderIndex}</p>
                      </div>
                    </div>
                    <Badge variant={subject.isLocked ? 'theo-black' : 'theo'} className="rounded-full shadow-sm px-3 font-bold uppercase tracking-tighter text-[9px]">
                      {subject.isLocked ? 'Locked' : 'Available'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="space-y-4">
                    <Button
                      variant="theo-black"
                      className="w-full rounded-2xl h-12 shadow-sm font-bold"
                      onClick={() => goToChapters(subject.id)}
                    >
                      <Layers className="h-5 w-5 mr-3" />
                      Manage Lessons
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingUnit(subject); setFormOpen(true); }}
                        className="flex-1 rounded-xl h-10 border-theo-black/10 font-bold"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUnit(subject.id)}
                        className="flex-1 rounded-xl h-10 text-red-600 hover:bg-red-50 font-bold"
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

        {programId && (
          <UnitForm
            isOpen={formOpen}
            onClose={() => { setFormOpen(false); setEditingUnit(null); }}
            onSubmit={editingUnit ? handleUpdateUnit : handleCreateUnit}
            initialData={editingUnit || undefined}
            mode={editingUnit ? 'edit' : 'create'}
            programId={programId}
          />
        )}
      </div>
    </div>
  );
}
