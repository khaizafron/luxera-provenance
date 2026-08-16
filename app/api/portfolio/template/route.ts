import { NextResponse } from 'next/server';
import { buildPortfolioTemplateCsv } from '@/lib/portfolio/clients';

export async function GET() {
  return new NextResponse(buildPortfolioTemplateCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="luxera-portfolio-template.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
