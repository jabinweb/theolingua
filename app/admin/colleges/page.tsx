'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle, School, Users, Mail, Phone, Upload } from 'lucide-react';
import { SchoolForm } from '@/components/admin/SchoolForm';
import { BulkStudentUpload } from '@/components/admin/BulkStudentUpload';

interface SchoolData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  principal_name?: string;
  contact_person?: string;
  student_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SchoolFormData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  principalName?: string;
  contactPerson?: string;
  studentCount?: number;
  isActive: boolean;
}

export default function CollegesPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  // Get actual role from session
  const userRole = user?.role; // Get actual role from session
  const authLoading = status === 'loading';
  const [colleges, setColleges] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolFormData | null>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [selectedSchoolForUpload, setSelectedSchoolForUpload] = useState<SchoolData | null>(null);

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin) {
      fetchColleges();
    }
  }, [isAdmin, isLoadingAuth, user, userRole]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/colleges');
      const data = await response.json();
      setColleges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (formData: SchoolFormData) => {
    try {
      const response = await fetch('/api/admin/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Show the specific error message from the server
        throw new Error(responseData.error || `HTTP ${response.status}: Failed to create college`);
      }

      fetchColleges();
    } catch (error) {
      console.error('Error creating college:', error);
      // Re-throw with a user-friendly message
      throw new Error(error instanceof Error ? error.message : 'Failed to create college');
    }
  };

  const handleUpdateSchool = async (formData: SchoolFormData) => {
    if (!formData.id) {
      throw new Error('College ID is required for update');
    }

    const response = await fetch('/api/admin/colleges', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      fetchColleges();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update college');
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (!confirm('Are you sure you want to delete this college? This will also affect all associated users.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/colleges?id=${schoolId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchColleges();
      }
    } catch (error) {
      console.error('Error deleting college:', error);
    }
  };

  const openEditForm = (school: SchoolData) => {
    setEditingSchool({
      id: school.id,
      name: school.name,
      email: school.email,
      phone: school.phone,
      address: school.address,
      website: school.website,
      principalName: school.principal_name,
      contactPerson: school.contact_person,
      studentCount: school.student_count,
      isActive: school.is_active,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingSchool(null);
  };

  const handleBulkUpload = (school: SchoolData) => {
    setSelectedSchoolForUpload(school);
    setBulkUploadOpen(true);
  };

  const closeBulkUpload = () => {
    setBulkUploadOpen(false);
    setSelectedSchoolForUpload(null);
  };

  const handleUploadComplete = () => {
    fetchColleges(); // Refresh colleges to update student counts
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
    <div className="p-8 bg-theo-white/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-theo-black tracking-tight mb-2">
                College Management
              </h1>
              <p className="text-gray-500 font-medium text-lg">Manage partner institutions and student distribution</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={fetchColleges} variant="outline" disabled={loading} className="rounded-2xl h-11 px-6">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setFormOpen(true)} variant="theo" className="rounded-2xl h-11 px-6 shadow-lg shadow-theo-yellow/20">
                <Plus className="h-5 w-5 mr-2" />
                Add College
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
            {colleges.map((school) => (
              <Card key={school.id} className="border-0 shadow-sm rounded-[32px] overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-theo-black flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-theo-yellow/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <School className="h-6 w-6 text-theo-black" />
                      </div>
                      {school.name}
                    </CardTitle>
                    <Badge variant={school.is_active ? 'theo' : 'outline'} className="rounded-full shadow-sm px-4 font-bold uppercase tracking-tighter text-[10px]">
                      {school.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8 pt-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-theo-black/5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Students</p>
                        <div className="flex items-center gap-2 text-theo-black font-bold">
                          <Users className="h-4 w-4" />
                          <span>{school.student_count}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-theo-black/5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <div className="flex items-center gap-2 text-theo-black font-bold capitalize">
                          {school.is_active ? 'Premium Partner' : 'Standard'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm font-medium text-gray-500">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{school.email}</span>
                      </div>
                      {school.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{school.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 border-t border-gray-100 pt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(school)}
                        className="flex-1 rounded-xl h-11 border-theo-black/10 font-bold"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="theo-black"
                        size="sm"
                        onClick={() => handleBulkUpload(school)}
                        className="flex-1 rounded-xl h-11 font-bold shadow-lg shadow-theo-black/10"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchool(school.id)}
                        className="h-11 w-11 p-0 rounded-xl text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {colleges.length === 0 && !loading && (
          <div className="text-center py-8">
            <School className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Colleges Found</h3>
            <p className="text-muted-foreground mb-4">Create your first college to get started.</p>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add College
            </Button>
          </div>
        )}

        <SchoolForm
          isOpen={formOpen}
          onClose={closeForm}
          onSubmit={editingSchool ? handleUpdateSchool : handleCreateSchool}
          initialData={editingSchool || undefined}
          mode={editingSchool ? 'edit' : 'create'}
        />

        {selectedSchoolForUpload && (
          <BulkStudentUpload
            isOpen={bulkUploadOpen}
            onClose={closeBulkUpload}
            onComplete={handleUploadComplete}
          />
        )}
      </div>
    </div>
  );
}

