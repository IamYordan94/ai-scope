import { NextRequest, NextResponse } from 'next/server';
import { getAllTools, searchTools, getToolsByCategory } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let tools;
    if (search) {
      tools = await searchTools(search);
    } else if (category) {
      tools = await getToolsByCategory(category);
    } else {
      tools = await getAllTools();
    }

    // Ensure we always return an array
    return NextResponse.json(Array.isArray(tools) ? tools : []);
  } catch (error) {
    console.error('Error fetching tools:', error);
    // Return empty array instead of error object
    return NextResponse.json([]);
  }
}
