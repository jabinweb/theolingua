'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle, BookOpen, ChevronRight, Users } from 'lucide-react';
import { ProgramForm } from '@/components/admin/ProgramForm';
import { useRouter } from 'next/navigation';

interface Program {
  id: string;
  name: string;
  slug?: string; // Add slug field
  description: string;
  isActive: boolean;
  price: string;
  currency: string;
  created_at: string;
  updated_at: string;
  subjects?: Array<{ id: string; name: string }>;
  subscriptions?: Array<{ id: string; status: string; user: { email: string; display_name: string } }>;
}

interface ProgramFormData {
  id?: string;
  name: string;
  logo?: string;
  description: string;
  isActive: boolean;
  price?: string; // Keep as string for form handling
}

export default function ProgramsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role; // Get actual role from session
  const authLoading = status === 'loading';
  const [classes, setprograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const router = useRouter();

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin) {
      fetchprograms();
    }
  }, [isAdmin, isLoadingAuth, user, userRole]);

  const fetchprograms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/programs');
      const data = await response.json();
      setprograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setprograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (formData: ProgramFormData) => {
    const response = await fetch('/api/admin/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        logo: formData.logo,
        price: formData.price
      }),
    });

    if (response.ok) {
      fetchprograms();
    } else {
      throw new Error('Failed to create program');
    }
  };

  const handleUpdateProgram = async (formData: ProgramFormData) => {
    if (!formData.id) {
      throw new Error('Program ID is required for update');
    }

    const response = await fetch('/api/admin/programs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: parseInt(formData.id, 10),
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        logo: formData.logo,
        price: formData.price ? parseInt(formData.price) : undefined // Handle price conversion
      }),
    });

    if (response.ok) {
      fetchprograms();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update program');
    }
  };

  const handleDeleteProgram = async (classId: number) => {
    if (!confirm('Are you sure you want to delete this program? This will also delete all units, lessons, and topics.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/programs?id=${classId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchprograms();
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const openEditForm = (classItem: Program) => {
    const rawPrice = classItem.price !== undefined && classItem.price !== null ? Number(classItem.price) : 29900;
    setEditingProgram({
      ...classItem,
      price: String(Math.round((Number(rawPrice) || 0) / 100))
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProgram(null);
  };

  const handleManageProgram = (program: Program) => {
    const identifier = program.slug || program.id;
    router.push(`/admin/programs/${identifier}`);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Program Management</h1>
            <p className="text-muted-foreground">Manage programs and their content structure</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchprograms} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setFormOpen(true)} variant="theo" className="font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => {
              // Ensure price is a number for arithmetic
              const priceNum = typeof classItem.price === 'string' ? parseInt(classItem.price) : classItem.price;
              return (
                <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{classItem.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-theo-black border-theo-yellow bg-theo-yellow/10 font-bold">
                          ₹{Math.round((priceNum || 0) / 100)}
                        </Badge>
                        <Badge variant={classItem.isActive ? 'theo' : 'secondary'} className="font-bold">
                          {classItem.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{classItem.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{classItem.subjects?.length || 0} Units</span>
                        </div>
                        <div className="flex items-center gap-2 text-theo-black font-medium">
                          <Users className="h-4 w-4" />
                          <span>{classItem.subscriptions?.length || 0} Students</span>
                        </div>
                        <div className="text-muted-foreground">
                          ID: {classItem.id}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(classItem)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProgram(Number(classItem.id))}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                        <Button
                          variant="theo-black"
                          size="sm"
                          onClick={() => handleManageProgram(classItem)}
                          className="flex-1 font-bold"
                        >
                          Manage
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {classes.length === 0 && !loading && (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Programs Found</h3>
            <p className="text-muted-foreground mb-4">Create your first program to get started.</p>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </div>
        )}

        <ProgramForm
          isOpen={formOpen}
          onClose={closeForm}
          onSubmit={editingProgram ? handleUpdateProgram : handleCreateProgram}
          initialData={editingProgram || undefined}
          mode={editingProgram ? 'edit' : 'create'}
        />
      </div>
    </div>
  );
}
