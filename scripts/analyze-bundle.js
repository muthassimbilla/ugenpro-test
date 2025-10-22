#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 Analyzing bundle size...\n')

// Install bundle analyzer if not present
try {
  require.resolve('@next/bundle-analyzer')
} catch (e) {
  console.log('📦 Installing @next/bundle-analyzer...')
  execSync('npm install --save-dev @next/bundle-analyzer', { stdio: 'inherit' })
}

// Create bundle analysis script
const bundleAnalyzerScript = `
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // Your existing Next.js config
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
})
`

// Write bundle analyzer config
fs.writeFileSync('next.config.bundle.js', bundleAnalyzerScript)

// Create package.json script
const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

if (!packageJson.scripts['analyze']) {
  packageJson.scripts['analyze'] = 'ANALYZE=true next build'
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log('✅ Added analyze script to package.json')
}

// Run bundle analysis
console.log('🚀 Running bundle analysis...')
try {
  execSync('npm run analyze', { stdio: 'inherit' })
  console.log('\n✅ Bundle analysis complete!')
  console.log('📊 Check the generated HTML files for detailed analysis')
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message)
}

// Clean up
fs.unlinkSync('next.config.bundle.js')

// Generate bundle size report
const generateBundleReport = () => {
  const buildDir = path.join(process.cwd(), '.next')
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found. Run "npm run build" first.')
    return
  }

  const staticDir = path.join(buildDir, 'static')
  if (!fs.existsSync(staticDir)) {
    console.log('❌ Static directory not found.')
    return
  }

  const report = {
    timestamp: new Date().toISOString(),
    files: [],
    totalSize: 0,
    recommendations: []
  }

  // Analyze JavaScript files
  const jsDir = path.join(staticDir, 'js')
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir)
    jsFiles.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(jsDir, file)
        const stats = fs.statSync(filePath)
        const sizeKB = (stats.size / 1024).toFixed(2)
        
        report.files.push({
          name: file,
          type: 'JavaScript',
          size: stats.size,
          sizeKB: parseFloat(sizeKB),
          path: filePath
        })
        
        report.totalSize += stats.size
      }
    })
  }

  // Analyze CSS files
  const cssDir = path.join(staticDir, 'css')
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir)
    cssFiles.forEach(file => {
      if (file.endsWith('.css')) {
        const filePath = path.join(cssDir, file)
        const stats = fs.statSync(filePath)
        const sizeKB = (stats.size / 1024).toFixed(2)
        
        report.files.push({
          name: file,
          type: 'CSS',
          size: stats.size,
          sizeKB: parseFloat(sizeKB),
          path: filePath
        })
        
        report.totalSize += stats.size
      }
    })
  }

  // Sort files by size
  report.files.sort((a, b) => b.size - a.size)

  // Generate recommendations
  const largeFiles = report.files.filter(f => f.sizeKB > 100)
  if (largeFiles.length > 0) {
    report.recommendations.push({
      type: 'warning',
      message: `Found ${largeFiles.length} large files (>100KB). Consider code splitting.`,
      files: largeFiles.map(f => f.name)
    })
  }

  const totalSizeKB = (report.totalSize / 1024).toFixed(2)
  if (report.totalSize > 500 * 1024) { // 500KB
    report.recommendations.push({
      type: 'error',
      message: `Total bundle size is ${totalSizeKB}KB. Consider optimization.`,
      suggestion: 'Implement code splitting, lazy loading, and remove unused dependencies.'
    })
  }

  // Write report
  const reportPath = path.join(process.cwd(), 'bundle-analysis-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  // Display summary
  console.log('\n📊 Bundle Analysis Summary:')
  console.log('=' .repeat(50))
  console.log(`Total Size: ${totalSizeKB}KB`)
  console.log(`Files: ${report.files.length}`)
  console.log(`Large Files (>100KB): ${largeFiles.length}`)
  
  if (report.recommendations.length > 0) {
    console.log('\n⚠️  Recommendations:')
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.message}`)
      if (rec.files) {
        console.log(`   Files: ${rec.files.join(', ')}`)
      }
      if (rec.suggestion) {
        console.log(`   Suggestion: ${rec.suggestion}`)
      }
    })
  }

  console.log(`\n📄 Detailed report saved to: ${reportPath}`)
}

// Run bundle report
generateBundleReport()

console.log('\n🎯 Next Steps:')
console.log('1. Review the bundle analysis report')
console.log('2. Implement code splitting for large files')
console.log('3. Remove unused dependencies')
console.log('4. Optimize images and assets')
console.log('5. Consider lazy loading for non-critical components')
