const fs = require('fs');
const path = require('path');

// Track all TypeScript/JavaScript files and their imports
const allFiles = new Set();
const usedFiles = new Set();
const importMap = new Map();

// Starting points - files we know are used
const entryPoints = [
  './app/page.tsx',
  './app/layout.tsx',
  './app/api/chat/route.ts',
  './app/api/puzzle/route.ts',
  './app/api/counters/route.ts'
];

// Directories to scan
const dirsToScan = ['./app', './components', './lib', './hooks'];

// Get all TS/TSX files
function getAllFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      getAllFiles(fullPath);
    } else if (file.match(/\.(ts|tsx)$/) && !file.endsWith('.bak')) {
      allFiles.add(fullPath);
    }
  });
}

// Extract imports from a file
function getImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Match import statements
    const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  } catch (e) {
    return [];
  }
}

// Resolve import path to actual file
function resolveImport(importPath, fromFile) {
  // Handle relative imports
  if (importPath.startsWith('.')) {
    const dir = path.dirname(fromFile);
    let resolved = path.resolve(dir, importPath);
    
    // Try different extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }
  
  // Handle @ imports
  if (importPath.startsWith('@/')) {
    const resolved = importPath.replace('@/', './');
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }
  
  return null;
}

// Trace dependencies recursively
function traceDependencies(file, visited = new Set()) {
  if (visited.has(file)) return;
  visited.add(file);
  usedFiles.add(file);
  
  const imports = getImports(file);
  importMap.set(file, imports);
  
  imports.forEach(imp => {
    const resolved = resolveImport(imp, file);
    if (resolved && allFiles.has(resolved)) {
      traceDependencies(resolved, visited);
    }
  });
}

// Main execution
console.log('Scanning for all TypeScript files...');
dirsToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    getAllFiles(dir);
  }
});

console.log(`Found ${allFiles.size} total files\n`);

console.log('Tracing dependencies from entry points...');
entryPoints.forEach(entry => {
  if (fs.existsSync(entry)) {
    traceDependencies(entry);
  }
});

// Find unused files
const unusedFiles = Array.from(allFiles).filter(file => !usedFiles.has(file));

console.log(`\nUSED FILES (${usedFiles.size}):`);
console.log('================');
Array.from(usedFiles).sort().forEach(file => {
  console.log(file);
});

console.log(`\nUNUSED FILES (${unusedFiles.length}):`);
console.log('================');
unusedFiles.sort().forEach(file => {
  console.log(file);
});

// Create cleanup script
const cleanupScript = unusedFiles.map(file => `mv "${file}" "${file}.unused"`).join('\n');
fs.writeFileSync('./scripts/cleanup-unused.sh', `#!/bin/bash\n# Move unused files\n${cleanupScript}\n`);
console.log('\nCleanup script created: ./scripts/cleanup-unused.sh');