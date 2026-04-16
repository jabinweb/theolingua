'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, RefreshCw, AlertCircle, UserCheck, Plus, Edit, UserX, Search, Upload, CheckSquare, ArrowUp, ArrowDown, Users, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BulkStudentUpload } from '@/components/admin/BulkStudentUpload';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Subscription {
  id: string;
  status: string;
  amount?: number;
  planType: string;
  startDate: string;
  endDate?: string;
  created_at: string;
}

interface RegisteredUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoUrl?: string | null;
  collegeName?: string | null;
  phone?: string | null;
  creationTime: string;
  lastSignInTime: string | null;
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  totalPayments: number;
  totalAmountPaid: number;
  role?: string;
  isActive?: boolean;
}

interface UserFormData {
  email: string;
  displayName: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR' | 'TEACHER';
  isActive: boolean;
  collegeName: string;
  phone: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role; // Get actual role from session
  const loading = status === 'loading';
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    displayName: '',
    password: '',
    role: 'USER',
    isActive: true,
    collegeName: '',
    phone: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'email' | 'college' | 'role' | 'joined' | 'payments'>('joined');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Enhanced admin check
  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = loading || (user && userRole === null);

  useEffect(() => {
    // Only redirect if we're sure the user is not an admin and auth is fully loaded
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      console.log('Redirecting non-admin user to home');
      window.location.href = '/';
      return;
    }

    // Only fetch data once when user is confirmed admin and data hasn't been fetched yet
    if (isAdmin && !dataFetched) {
      const fetchData = async () => {
        setDataLoading(true);
        try {
          const usersResponse = await fetch('/api/admin/users');
          const usersData = await usersResponse.json();

          // Ensure array is returned and filter out invalid entries
          const validUsers = Array.isArray(usersData) 
            ? usersData.filter(u => u && u.uid && u.email) 
            : [];
          setRegisteredUsers(validUsers);
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching users data:', error);
          setRegisteredUsers([]);
          setDataFetched(true);
        } finally {
          setDataLoading(false);
        }
      };

      fetchData();
    } else if (!isLoadingAuth && !user) {
      setDataLoading(false);
    } else if (!isLoadingAuth && userRole !== 'ADMIN') {
      setDataLoading(false);
    }
  }, [isAdmin, isLoadingAuth, dataFetched, user, userRole]);

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setRegisteredUsers(registeredUsers.filter(user => user.uid !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        refreshData();
        setFormOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.uid,
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
          isActive: formData.isActive,
          collegeName: formData.collegeName,
          phone: formData.phone,
        }),
      });

      if (response.ok) {
        refreshData();
        setFormOpen(false);
        setEditingUser(null);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      displayName: '',
      password: '',
      role: 'USER',
      isActive: true,
      collegeName: '',
      phone: '',
    });
  };

  const openEditForm = (user: RegisteredUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      displayName: user.displayName || '',
      password: '', // Don't populate password for editing
      role: (user.role as 'USER' | 'ADMIN' | 'MODERATOR' | 'TEACHER') || 'USER',
      isActive: user.isActive !== false,
      collegeName: user.collegeName || '',
      phone: user.phone || '',
    });
    setFormOpen(true);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          isActive: !currentStatus 
        }),
      });
      
      if (response.ok) {
        refreshData();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const refreshData = async () => {
    setDataLoading(true);
    try {
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();
      
      // Filter out invalid entries
      const validUsers = Array.isArray(usersData) 
        ? usersData.filter(u => u && u.uid && u.email) 
        : [];
      setRegisteredUsers(validUsers);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setRegisteredUsers([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Bulk action handlers
  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.uid)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedUsers.size} user(s)?`)) return;
    
    setBulkActionLoading(true);
    try {
      const deletePromises = Array.from(selectedUsers).map(userId =>
        fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      setSelectedUsers(new Set());
      refreshData();
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      alert('Some users could not be deleted');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const updatePromises = Array.from(selectedUsers).map(userId =>
        fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, isActive: true }),
        })
      );
      
      await Promise.all(updatePromises);
      setSelectedUsers(new Set());
      refreshData();
    } catch (error) {
      console.error('Error bulk activating users:', error);
      alert('Some users could not be activated');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.size === 0) return;
    
    if (!confirm(`Are you sure you want to deactivate ${selectedUsers.size} user(s)?`)) return;
    
    setBulkActionLoading(true);
    try {
      const updatePromises = Array.from(selectedUsers).map(userId =>
        fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, isActive: false }),
        })
      );
      
      await Promise.all(updatePromises);
      setSelectedUsers(new Set());
      refreshData();
    } catch (error) {
      console.error('Error bulk deactivating users:', error);
      alert('Some users could not be deactivated');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    let filtered = registeredUsers;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user?.displayName?.toLowerCase().includes(searchLower) ||
        user?.email?.toLowerCase().includes(searchLower) ||
        user?.role?.toLowerCase().includes(searchLower) ||
        user?.collegeName?.toLowerCase().includes(searchLower) ||
        user?.phone?.includes(searchTerm.trim())
      );
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user?.role === filterRole);
    }

    // Apply status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(user => user?.hasActiveSubscription);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(user => !user?.hasActiveSubscription);
    } else if (filterStatus === 'enabled') {
      filtered = filtered.filter(user => user?.isActive !== false);
    } else if (filterStatus === 'disabled') {
      filtered = filtered.filter(user => user?.isActive === false);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a?.displayName?.toLowerCase() || '';
          bValue = b?.displayName?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a?.email?.toLowerCase() || '';
          bValue = b?.email?.toLowerCase() || '';
          break;
        case 'college':
          aValue = a?.collegeName?.toLowerCase() || '';
          bValue = b?.collegeName?.toLowerCase() || '';
          break;
        case 'role':
          aValue = a?.role || '';
          bValue = b?.role || '';
          break;
        case 'joined':
          aValue = new Date(a?.creationTime || 0).getTime();
          bValue = new Date(b?.creationTime || 0).getTime();
          break;
        case 'payments':
          aValue = a?.totalAmountPaid || 0;
          bValue = b?.totalAmountPaid || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [registeredUsers, searchTerm, filterRole, filterStatus, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Show loading while checking auth and role
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground">Please sign in to access the admin panel.</p>
        </div>
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

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
                User Directory
              </h1>
              <p className="text-gray-500 font-medium text-lg">Manage registered students, faculty and administrative roles</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={refreshData} variant="outline" disabled={dataLoading} className="rounded-2xl h-11 px-6">
                <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setBulkUploadOpen(true)} variant="theo-black" className="rounded-2xl h-11 px-6">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
              <Button onClick={() => setFormOpen(true)} variant="theo" className="rounded-2xl h-11 px-6 shadow-lg shadow-theo-yellow/20">
                <Plus className="h-5 w-5 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <Card className="mb-8 border-0 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Query students, faculty or institutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-2xl border-theo-black/5 bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-3">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[160px] h-12 rounded-2xl border-theo-black/5 bg-gray-50/50">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-theo-black/5">
                    <SelectItem value="all">Every Role</SelectItem>
                    <SelectItem value="USER">Students</SelectItem>
                    <SelectItem value="TEACHER">Staff</SelectItem>
                    <SelectItem value="MODERATOR">Mentors</SelectItem>
                    <SelectItem value="ADMIN">Admins</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] h-12 rounded-2xl border-theo-black/5 bg-gray-50/50">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-theo-black/5">
                    <SelectItem value="all">Universal Status</SelectItem>
                    <SelectItem value="active">Subscribed</SelectItem>
                    <SelectItem value="inactive">Free Tier</SelectItem>
                    <SelectItem value="enabled">Active Access</SelectItem>
                    <SelectItem value="disabled">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedUsers.size > 0 && (
          <Card className="mb-6 bg-theo-yellow/10 border-theo-yellow/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-theo-black" />
                  <span className="font-bold text-theo-black">
                    {selectedUsers.size} user(s) selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleBulkActivate} 
                    variant="outline" 
                    size="sm"
                    disabled={bulkActionLoading}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                  <Button 
                    onClick={handleBulkDeactivate} 
                    variant="outline" 
                    size="sm"
                    disabled={bulkActionLoading}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                  <Button 
                    onClick={handleBulkDelete} 
                    variant="destructive" 
                    size="sm"
                    disabled={bulkActionLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button 
                    onClick={() => setSelectedUsers(new Set())} 
                    variant="ghost" 
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Users</CardTitle>
              <Users className="h-5 w-5 text-theo-black/20" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-theo-black tracking-tighter">{registeredUsers.length}</div>
              {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                <p className="text-xs text-theo-yellow font-bold mt-1">
                  {filteredUsers.length} matches
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group bg-theo-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-theo-yellow/50">Pulse Rate</CardTitle>
              <UserCheck className="h-5 w-5 text-theo-yellow/20" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-theo-yellow tracking-tighter">
                {registeredUsers.filter(u => u.hasActiveSubscription).length}
              </div>
              <p className="text-xs text-theo-yellow/30 font-bold mt-1">Active Subscribers</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Transactions</CardTitle>
              <CheckSquare className="h-5 w-5 text-theo-black/20" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-theo-black tracking-tighter">
                {registeredUsers.reduce((sum, u) => sum + u.totalPayments, 0)}
              </div>
              <p className="text-xs text-gray-400 font-bold mt-1">Total Lifetime</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden group bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Net Value</CardTitle>
              <DollarSign className="h-5 w-5 text-theo-black/20" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-theo-black tracking-tighter">
                ₹{Math.round(registeredUsers.reduce((sum, u) => sum + u.totalAmountPaid, 0) / 100).toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 font-bold mt-1">Gross Revenue</p>
            </CardContent>
          </Card>
        </div>


        {/* Users List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={toggleSelectAll}
                  id="select-all"
                />
                <Label htmlFor="select-all" className="text-sm cursor-pointer">
                  Select All
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium w-12">
                        <Checkbox
                          checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="text-left p-3 font-medium">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          Student
                          {sortField === 'name' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-3 font-medium">
                        <button
                          onClick={() => handleSort('college')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          College
                          {sortField === 'college' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-3 font-medium">
                        <button
                          onClick={() => handleSort('role')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          Role
                          {sortField === 'role' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">
                        <button
                          onClick={() => handleSort('payments')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          Revenue
                          {sortField === 'payments' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </button>
                      </th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((registeredUser) => {
                      if (!registeredUser) return null;
                      
                      return (
                        <tr key={registeredUser.uid} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <Checkbox
                              checked={selectedUsers.has(registeredUser.uid)}
                              onCheckedChange={() => toggleSelectUser(registeredUser.uid)}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                {registeredUser.photoUrl && (
                                  <AvatarImage src={registeredUser.photoUrl} alt={registeredUser.displayName || 'User'} />
                                )}
                                <AvatarFallback className="bg-theo-black text-theo-yellow text-xs font-bold">
                                  {registeredUser.displayName?.[0] || registeredUser.email?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{registeredUser.displayName || 'Anonymous'}</div>
                                <div className="text-xs text-muted-foreground">{registeredUser.email}</div>
                                {registeredUser.phone && (
                                  <div className="text-xs text-muted-foreground">📱 {registeredUser.phone}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            {registeredUser.collegeName || <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="p-3">
                            <Badge 
                              variant={registeredUser.role === 'ADMIN' ? 'destructive' : registeredUser.role === 'TEACHER' ? 'default' : 'outline'}
                            >
                              {registeredUser.role || 'USER'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              <Badge variant={registeredUser.hasActiveSubscription ? 'default' : 'secondary'} className="w-fit text-xs">
                                {registeredUser.hasActiveSubscription ? 'Subscriber' : 'Free'}
                              </Badge>
                              {registeredUser.isActive === false && (
                                <Badge variant="secondary" className="w-fit text-xs">
                                  Disabled
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="font-medium">₹{Math.round(registeredUser.totalAmountPaid / 100).toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {registeredUser.totalPayments} payment{registeredUser.totalPayments !== 1 ? 's' : ''}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Joined {new Date(registeredUser.creationTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditForm(registeredUser)}
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleUserStatus(registeredUser.uid, registeredUser.isActive !== false)}
                                title={registeredUser.isActive !== false ? 'Disable user' : 'Enable user'}
                              >
                                {registeredUser.isActive !== false ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteUser(registeredUser.uid)}
                                className="text-destructive hover:text-destructive"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredUsers.length > 0 && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {/* First page */}
                    {currentPage > 2 && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {currentPage > 3 && <PaginationEllipsis />}
                      </>
                    )}
                    
                    {/* Previous page */}
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(currentPage - 1)} className="cursor-pointer">
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Current page */}
                    <PaginationItem>
                      <PaginationLink isActive className="cursor-pointer">
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>
                    
                    {/* Next page */}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(currentPage + 1)} className="cursor-pointer">
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Last page */}
                    {currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && <PaginationEllipsis />}
                        <PaginationItem>
                          <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <Dialog open={formOpen} onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingUser(null);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={!!editingUser} // Don't allow email changes for existing users
                  />
                </div>
                
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="collegeName">College Name</Label>
                  <Input
                    id="collegeName"
                    value={formData.collegeName}
                    onChange={(e) => setFormData(prev => ({ ...prev, collegeName: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="10-digit phone number (optional)"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required={!editingUser}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'USER' | 'ADMIN' | 'MODERATOR' | 'TEACHER') => 
                      setFormData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active User</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bulk Student Upload Dialog */}
        <BulkStudentUpload
          isOpen={bulkUploadOpen}
          onClose={() => setBulkUploadOpen(false)}
          onComplete={refreshData}
        />
      </div>
    </div>
  );
}
