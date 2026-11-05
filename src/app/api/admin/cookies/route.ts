import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const COOKIES_FILE = path.join(process.cwd(), 'data/cookies.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const content = await fs.readFile(COOKIES_FILE, 'utf-8');
    const data = JSON.parse(content);
    return NextResponse.json({ success: true, cookies: data }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ success: true, cookies: {} }, { headers: corsHeaders });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let existing: Record<string, string> = {};
    try {
      const content = await fs.readFile(COOKIES_FILE, 'utf-8');
      existing = JSON.parse(content);
    } catch {}

    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString()
    };

    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    await fs.writeFile(COOKIES_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Cookies updated successfully' }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
