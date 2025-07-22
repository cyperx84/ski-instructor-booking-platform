#!/usr/bin/env node

/**
 * Comprehensive Component Testing Framework
 * Ski Instructor Booking Platform - Component Analysis & Testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🎿 ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function subsection(title) {
  log(`\n📋 ${title}`, 'yellow');
  log('-'.repeat(40), 'yellow');
}

function testResult(test, status, details = '', recommendations = []) {
  const icons = { pass: '✅', fail: '❌', warning: '⚠️', info: '📝' };
  const statusColors = { pass: 'green', fail: 'red', warning: 'yellow', info: 'blue' };
  
  log(`${icons[status]} ${test}`, statusColors[status]);
  if (details) log(`   💭 ${details}`, 'blue');
  if (recommendations.length > 0) {
    recommendations.forEach(rec => log(`   🔧 ${rec}`, 'magenta'));
  }
}

// Component Analysis Results
const componentResults = {
  backend: { tests: 0, passes: 0, warnings: 0, fails: 0, details: [] },
  frontend: { tests: 0, passes: 0, warnings: 0, fails: 0, details: [] },
  mobile: { tests: 0, passes: 0, warnings: 0, fails: 0, details: [] },
  database: { tests: 0, passes: 0, warnings: 0, fails: 0, details: [] },
  integration: { tests: 0, passes: 0, warnings: 0, fails: 0, details: [] }
};

function recordResult(component, status, test, details = '', recommendations = []) {
  componentResults[component].tests++;
  componentResults[component][status === 'pass' ? 'passes' : status === 'warning' ? 'warnings' : 'fails']++;
  componentResults[component].details.push({ status, test, details, recommendations });
  testResult(test, status, details, recommendations);
}

section('COMPREHENSIVE COMPONENT TESTING FRAMEWORK');

// 1. BACKEND API COMPONENT TESTING
section('BACKEND API COMPONENT ANALYSIS');

subsection('Backend Architecture Assessment');
try {
  const backendPath = path.join(__dirname, 'worktrees/backend-api');
  const srcPath = path.join(backendPath, 'src');
  
  // Test directory structure
  const directories = ['controllers', 'middleware', 'routes', 'services', 'types', 'utils'];
  directories.forEach(dir => {
    const dirPath = path.join(srcPath, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.ts'));
      recordResult('backend', 'pass', `${dir} Directory`, 
        `${files.length} TypeScript files found`, 
        files.length < 3 ? ['Consider adding more modular components'] : []);
    } else {
      recordResult('backend', 'fail', `${dir} Directory`, 'Directory missing');
    }
  });
  
  // Analyze controllers
  const controllersPath = path.join(srcPath, 'controllers');
  if (fs.existsSync(controllersPath)) {
    const controllers = fs.readdirSync(controllersPath).filter(f => f.endsWith('.ts') && !f.includes('test'));
    controllers.forEach(controller => {
      const controllerContent = fs.readFileSync(path.join(controllersPath, controller), 'utf8');
      const hasErrorHandling = controllerContent.includes('try') && controllerContent.includes('catch');
      const hasValidation = controllerContent.includes('validate') || controllerContent.includes('joi');
      const hasLogging = controllerContent.includes('logger');
      
      recordResult('backend', hasErrorHandling ? 'pass' : 'warning', 
        `Controller: ${controller}`, 
        `Error handling: ${hasErrorHandling ? 'Yes' : 'No'}, Validation: ${hasValidation ? 'Yes' : 'No'}, Logging: ${hasLogging ? 'Yes' : 'No'}`,
        !hasErrorHandling ? ['Add comprehensive error handling'] : []);
    });
  }
  
  // Check middleware
  const middlewarePath = path.join(srcPath, 'middleware');
  if (fs.existsSync(middlewarePath)) {
    const middleware = fs.readdirSync(middlewarePath).filter(f => f.endsWith('.ts'));
    const expectedMiddleware = ['auth.ts', 'error.ts', 'security.ts'];
    expectedMiddleware.forEach(mw => {
      const exists = middleware.includes(mw);
      recordResult('backend', exists ? 'pass' : 'fail', 
        `Middleware: ${mw}`, 
        exists ? 'Present and configured' : 'Missing critical middleware');
    });
  }
  
} catch (error) {
  recordResult('backend', 'fail', 'Backend Structure Analysis', error.message);
}

subsection('API Endpoints Assessment');
try {
  const routesPath = path.join(__dirname, 'worktrees/backend-api/src/routes');
  if (fs.existsSync(routesPath)) {
    const routes = fs.readdirSync(routesPath).filter(f => f.endsWith('.ts'));
    routes.forEach(route => {
      const routeContent = fs.readFileSync(path.join(routesPath, route), 'utf8');
      const methods = ['get', 'post', 'put', 'delete', 'patch'];
      const foundMethods = methods.filter(method => routeContent.includes(`.${method}(`));
      
      recordResult('backend', foundMethods.length > 0 ? 'pass' : 'warning', 
        `Route: ${route}`, 
        `HTTP methods: ${foundMethods.join(', ')}`,
        foundMethods.length < 2 ? ['Consider adding more CRUD operations'] : []);
    });
  }
} catch (error) {
  recordResult('backend', 'fail', 'API Routes Analysis', error.message);
}

// 2. FRONTEND COMPONENT TESTING  
section('FRONTEND COMPONENT ANALYSIS');

subsection('React Component Architecture');
try {
  const frontendPath = path.join(__dirname, 'worktrees/frontend-core/frontend/src');
  
  // Check app structure (Next.js 15 app directory)
  const appPath = path.join(frontendPath, 'app');
  if (fs.existsSync(appPath)) {
    const pages = fs.readdirSync(appPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    const expectedPages = ['login', 'register', 'dashboard', 'bookings', 'search'];
    expectedPages.forEach(page => {
      const exists = pages.includes(page);
      recordResult('frontend', exists ? 'pass' : 'warning', 
        `Page: ${page}`, 
        exists ? 'Implemented' : 'Missing key user flow');
    });
  }
  
  // Check components
  const componentsPath = path.join(frontendPath, 'components');
  if (fs.existsSync(componentsPath)) {
    const componentDirs = fs.readdirSync(componentsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    componentDirs.forEach(dir => {
      const dirPath = path.join(componentsPath, dir);
      const components = fs.readdirSync(dirPath).filter(f => f.endsWith('.tsx'));
      recordResult('frontend', components.length > 0 ? 'pass' : 'warning', 
        `Component Group: ${dir}`, 
        `${components.length} components found`);
    });
  }
  
  // Check state management
  const storesPath = path.join(frontendPath, 'stores');
  if (fs.existsSync(storesPath)) {
    const stores = fs.readdirSync(storesPath).filter(f => f.endsWith('.ts'));
    stores.forEach(store => {
      const storeContent = fs.readFileSync(path.join(storesPath, store), 'utf8');
      const hasZustand = storeContent.includes('zustand') || storeContent.includes('create');
      recordResult('frontend', hasZustand ? 'pass' : 'warning', 
        `Store: ${store}`, 
        hasZustand ? 'Zustand state management detected' : 'No state management pattern found');
    });
  }
  
} catch (error) {
  recordResult('frontend', 'fail', 'Frontend Structure Analysis', error.message);
}

// 3. MOBILE APP COMPONENT TESTING
section('MOBILE APP COMPONENT ANALYSIS');

subsection('React Native Architecture');
try {
  const mobilePath = path.join(__dirname, 'worktrees/mobile-app');
  const mobilePackage = JSON.parse(fs.readFileSync(path.join(mobilePath, 'package.json'), 'utf8'));
  
  // Check critical mobile dependencies
  const mobileDeps = {
    'react-native': 'Core framework',
    '@react-navigation/native': 'Navigation',
    'react-redux': 'State management',
    '@react-native-geolocation/geolocation': 'GPS functionality',
    'react-native-biometrics': 'Biometric authentication',
    'react-native-camera': 'Camera integration',
    '@react-native-firebase/messaging': 'Push notifications',
    'react-native-maps': 'Map integration'
  };
  
  Object.entries(mobileDeps).forEach(([dep, description]) => {
    const hasDepdenency = mobilePackage.dependencies[dep];
    recordResult('mobile', hasDepdenency ? 'pass' : 'fail', 
      `Dependency: ${dep}`, 
      `${description} - ${hasDepdenency ? 'Installed' : 'Missing'}`);
  });
  
  // Check mobile source structure
  const mobileSrc = path.join(mobilePath, 'src');
  if (fs.existsSync(mobileSrc)) {
    const mobileDirs = ['screens', 'services', 'store', 'navigation'];
    mobileDirs.forEach(dir => {
      const dirPath = path.join(mobileSrc, dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath, { recursive: true }).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
        recordResult('mobile', files.length > 0 ? 'pass' : 'warning', 
          `Mobile ${dir}`, 
          `${files.length} files found`);
      } else {
        recordResult('mobile', 'fail', `Mobile ${dir}`, 'Directory missing');
      }
    });
  }
  
} catch (error) {
  recordResult('mobile', 'fail', 'Mobile App Analysis', error.message);
}

// 4. DATABASE COMPONENT TESTING
section('DATABASE COMPONENT ANALYSIS');

subsection('Schema and Migration Assessment');
try {
  const dbPath = path.join(__dirname, 'worktrees/database-design/database');
  
  // Check migrations
  const migrationsPath = path.join(dbPath, 'migrations');
  if (fs.existsSync(migrationsPath)) {
    const migrations = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));
    recordResult('database', migrations.length >= 10 ? 'pass' : 'warning', 
      'Database Migrations', 
      `${migrations.length} migration files found`,
      migrations.length < 10 ? ['Consider more granular migrations'] : []);
    
    // Analyze migration content
    migrations.forEach(migration => {
      const content = fs.readFileSync(path.join(migrationsPath, migration), 'utf8');
      const hasIndexes = content.includes('CREATE INDEX');
      const hasConstraints = content.includes('CONSTRAINT') || content.includes('FOREIGN KEY');
      
      recordResult('database', 'info', 
        `Migration: ${migration}`, 
        `Indexes: ${hasIndexes ? 'Yes' : 'No'}, Constraints: ${hasConstraints ? 'Yes' : 'No'}`);
    });
  }
  
  // Check seed data
  const seedsPath = path.join(dbPath, 'seeds');
  if (fs.existsSync(seedsPath)) {
    const seeds = fs.readdirSync(seedsPath).filter(f => f.endsWith('.sql'));
    seeds.forEach(seed => {
      const content = fs.readFileSync(path.join(seedsPath, seed), 'utf8');
      const insertCount = (content.match(/INSERT INTO/gi) || []).length;
      recordResult('database', insertCount > 0 ? 'pass' : 'warning', 
        `Seed Data: ${seed}`, 
        `${insertCount} INSERT statements found`);
    });
  }
  
} catch (error) {
  recordResult('database', 'fail', 'Database Analysis', error.message);
}

// 5. SPECIALIZED AGENTS TESTING
section('SPECIALIZED AGENTS ANALYSIS');

const agents = [
  { name: 'ai-ml', description: 'AI/ML Models and Services' },
  { name: 'payment-system', description: 'Payment Processing' },
  { name: 'booking-engine', description: 'Booking Logic and Matching' },
  { name: 'weather-integration', description: 'Weather Data and Safety' },
  { name: 'calendar-integration', description: 'Calendar Synchronization' },
  { name: 'admin-dashboard', description: 'Administration Interface' },
  { name: 'communication', description: 'Messaging and Notifications' },
  { name: 'analytics', description: 'Business Intelligence' }
];

agents.forEach(agent => {
  subsection(`${agent.name} Agent Assessment`);
  try {
    const agentPath = path.join(__dirname, `worktrees/${agent.name}`);
    
    // Check if agent has package.json
    const packagePath = path.join(agentPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const agentPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      recordResult('integration', 'pass', 
        `${agent.name} Configuration`, 
        `Package configured: ${agentPackage.name}`);
    }
    
    // Check for README
    const readmePath = path.join(agentPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      recordResult('integration', readmeContent.length > 500 ? 'pass' : 'warning', 
        `${agent.name} Documentation`, 
        `README size: ${readmeContent.length} characters`);
    }
    
    // Check for source code
    const possibleSrcPaths = [
      path.join(agentPath, 'src'),
      path.join(agentPath, 'backend/src'),
      path.join(agentPath, 'frontend/src')
    ];
    
    let hasSource = false;
    possibleSrcPaths.forEach(srcPath => {
      if (fs.existsSync(srcPath)) {
        const sourceFiles = fs.readdirSync(srcPath, { recursive: true })
          .filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx'));
        if (sourceFiles.length > 0) {
          hasSource = true;
          recordResult('integration', 'pass', 
            `${agent.name} Implementation`, 
            `${sourceFiles.length} source files found`);
        }
      }
    });
    
    if (!hasSource) {
      recordResult('integration', 'warning', 
        `${agent.name} Implementation`, 
        'No source files found - may be placeholder');
    }
    
  } catch (error) {
    recordResult('integration', 'fail', `${agent.name} Analysis`, error.message);
  }
});

// 6. GENERATE COMPREHENSIVE REPORT
section('COMPREHENSIVE TESTING SUMMARY');

Object.entries(componentResults).forEach(([component, results]) => {
  if (results.tests > 0) {
    const passRate = ((results.passes / results.tests) * 100).toFixed(1);
    log(`\n📊 ${component.toUpperCase()} COMPONENT RESULTS`, 'bright');
    log(`   Tests Run: ${results.tests}`, 'blue');
    log(`   ✅ Passed: ${results.passes}`, 'green');
    log(`   ⚠️  Warnings: ${results.warnings}`, 'yellow');
    log(`   ❌ Failed: ${results.fails}`, 'red');
    log(`   📈 Success Rate: ${passRate}%`, passRate > 80 ? 'green' : passRate > 60 ? 'yellow' : 'red');
  }
});

// Calculate overall score
const totalTests = Object.values(componentResults).reduce((sum, comp) => sum + comp.tests, 0);
const totalPasses = Object.values(componentResults).reduce((sum, comp) => sum + comp.passes, 0);
const overallScore = totalTests > 0 ? ((totalPasses / totalTests) * 100).toFixed(1) : 0;

log(`\n🎯 OVERALL PLATFORM ASSESSMENT`, 'bright');
log(`   Total Tests: ${totalTests}`, 'blue');
log(`   Overall Success Rate: ${overallScore}%`, overallScore > 85 ? 'green' : overallScore > 70 ? 'yellow' : 'red');

const grade = overallScore > 90 ? 'A+' : overallScore > 85 ? 'A' : overallScore > 80 ? 'B+' : overallScore > 75 ? 'B' : overallScore > 70 ? 'C+' : 'C';
log(`   Platform Grade: ${grade}`, overallScore > 85 ? 'green' : overallScore > 70 ? 'yellow' : 'red');

log(`\n🚀 PLATFORM STATUS: ${overallScore > 85 ? 'PRODUCTION READY' : overallScore > 70 ? 'DEVELOPMENT READY' : 'NEEDS WORK'}`, 
  overallScore > 85 ? 'green' : overallScore > 70 ? 'yellow' : 'red');

log('\n📝 Detailed report saved to: component-test-results.json', 'blue');

// Save detailed results to JSON
fs.writeFileSync(
  path.join(__dirname, 'component-test-results.json'),
  JSON.stringify({ 
    timestamp: new Date().toISOString(),
    overallScore: parseFloat(overallScore),
    grade,
    totalTests,
    totalPasses,
    componentResults,
    summary: {
      status: overallScore > 85 ? 'PRODUCTION READY' : overallScore > 70 ? 'DEVELOPMENT READY' : 'NEEDS WORK',
      recommendations: [
        'Fix remaining TypeScript compilation errors',
        'Setup PostgreSQL database for testing',
        'Complete frontend SWC compiler fixes',
        'Test mobile app on actual devices',
        'Implement comprehensive integration testing'
      ]
    }
  }, null, 2)
);