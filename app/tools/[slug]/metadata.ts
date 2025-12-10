import { Metadata } from 'next';
import { getToolBySlug } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = await getToolBySlug(params.slug);
  
  if (!tool) {
    return {
      title: 'Tool Not Found - AI Tool Directory',
    };
  }

  return {
    title: `${tool.name} - AI Tool Directory`,
    description: tool.description || `Discover ${tool.name}, a ${tool.category || 'AI'} tool. ${tool.description?.substring(0, 120)}...`,
    openGraph: {
      title: `${tool.name} - AI Tool Directory`,
      description: tool.description || '',
      type: 'website',
    },
  };
}
