/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GET /api/matches — ambil semua match
 */

import { NextResponse } from 'next/server';
import { matchGetAll } from '@/services';

export async function GET() {
  try {
    const matches = matchGetAll();
    return NextResponse.json({ data: matches });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data matches' }, { status: 500 });
  }
}
