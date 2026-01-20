'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock,
  Users, 
} from 'lucide-react';

interface BookDemoProps {
  children: React.ReactNode;
}

export default function BookDemo({ children }: BookDemoProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    program: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {      
      const payload = {
        formName: 'Demo Booking',
        data: formData,
        email: formData.email,
        phone: formData.phone,
        status: 'new',
        source: 'TheoLingua Website',
        tags: 'demo-request'
      };
            
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setIsSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setOpen(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            organization: '',
            role: '',
            program: '',
            message: ''
          });
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Full error object:', error);
      
      let errorMessage = 'Failed to submit demo request. Please try again.';
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Network error: Unable to connect to the server. This might be due to CORS restrictions or network connectivity issues.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={handleOpenDialog}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-w-[95vw] mx-auto max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="w-5 h-5 text-blue-600" />
            Book a Demo Session
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Schedule a personalized demo to see how TheoLingua can transform your theological education programs.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">Demo Booked Successfully!</h3>
            <p className="text-sm sm:text-base text-green-600">We&apos;ll contact you within 24 hours to schedule your personalized demo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Mobile: Single column, Desktop: Two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-1">
                <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="mt-1"
                  required
                />
              </div>
              <div className="sm:col-span-1">
                <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-1">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-1">
                <Label htmlFor="role" className="text-sm font-medium">Your Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principal">Principal/Director</SelectItem>
                    <SelectItem value="hod">Head of Department</SelectItem>
                    <SelectItem value="faculty">Faculty Member</SelectItem>
                    <SelectItem value="coordinator">Training Coordinator</SelectItem>
                    <SelectItem value="admin">Administrative Staff</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="organization" className="text-sm font-medium">Institution/Organization *</Label>
              <Input
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="Your nursing college or healthcare institution"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="program" className="text-sm font-medium">Program of Interest</Label>
              <Select value={formData.program} onValueChange={(value) => handleSelectChange('program', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theolingua">TheoLingua</SelectItem>
                  <SelectItem value="theolingua-basics">TheoLingua Basics</SelectItem>
                  <SelectItem value="theolingua-advanced">TheoLingua Advanced</SelectItem>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="custom">Custom Solution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">Message (Optional)</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your specific needs or questions..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-xs sm:text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:flex-1 py-2.5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 py-2.5"
                disabled={isSubmitting}
              >
                <Clock className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Book Demo'}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 text-sm sm:text-base">What to expect:</h4>
              <ul className="text-xs sm:text-sm text-blue-700 mt-1 space-y-1">
                <li>• 30-minute personalized demo session</li>
                <li>• Program overview and customization options</li>
                <li>• Implementation roadmap discussion</li>
                <li>• Q&A with our education specialists</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
