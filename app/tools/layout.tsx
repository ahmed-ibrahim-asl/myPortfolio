import React from 'react';
import { ToolPortfolioBridge } from '@/components/tools/ToolPortfolioBridge';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<ToolPortfolioBridge /></>;
}
