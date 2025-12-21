#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Angular version from package.json
let angularVersion = null;
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    angularVersion = packageJson.dependencies?.['@angular/core'];
    if (angularVersion && angularVersion.startsWith('^')) {
      angularVersion = angularVersion.substring(1);
    }
  }
} catch {}

// Environment configurations
const environments = {
  development: {
    production: false,
    apiUrl: 'http://localhost:9001',
    outputFile: 'src/environments/environment.ts'
  },
  production: {
    production: true,
    apiUrl: 'http://backend.home-lab.com',
    outputFile: 'src/environments/environment.prod.ts'
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  includeBuildTime: args.includes('--build-time'),
  includeNodeVersion: args.includes('--node-version'),
  includeAngularVersion: args.includes('--angular-version'),
  includeNpmVersion: args.includes('--npm-version'),
  environment: null
};

// Check for environment flag
const envIndex = args.findIndex(arg => arg.startsWith('--env='));
if (envIndex !== -1) {
  const envName = args[envIndex].split('=')[1];
  if (environments[envName]) {
    options.environment = envName;
  } else {
    console.error(`Error: Unknown environment '${envName}'. Available: ${Object.keys(environments).join(', ')}`);
    process.exit(1);
  }
}

// Replace template placeholders
async function replaceTemplate(template, config) {
  let result = template;

  result = result.replace(/###production###/g, config.production);
  const apiUrl = config.apiUrl.startsWith("'") ? config.apiUrl : `'${config.apiUrl}'`;
  result = result.replace(/###apiUrl###/g, apiUrl);

  if (options.includeBuildTime) {
    const buildTime = new Date().toISOString();
    result = result.replace(/###buildTime###/g, `'${buildTime}'`);
  } else {
    result = result.replace(/###buildTime###/g, 'undefined');
  }

  if (options.includeNodeVersion) {
    const nodeVersion = process.version;
    result = result.replace(/###nodeVersion###/g, `'${nodeVersion}'`);
  } else {
    result = result.replace(/###nodeVersion###/g, 'undefined');
  }

  if (options.includeAngularVersion) {
    result = result.replace(/###angularVersion###/g,
      angularVersion ? `'${angularVersion}'` : 'undefined');
  } else {
    result = result.replace(/###angularVersion###/g, 'undefined');
  }

  if (options.includeNpmVersion) {
    const { execSync } = await import('child_process');
    const npmVersion = execSync('npm --version').toString().trim();
    result = result.replace(/###npmVersion###/g, `'${npmVersion}'`);
  } else {
    result = result.replace(/###npmVersion###/g, 'undefined');
  }

  return result;
}

// Main generation function
async function generateEnvironmentFiles() {
  const templatePath = path.join(process.cwd(), 'src/environments/environment.ts.template');

  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template file not found: ${templatePath}`);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const envsToProcess = options.environment ?
    { [options.environment]: environments[options.environment] } :
    environments;

  for (const [envName, config] of Object.entries(envsToProcess)) {
    const content = await replaceTemplate(template, config);
    const outputPath = path.join(process.cwd(), config.outputFile);
    fs.writeFileSync(outputPath, content, 'utf8');
  }
}

// Run the generator
await generateEnvironmentFiles();