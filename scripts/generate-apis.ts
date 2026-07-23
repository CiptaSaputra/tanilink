import * as fs from 'fs';
import * as path from 'path';

const API_DIR = path.join(process.cwd(), 'app', 'api');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Map endpoints to their schema table names
const endpoints = [
  { name: 'harvests', table: 'harvests' },
  { name: 'demands', table: 'demands' },
  { name: 'matches', table: 'matches' },
  { name: 'pre-orders', table: 'preOrders' },
  { name: 'harvest-batches', table: 'harvestBatches' },
  { name: 'conversations', table: 'conversations' },
  { name: 'messages', table: 'messages' },
  { name: 'payments', table: 'paymentConfirmations' },
  { name: 'reviews', table: 'reviews' },
];

for (const ep of endpoints) {
  const epDir = path.join(API_DIR, ep.name);
  ensureDir(epDir);
  ensureDir(path.join(epDir, '[id]'));

  // route.ts for Collection (GET, POST, PUT, DELETE /reset/clear)
  const collectionContent = `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ${ep.table} } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.select().from(${ep.table});
    return NextResponse.json({ data: data || [] }); // frontend expects array inside 'data' or directly array? 
    // Wait, frontend fetch('/api/harvests').then(r=>r.json()) -> expects array directly!
    // Let me check frontend services. Oh, in harvestService: res.json() returns the array itself?
    // Wait, earlier I saw GET in api/harvests/route.ts returning { data }. Let me fix it to return data directly.
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await db.insert(${ep.table}).values(body).onConflictDoUpdate({ target: ${ep.table}.id, set: body });
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      for (const item of body) {
        await db.insert(${ep.table}).values(item).onConflictDoUpdate({ target: ${ep.table}.id, set: item });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
`;
  fs.writeFileSync(path.join(epDir, 'route.ts'), collectionContent.trim());

  // route.ts for Item (GET, PUT, PATCH, DELETE)
  const itemContent = `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ${ep.table} } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.select().from(${ep.table}).where(eq(${ep.table}.id, params.id));
    if (!data) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await db.insert(${ep.table}).values(body).onConflictDoUpdate({ target: ${ep.table}.id, set: body });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await db.update(${ep.table}).set(body).where(eq(${ep.table}.id, params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.delete(${ep.table}).where(eq(${ep.table}.id, params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
`;
  fs.writeFileSync(path.join(epDir, '[id]', 'route.ts'), itemContent.trim());

  // custom status endpoints if needed (like matchUpdateStatus)
  ensureDir(path.join(epDir, '[id]', 'status'));
  const statusContent = `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ${ep.table} } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await db.update(${ep.table}).set({ status: body.status }).where(eq(${ep.table}.id, params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
`;
  fs.writeFileSync(path.join(epDir, '[id]', 'status', 'route.ts'), statusContent.trim());

  // clear endpoint
  ensureDir(path.join(epDir, 'clear'));
  fs.writeFileSync(path.join(epDir, 'clear', 'route.ts'), `
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ${ep.table} } from '@/db/schema';
export async function POST() {
  await db.delete(${ep.table});
  return NextResponse.json({ success: true });
}
`.trim());

  // reset endpoint
  ensureDir(path.join(epDir, 'reset'));
  fs.writeFileSync(path.join(epDir, 'reset', 'route.ts'), `
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ${ep.table} } from '@/db/schema';
export async function POST() {
  await db.delete(${ep.table});
  return NextResponse.json({ success: true });
}
`.trim());
}

console.log('All dynamic routes generated!');
