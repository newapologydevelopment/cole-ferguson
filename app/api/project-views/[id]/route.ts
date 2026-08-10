import { getProjectViewsByIdCached } from '@/sanity/lib/client';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
  }

  const project = await getProjectViewsByIdCached(id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({
    views: project.views ?? [],
    images: project.images ?? [],
  });
}
