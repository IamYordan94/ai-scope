import { NextResponse } from 'next/server';
import { getAllTools, getAllCategories } from '@/lib/supabase';

export async function GET() {
  try {
    // Test getAllTools function
    let tools: any[] = [];
    let toolsError: string | null = null;
    try {
      tools = await getAllTools();
    } catch (e: any) {
      toolsError = e.message;
      console.error('getAllTools error:', e);
    }
    
    // Test getAllCategories
    let categories: any[] = [];
    let categoriesError: string | null = null;
    try {
      categories = await getAllCategories();
    } catch (e: any) {
      categoriesError = e.message;
      console.error('getAllCategories error:', e);
    }
    
    return NextResponse.json({
      success: true,
      tools: {
        count: tools.length,
        error: toolsError,
        sample: tools.slice(0, 5).map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          slug: t.slug,
        })),
      },
      categories: {
        count: categories.length,
        error: categoriesError,
        list: categories.map(c => ({
          id: c.id,
          name: c.name,
          toolCount: tools.filter(t => t.category === c.name).length,
        })),
      },
      summary: {
        totalTools: tools.length,
        totalCategories: categories.length,
        toolsByCategory: categories.reduce((acc, cat) => {
          acc[cat.name] = tools.filter(t => t.category === cat.name).length;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
