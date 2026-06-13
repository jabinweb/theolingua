'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ChangePasswordForm } from '@/components/dashboard/ChangePasswordForm';
import { 
  Calendar,
  Mail,
  Phone,
  User,
  School
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  displayName: string | null;
  grade: string | null;
  section: string | null;
  rollNumber: string | null;
  phone: string | null;
  parentName: string | null;
  parentEmail: string | null;
  joinDate: string;
  collegeName: string | null;
  school: {
    id: string;
    name: string;
  } | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    collegeName: ''
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          setFormData({
            name: profile.name || '',
            phone: profile.phone || '',
            collegeName: profile.collegeName || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  const displayName = userProfile?.displayName || userProfile?.name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = userProfile?.joinDate ? new Date(userProfile.joinDate).toLocaleDateString() : 'Not available';

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setIsEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        collegeName: userProfile.collegeName || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tighter text-theo-black md:text-3xl">My Profile</h1>
        <p className="mt-1 text-gray-600">Manage your account information</p>
      </div>

      <Card className="mb-6 overflow-hidden border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 bg-white pb-6 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-gray-200">
                <AvatarImage src={user.image || ''} alt={displayName} />
                <AvatarFallback className="bg-theo-yellow/30 text-theo-black text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="mb-1 text-2xl font-bold text-theo-black">{displayName}</h2>
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {joinDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user?.role && (
                <Badge variant="secondary" className="border-gray-200 bg-gray-50 text-gray-700">
                  {user.role}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="bg-white">
                {/* Action Buttons */}
                <div className="px-8 pt-8 pb-4 flex justify-end border-b">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <Button onClick={handleSave} disabled={isLoading} variant="theo">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} variant="theo">
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Profile Content */}
                <div className="p-8">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="collegeName" className="text-gray-700 font-medium flex items-center gap-2">
                        <School className="h-4 w-4" />
                        College Name
                      </Label>
                      <Input
                        id="collegeName"
                        value={formData.collegeName}
                        onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter your college name"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-blue-600 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                        <p className="font-semibold text-gray-900 truncate">{userProfile?.name || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-purple-600 rounded-lg">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                        <p className="font-semibold text-gray-900 truncate">{userProfile?.email || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-green-600 rounded-lg">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                        <p className="font-semibold text-gray-900 truncate">{userProfile?.phone || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-orange-600 rounded-lg">
                        <School className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600 mb-1">College</p>
                        <p className="font-semibold text-gray-900 truncate">{userProfile?.collegeName || userProfile?.school?.name || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-white pb-4 pt-6">
              <h3 className="text-lg font-bold text-theo-black">Security settings</h3>
              <p className="text-sm text-gray-600">Change your password</p>
            </CardHeader>
            <CardContent className="p-6">
              <ChangePasswordForm />
            </CardContent>
          </Card>
    </div>
  );
}