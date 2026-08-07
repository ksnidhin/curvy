import { NextResponse } from 'next/server';
import { settingsRepository } from '@/lib/repositories/settings.repository';

export async function GET() {
  try {
    const settings = await settingsRepository.getSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
