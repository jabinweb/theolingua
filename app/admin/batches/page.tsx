'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle, Layers, Users, BookOpen, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Link from 'next/link';


interface Class {
  id: number;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Batch {
  id: string;
  name: string;
  classId: number;
  teacherId: string | null;
  endDate: string | null;
  isDripEnabled?: boolean;
  dripStartDate?: string | null;
  class: Class;
  teacher: Teacher | null;
  teachers: Teacher[];
  students?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  }[];
  _count: {
    students: number;
  };
}

export default function BatchesPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isAdmin = userRole === 'ADMIN';
  const isModerator = userRole === 'MODERATOR';
  const canManage = isAdmin || isModerator;

  const [batches, setBatches] = useState<Batch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState<{name: string; classId: string; teacherIds: string[]; endDate: string}>({
    name: '',
    classId: '',
    teacherIds: [],
    endDate: ''
  });
  const [batchStudents, setBatchStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentData, setEditStudentData] = useState({ name: '', email: '' });

  // Bulk upload state
  const [uploadingBatch, setUploadingBatch] = useState<Batch | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    fetchBatches();
    if (canManage) {
      fetchClasses();
      fetchTeachers();
    }
  }, [canManage]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/batches');
      const data = await res.json();
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    const res = await fetch('/api/admin/programs');
    const data = await res.json();
    setClasses(data);
  };

  const fetchTeachers = async () => {
    const res = await fetch('/api/admin/users?role=TEACHER');
    const data = await res.json();
    setTeachers(data.filter((u: any) => u.role === 'TEACHER').map((u: any) => ({
      id: u.uid,
      name: u.displayName,
      email: u.email
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingBatch ? 'PATCH' : 'POST';
    const body = editingBatch 
      ? { id: editingBatch.id, ...formData }
      : formData;

    try {
      const res = await fetch('/api/admin/batches', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchBatches();
        setFormOpen(false);
        setEditingBatch(null);
        setFormData({ name: '', classId: '', teacherIds: [], endDate: '' });
      }
    } catch (error) {
      console.error('Error saving batch:', error);
    }
  };

  const deleteBatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    try {
      const res = await fetch(`/api/admin/batches?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchBatches();
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  const openEdit = async (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      classId: batch.classId.toString(),
      endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
      teacherIds: batch.teachers ? batch.teachers.map(t => t.id) : (batch.teacherId ? [batch.teacherId] : []),
    });
    setFormOpen(true);
    
    // Fetch students list for this batch
    try {
      setLoadingStudents(true);
      const res = await fetch(`/api/admin/batches?id=${batch.id}`);
      const data = await res.json();
      if (data && data.students) {
        setBatchStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching batch students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleUpdateStudent = async (studentId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: studentId,
          displayName: editStudentData.name,
        }),
      });

      if (res.ok) {
        setBatchStudents(prev => prev.map(s => 
          s.id === studentId ? { ...s, name: editStudentData.name } : s
        ));
        setEditingStudentId(null);
      }
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const removeStudentFromBatch = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the batch? They will still remain in the system.')) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: studentId,
          batchId: null,
        }),
      });

      if (res.ok) {
        setBatchStudents(prev => prev.filter(s => s.id !== studentId));
      }
    } catch (error) {
      console.error('Error removing student from batch:', error);
    }
  };

  const handleBulkUpload = async () => {
    if (!file || !uploadingBatch) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('batchId', uploadingBatch.id);

      const res = await fetch('/api/admin/students/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setUploadResult(data);
    } catch (error) {
      console.error('Error during bulk upload:', error);
      setUploadResult({ success: false, total: 0, created: 0, updated: 0, errors: [{ row: 0, error: 'Failed to upload' }] });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 page-toolbar">
          <div>
            <h1 className="text-3xl font-bold mb-2">Batch Management</h1>
            <p className="text-muted-foreground">Manage student batches and teacher assignments</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchBatches} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {canManage && (
              <Button onClick={() => {
                setEditingBatch(null);
                setFormData({ name: '', classId: '', teacherIds: [], endDate: '' });
                setFormOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Batch
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="admin-card-grid">
            {batches.map((batch) => (
              <Card key={batch.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {batch.name}
                        {batch.isDripEnabled && (
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-1.5 py-0 text-[10px] uppercase">
                            <Zap className="h-3 w-3 mr-1" />
                            Drip Active
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge variant="outline" className="w-fit">
                        {batch.class.name}
                      </Badge>
                    </div>
                    <Layers className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{batch._count.students} Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                       <BookOpen className="h-4 w-4 shrink-0" />
                       <span className="truncate">
                         {batch.teachers?.length > 0 
                           ? `Teachers: ${batch.teachers.map(t => t.name).join(', ')}`
                           : (batch.teacher?.name ? `Teacher: ${batch.teacher.name}` : 'Unassigned')}
                       </span>
                    </div>
                    {batch.endDate && (
                      <div className="flex items-start gap-2 text-sm text-amber-600 mt-1">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Expires: {new Date(batch.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {canManage && (
                      <div className="flex flex-col gap-2 mt-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(batch)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteBatch(batch.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setUploadingBatch(batch);
                            setUploadDialogOpen(true);
                          }}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Bulk Upload Students
                        </Button>
                        <Link href={`/admin/batches/${batch.id}/drip`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold">
                            <Zap className="h-4 w-4 mr-2" />
                            Configure Drip Schedule
                          </Button>
                        </Link>
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit dialog */}
        <Dialog open={formOpen} onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setBatchStudents([]);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBatch ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Batch Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Morning Batch A1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Program / Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(val) => setFormData({ ...formData, classId: val })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  Batch Expiration Date (Optional)
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">If set, all students in this batch will lose access on this date.</p>
              </div>
              <div className="space-y-2">
                <Label>Assign Teachers (Multiple)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                   {teachers.map((t) => (
                      <label key={t.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer border">
                        <input 
                           type="checkbox"
                           className="rounded border-gray-300 text-primary focus:ring-primary"
                           checked={formData.teacherIds.includes(t.id)}
                           onChange={(e) => {
                             if (e.target.checked) {
                               setFormData({ ...formData, teacherIds: [...formData.teacherIds, t.id] });
                             } else {
                               setFormData({ ...formData, teacherIds: formData.teacherIds.filter(id => id !== t.id) });
                             }
                           }}
                        />
                        <span className="text-sm font-medium">{t.name}</span>
                      </label>
                   ))}
                   {teachers.length === 0 && <span className="text-sm text-muted-foreground p-2">No teachers found.</span>}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingBatch ? 'Update Batch Details' : 'Create Batch'}
              </Button>
            </form>

            {editingBatch && (
              <div className="mt-8 border-t pt-6">
                <div className="page-toolbar mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-500" />
                    Students in this Batch ({batchStudents.length})
                  </h3>
                </div>

                {loadingStudents ? (
                  <div className="flex justify-center p-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
                  </div>
                ) : batchStudents.length > 0 ? (
                  <div className="border rounded-xl overflow-hidden divide-y">
                    {batchStudents.map((student) => (
                      <div key={student.id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                        {editingStudentId === student.id ? (
                          <div className="flex-1 flex flex-col sm:flex-row gap-3">
                            <Input 
                              value={editStudentData.name}
                              onChange={(e) => setEditStudentData({ ...editStudentData, name: e.target.value })}
                              placeholder="Name"
                              className="h-9"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleUpdateStudent(student.id)}>Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingStudentId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p className="font-bold text-slate-900">{student.name || 'Unnamed Student'}</p>
                              <p className="text-xs text-slate-500">{student.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setEditingStudentId(student.id);
                                  setEditStudentData({ name: student.name || '', email: student.email || '' });
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeStudentFromBatch(student.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed text-slate-400">
                    No students currently in this batch.
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Upload Students - {uploadingBatch?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-100 italic">
                CSV should have headers: name, email, college_name, phone
              </div>
              
              {!uploadResult ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="csvFile">Select CSV File</Label>
                    <Input 
                      id="csvFile" 
                      type="file" 
                      accept=".csv" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleBulkUpload} 
                    disabled={!file || uploading}
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Students'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-sm">
                    <p className="font-bold text-green-700 mb-1">Upload Complete!</p>
                    <p>Total processed: {uploadResult.total}</p>
                    <p>Created: {uploadResult.created}</p>
                    <p>Updated: {uploadResult.updated}</p>
                  </div>
                  
                  {uploadResult.errors.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm max-h-40 overflow-y-auto">
                      <p className="font-bold text-red-700 mb-1">Errors ({uploadResult.errors.length}):</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {uploadResult.errors.map((error: any, i: number) => (
                          <li key={i}>Row {error.row}: {error.error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button className="w-full" onClick={() => {
                    setUploadDialogOpen(false);
                    setUploadResult(null);
                    setFile(null);
                    fetchBatches();
                  }}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
