/**
 * Bundle analysis script
 * Analyzes bundle size and provides recommendations
 * 
 * Usage: npm run analyze
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Analyzing bundle size...\n');

try {
  // Build the project
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Read build manifest
  const buildManifestPath = path.join(process.cwd(), '.next', 'build-manifest.json');
  
  if (fs.existsSync(buildManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
    
    console.log('\n📊 Bundle Analysis:\n');
    
    // Analyze pages
    const pages = manifest.pages || {};
    const pageSizes = [];
    
    Object.entries(pages).forEach(([page, files]) => {
      const totalSize = files.reduce((sum, file) => {
        const filePath = path.join(process.cwd(), '.next', file);
        if (fs.existsSync(filePath)) {
          return sum + fs.statSync(filePath).size;
        }
        return sum;
      }, 0);
      
      pageSizes.push({
        page,
        size: totalSize,
        files: files.length,
      });
    });
    
    // Sort by size
    pageSizes.sort((a, b) => b.size - a.size);
    
    // Display results
    pageSizes.forEach(({ page, size, files }) => {
      const sizeKB = (size / 1024).toFixed(2);
      const sizeMB = (size / 1024 / 1024).toFixed(2);
      const sizeStr = size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
      
      let status = '✅';
      if (size > 500 * 1024) {
        status = '⚠️';
      }
      if (size > 1024 * 1024) {
        status = '🔴';
      }
      
      console.log(`${status} ${page.padEnd(30)} ${sizeStr.padStart(10)} (${files} files)`);
    });
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    const largePages = pageSizes.filter(p => p.size > 500 * 1024);
    if (largePages.length > 0) {
      console.log('  - Consider code splitting for large pages:');
      largePages.forEach(({ page }) => {
        console.log(`    • ${page}`);
      });
    }
    
    const totalSize = pageSizes.reduce((sum, p) => sum + p.size, 0);
    const avgSize = totalSize / pageSizes.length;
    console.log(`\n  - Average page size: ${(avgSize / 1024).toFixed(2)} KB`);
    console.log(`  - Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
  } else {
    console.log('⚠️  Build manifest not found. Run "npm run build" first.');
  }
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message);
  process.exit(1);
}

