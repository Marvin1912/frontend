#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for different environments
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
  dryRun: args.includes('--dry-run'),
  environment: null
};

// Check for specific environment flag
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

/**
 * Replace template placeholders with actual values
 */
function replaceTemplate(template, config, includeBuildTime = false) {
  let result = template;

  // Replace production flag
  result = result.replace(/###production###/g, config.production);

  // Replace API URL (ensure it's properly quoted)
  const apiUrl = config.apiUrl.startsWith("'") ? config.apiUrl : `'${config.apiUrl}'`;
  result = result.replace(/###apiUrl###/g, apiUrl);

  // Replace build time if requested
  if (includeBuildTime) {
    const buildTime = new Date().toISOString();
    result = result.replace(/###buildTime###/g, `'${buildTime}'`);
  } else {
    result = result.replace(/###buildTime###/g, 'undefined');
  }

  return result;
}

/**
 * Validate generated TypeScript content
 */
function validateTypeScript(content) {
  // Basic validation - check for obvious syntax errors
  const errors = [];

  // Check for unmatched quotes
  const quotes = content.match(/'/g);
  if (quotes && quotes.length % 2 !== 0) {
    errors.push('Unmatched quotes detected');
  }

  // Check for template placeholders that weren't replaced
  const placeholders = content.match(/###\w+###/g);
  if (placeholders) {
    errors.push(`Unreplaced placeholders: ${placeholders.join(', ')}`);
  }

  // Check for basic structure
  if (!content.includes('export const environment')) {
    errors.push('Missing export statement');
  }

  return errors;
}

/**
 * Main generation function
 */
function generateEnvironmentFiles() {
  const templatePath = path.join(process.cwd(), 'src/environments/environment.ts.template');

  // Check if template file exists
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template file not found: ${templatePath}`);
    process.exit(1);
  }

  // Read template file
  const template = fs.readFileSync(templatePath, 'utf8');

  // Determine which environments to process
  const envsToProcess = options.environment ?
    { [options.environment]: environments[options.environment] } :
    environments;

  console.log(`Generating environment files...${options.dryRun ? ' (DRY RUN)' : ''}`);

  // Process each environment
  for (const [envName, config] of Object.entries(envsToProcess)) {
    console.log(`\nProcessing ${envName} environment...`);

    // Generate content
    const content = replaceTemplate(template, config, options.includeBuildTime);

    // Validate content
    const errors = validateTypeScript(content);
    if (errors.length > 0) {
      console.error(`Validation errors for ${envName}:`);
      errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    // Write file (unless dry run)
    const outputPath = path.join(process.cwd(), config.outputFile);
    if (!options.dryRun) {
      fs.writeFileSync(outputPath, content, 'utf8');
      console.log(`✓ Generated: ${config.outputFile}`);
    } else {
      console.log(`Would generate: ${config.outputFile}`);
      console.log('--- Content ---');
      console.log(content);
      console.log('--- End Content ---');
    }
  }

  console.log('\n✅ Environment file generation complete!');
}

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Environment Template Generator

Usage:
  node scripts/generate-env.js [options]

Options:
  --env=<name>     Generate only specific environment (development|production)
  --build-time     Include build timestamp in ###buildTime### placeholder
  --dry-run        Show what would be generated without writing files
  --help, -h       Show this help message

Examples:
  node scripts/generate-env.js                 # Generate all environments
  node scripts/generate-env.js --env=dev       # Generate only development
  node scripts/generate-env.js --build-time    # Include build timestamp
  node scripts/generate-env.js --dry-run       # Preview generation
  `);
  process.exit(0);
}

// Run the generator
generateEnvironmentFiles();