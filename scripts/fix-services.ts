import * as fs from 'fs';
import * as path from 'path';

const servicesDir = path.join(process.cwd(), 'src', 'services');
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('Service.ts'));

for (const file of files) {
  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace return res.json(); with return (await res.json()).data || await res.json(); for GET calls
  // Wait, let's just do a simple replacement for all `return res.json();`
  content = content.replace(/return res\.json\(\);/g, `
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
  `.trim());

  fs.writeFileSync(filePath, content);
}
console.log('Services updated to handle { data } wrappers');
