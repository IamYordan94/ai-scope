'use client';

import { Tool } from '@/types/tool';
import { formatPricing } from '@/lib/tools';
import { X } from 'lucide-react';

interface ToolComparisonProps {
  tools: Tool[];
  onRemove: (toolId: string) => void;
}

export default function ToolComparison({ tools, onRemove }: ToolComparisonProps) {
  if (tools.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Select tools to compare
      </div>
    );
  }

  const allFeatures = new Set<string>();
  tools.forEach(tool => {
    tool.features.forEach(feature => allFeatures.add(feature));
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
            <th className="border border-gray-200 p-4 text-left font-semibold text-gray-900">Feature</th>
            {tools.map((tool) => (
              <th key={tool.id} className="border border-gray-200 p-4 text-center relative">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-gray-900">{tool.name}</span>
                  <button
                    onClick={() => onRemove(tool.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${tool.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-50">
            <td className="border border-gray-200 p-4 font-medium text-gray-900">Pricing</td>
            {tools.map((tool) => (
              <td key={tool.id} className="border border-gray-200 p-4 text-center">
                <span className="font-medium text-gray-900">{formatPricing(tool.pricing_details)}</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="border border-gray-200 p-4 font-medium text-gray-900">Free Tier</td>
            {tools.map((tool) => (
              <td key={tool.id} className="border border-gray-200 p-4 text-center">
                {tool.pricing_free ? (
                  <span className="text-green-600 font-bold text-lg">✓</span>
                ) : (
                  <span className="text-gray-300">✗</span>
                )}
              </td>
            ))}
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-gray-200 p-4 font-medium text-gray-900">Category</td>
            {tools.map((tool) => (
              <td key={tool.id} className="border border-gray-200 p-4 text-center">
                <span className="text-gray-700">{tool.category || 'N/A'}</span>
              </td>
            ))}
          </tr>
          {Array.from(allFeatures).map((feature) => (
            <tr key={feature} className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-200 p-4 font-medium text-gray-900">{feature}</td>
              {tools.map((tool) => (
                <td key={tool.id} className="border border-gray-200 p-4 text-center">
                  {tool.features.includes(feature) ? (
                    <span className="text-green-600 font-bold text-lg">✓</span>
                  ) : (
                    <span className="text-gray-300">✗</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
