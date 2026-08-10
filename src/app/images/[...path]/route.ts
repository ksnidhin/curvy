import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  // In Next.js 15, params is a Promise
  const resolvedParams = await Promise.resolve(params);
  const pathSegments = resolvedParams.path;
  
  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse('Bad Request', { status: 400 });
  }
  
  // Construct the physical file path: process.cwd()/public/images/[...path]
  const filePath = path.join(process.cwd(), 'public', 'images', ...pathSegments);
  
  try {
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      
      // Determine content type based on extension
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } else {
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
