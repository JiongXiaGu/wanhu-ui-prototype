import { appendFileSync, readFileSync } from 'node:fs';
import { classifyFile, moduleById } from './ui-review-modules.mjs';

const inputIndex=process.argv.indexOf('--input');
if(inputIndex<0 || !process.argv[inputIndex+1]){
  console.error('Usage: node scripts/check-pr-scope.mjs --input <changed-files.txt>');
  process.exit(2);
}
const files=readFileSync(process.argv[inputIndex+1],'utf8')
  .split(/\r?\n/)
  .map(value=>value.trim())
  .filter(Boolean);

const modules=new Set();
const unclassified=[];
let runtimeFiles=0;
let reviewScripts=0;
let infraTouched=false;
let toolchainTouched=false;

for(const file of files){
  const result=classifyFile(file);
  if(result.reviewScript) reviewScripts++;
  if(result.kind==='module'){ modules.add(result.module); runtimeFiles++; }
  else if(result.kind==='unclassified'){ unclassified.push(file); runtimeFiles++; }
  else if(result.kind==='infra') infraTouched=true;
  else if(result.kind==='toolchain') toolchainTouched=true;
}

const errors=[];
if(unclassified.length) errors.push('Unclassified Runtime files: '+unclassified.join(', '));
if(modules.size>1) errors.push('PR crosses module boundaries: '+[...modules].join(' + '));
if(reviewScripts>1 && !infraTouched) errors.push('Feature PR may change at most one capture review script; found '+reviewScripts+'.');
if(runtimeFiles>6) errors.push('Feature PR exceeds 6 Runtime files; split the visual intent into smaller PRs. Runtime files='+runtimeFiles+'.');
if(toolchainTouched && modules.size) errors.push('Toolchain/package changes must not be mixed with a Feature module PR.');

let module='docs';
if(modules.size===1) module=[...modules][0];
else if(toolchainTouched) module='toolchain';
else if(infraTouched) module='review-infra';

const definition=moduleById(module);
if(!definition) errors.push('No review mapping for module: '+module);

console.log('PR scope module:',module);
console.log('Changed files:',files.length,'Runtime files:',runtimeFiles,'Review scripts:',reviewScripts);
if(definition) console.log('Review groups:',definition.reviews.join(',')||'(none)');

if(errors.length){
  for(const error of errors) console.error('Scope error:',error);
  process.exit(1);
}

if(process.env.GITHUB_OUTPUT){
  appendFileSync(process.env.GITHUB_OUTPUT,'module='+module+'\n');
  appendFileSync(process.env.GITHUB_OUTPUT,'reviews='+(definition?.reviews.join(',')??'')+'\n');
}
