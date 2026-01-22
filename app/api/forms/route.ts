import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log the incoming request for debugging
    console.log('Proxying form submission:', body);
    
    // Save to local database first
    try {
      const formResponse = await prisma.formResponse.create({
        data: {
          formType: 'CONTACT', // Demo booking is a contact form
          name: body.data?.name || 'Unknown',
          email: body.email || body.data?.email || '',
          phone: body.phone || body.data?.phone || null,
          subject: body.formName || 'Demo Booking',
          message: body.data?.message || JSON.stringify(body.data),
          metadata: {
            formName: body.formName,
            source: body.source,
            tags: body.tags,
            organization: body.data?.organization,
            role: body.data?.role,
            program: body.data?.program,
            fullData: body.data
          },
          status: 'UNREAD'
        }
      });
      console.log('Saved to local database:', formResponse.id);
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if local save fails - external API is primary
    }
    
    // Make the request to the external API
    const response = await fetch('https://www.sciolabs.in/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('External API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { success: false, error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('External API response:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Proxy API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
