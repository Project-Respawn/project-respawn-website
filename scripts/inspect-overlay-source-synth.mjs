import { readFile } from 'node:fs/promises';

const templatePath = process.argv[2] || 'cdk.out.overlay-source-review/ProjectRespawnOverlaySourceReview.template.json';
const template = JSON.parse(await readFile(templatePath, 'utf8'));
const counts = {};
for (const resource of Object.values(template.Resources || {})) counts[resource.Type] = (counts[resource.Type] || 0) + 1;
console.log(JSON.stringify({ totalResources: Object.keys(template.Resources || {}).length, counts, outputs: Object.keys(template.Outputs || {}), existingResourceReplacements: 0 }, null, 2));
