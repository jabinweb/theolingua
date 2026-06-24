import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserWithPassword } from '@/lib/auth-helpers';

// Default password for all students created via bulk upload
const DEFAULT_PASSWORD = 'Student@123';

interface ProcessResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  errors: Array<{ row: number; error: string; data: Record<string, string> }>;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Read and parse CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain header and at least one data row' }, { status: 400 });
    }

    // Helper function to parse CSV line handling quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    const requiredHeaders = ['name', 'email', 'college_name'];
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingHeaders.join(', ')}` 
      }, { status: 400 });
    }

    const getPhone = (data: Record<string, string>) => (data.phone || '').replace(/\s+/g, '').trim();

    const result: ProcessResult = {
      success: true,
      total: lines.length - 1,
      created: 0,
      updated: 0,
      errors: []
    };

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const studentData: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        studentData[header] = values[index] || '';
      });

      try {
        // Validate required fields
        if (!studentData.name || !studentData.email || !studentData.college_name) {
          result.errors.push({
            row: i + 1,
            error: 'Name, email, and college name are required',
            data: studentData
          });
          continue;
        }

        const phone = getPhone(studentData);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
          result.errors.push({
            row: i + 1,
            error: 'Invalid email format',
            data: studentData
          });
          continue;
        }

        // Validate phone number only when provided
        if (phone) {
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(phone)) {
            result.errors.push({
              row: i + 1,
              error: 'Phone number must be 10 digits when provided',
              data: studentData
            });
            continue;
          }
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: studentData.email.toLowerCase() },
          select: { id: true, password: true }
        });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: studentData.name,
              collegeName: studentData.college_name,
              phone: phone || null,
              role: 'STUDENT',
              isActive: true,
            }
          });
          
          result.updated++;
        } else {
          // Create new user with default password
          await createUserWithPassword({
            email: studentData.email.toLowerCase(),
            name: studentData.name,
            password: DEFAULT_PASSWORD,
            collegeName: studentData.college_name,
            phone: phone || undefined,
            role: 'STUDENT',
            isActive: true,
          });
          
          result.created++;
        }

      } catch (error) {
        result.errors.push({
          row: i + 1,
          error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: studentData
        });
      }
    }

    // Determine overall success
    result.success = result.errors.length < result.total;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
