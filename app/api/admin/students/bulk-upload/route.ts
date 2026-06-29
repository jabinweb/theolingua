import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserWithPassword } from '@/lib/auth-helpers';
import { isAdminOrModerator } from '@/lib/auth-utils';

const DEFAULT_PASSWORD = 'Student@123';

interface ProcessResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  batchAssigned: number;
  errors: Array<{ row: number; error: string; data: Record<string, string> }>;
}

function normalizeHeader(header: string) {
  return header.toLowerCase().trim().replace(/\s+/g, '_');
}

function parseCSVLine(line: string): string[] {
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
}

function getField(data: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) {
    const value = data[alias];
    if (value?.trim()) return value.trim();
  }
  return '';
}

function hasAnyHeader(headers: string[], aliases: string[]) {
  return aliases.some((alias) => headers.includes(alias));
}

export async function POST(request: Request) {
  try {
    const [authOk, authVal] = await isAdminOrModerator();
    if (!authOk) return authVal;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const batchId = (formData.get('batchId') as string | null)?.trim() || null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (batchId) {
      const batch = await prisma.batch.findUnique({ where: { id: batchId } });
      if (!batch) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 400 });
      }
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must contain header and at least one data row' },
        { status: 400 }
      );
    }

    const headers = parseCSVLine(lines[0]).map(normalizeHeader);

    if (!hasAnyHeader(headers, ['name', 'student_name', 'full_name'])) {
      return NextResponse.json({ error: 'Missing required column: name' }, { status: 400 });
    }
    if (!hasAnyHeader(headers, ['email', 'email_address'])) {
      return NextResponse.json({ error: 'Missing required column: email' }, { status: 400 });
    }
    if (!hasAnyHeader(headers, ['college_name', 'college', 'institution', 'school', 'school_name'])) {
      return NextResponse.json(
        { error: 'Missing required column: college_name (or college)' },
        { status: 400 }
      );
    }

    const result: ProcessResult = {
      success: true,
      total: lines.length - 1,
      created: 0,
      updated: 0,
      batchAssigned: 0,
      errors: [],
    };

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const studentData: Record<string, string> = {};

      headers.forEach((header, index) => {
        studentData[header] = values[index] || '';
      });

      try {
        const name = getField(studentData, ['name', 'student_name', 'full_name']);
        const email = getField(studentData, ['email', 'email_address']).toLowerCase();
        const collegeName = getField(studentData, [
          'college_name',
          'college',
          'institution',
          'school',
          'school_name',
        ]);
        const phone = getField(studentData, ['phone', 'phone_number', 'mobile']).replace(/\s+/g, '');

        if (!name || !email || !collegeName) {
          result.errors.push({
            row: i + 1,
            error: 'Name, email, and college name are required',
            data: studentData,
          });
          continue;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          result.errors.push({
            row: i + 1,
            error: 'Invalid email format',
            data: studentData,
          });
          continue;
        }

        if (phone) {
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(phone)) {
            result.errors.push({
              row: i + 1,
              error: 'Phone number must be 10 digits when provided',
              data: studentData,
            });
            continue;
          }
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });

        let userId: string;

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name,
              collegeName,
              phone: phone || null,
              role: 'STUDENT',
              isActive: true,
              ...(batchId ? { batchId } : {}),
            },
          });
          userId = existingUser.id;
          result.updated++;
        } else {
          const user = await createUserWithPassword({
            email,
            name,
            password: DEFAULT_PASSWORD,
            collegeName,
            phone: phone || undefined,
            role: 'STUDENT',
            isActive: true,
          });
          userId = user.id;

          if (batchId) {
            await prisma.user.update({
              where: { id: userId },
              data: { batchId },
            });
          }

          result.created++;
        }

        if (batchId) {
          result.batchAssigned++;
        }
      } catch (error) {
        result.errors.push({
          row: i + 1,
          error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: studentData,
        });
      }
    }

    result.success = result.errors.length === 0;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
