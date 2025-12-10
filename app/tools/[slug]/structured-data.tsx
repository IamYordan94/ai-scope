import { Tool } from '@/types/tool';

export function ToolStructuredData({ tool }: { tool: Tool }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: 'AI Tool',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: tool.pricing_free ? '0' : 'Varies',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      ratingCount: '1',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
