#!/usr/bin/env node

import { chmod } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function makeExecutable() {
  try {
    const filePath = join(__dirname, '..', 'dist', 'index.js');
    
    // Only run chmod on Unix-like systems (macOS, Linux)
    if (process.platform !== 'win32') {
      await chmod(filePath, 0o755);
      console.log('Made dist/index.js executable');
    } else {
      console.log('Skipping chmod on Windows - not needed');
    }
  } catch (error) {
    // Don't fail the build if chmod fails
    console.warn('Warning: Could not make file executable:', error.message);
  }
}

makeExecutable();