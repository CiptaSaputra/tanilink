import * as fs from 'fs';
import * as path from 'path';

const API_DIR = path.join(process.cwd(), 'app', 'api');

function replaceParamsInFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace: { params }: { params: { id: string } }
  // With: { params }: { params: Promise<{ id: string }> }
  content = content.replace(
    /\{ params \}: \{ params: \{ id: string \} \}/g, 
    "{ params }: { params: Promise<{ id: string }> }"
  );

  // Replace: params.id
  // With: (await params).id
  content = content.replace(/params\.id/g, "(await params).id");

  fs.writeFileSync(filePath, content);
}

const endpoints = fs.readdirSync(API_DIR);

for (const ep of endpoints) {
  const epDir = path.join(API_DIR, ep);
  const idRoutePath = path.join(epDir, '[id]', 'route.ts');
  const statusRoutePath = path.join(epDir, '[id]', 'status', 'route.ts');
  
  replaceParamsInFile(idRoutePath);
  
  if (['conversations', 'messages', 'reviews'].includes(ep)) {
    const statusDir = path.join(epDir, '[id]', 'status');
    if (fs.existsSync(statusDir)) {
      fs.rmSync(statusDir, { recursive: true, force: true });
    }
  } else {
    replaceParamsInFile(statusRoutePath);
  }
}
console.log('Fixed API routes signatures and deleted invalid status routes.');
