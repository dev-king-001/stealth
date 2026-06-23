const prettier = require('prettier');
const fs = require('fs');
const file = 'tools/v2/team/project-mail-binder/components/ProjectMailBinder.tsx';

async function formatFile() {
  const code = fs.readFileSync(file, 'utf8');
  const options = await prettier.resolveConfig(file);
  const formatted = await prettier.format(code, { ...options, filepath: file });
  fs.writeFileSync(file, formatted);
  console.log("Formatted!");
}

formatFile().catch(console.error);
