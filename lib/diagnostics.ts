// Phase II Epic 1: Route Diagnostics (Dev Only)
// Run this in browser console or add to dev startup to verify routes

export function testCourseRoutes() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Route diagnostics are only available in development mode');
    return;
  }

  console.log('🔍 Testing Phase II Epic 1 Routes...\n');

  // Test imports
  try {
    const { getCourses, getCourseById } = require('@/lib/store');
    const courses = getCourses();
    console.log('✓ Store imports working');
    console.log(`✓ Found ${courses.length} courses in store`);
    
    if (courses.length > 0) {
      const firstCourse = courses[0];
      console.log(`✓ Sample course: "${firstCourse.title}" (${firstCourse.id})`);
      
      const retrieved = getCourseById(firstCourse.id);
      if (retrieved) {
        console.log('✓ getCourseById() working');
      } else {
        console.error('✗ getCourseById() failed');
      }
    }
  } catch (error) {
    console.error('✗ Store import error:', error);
  }

  // Test route definitions
  const routes = [
    { path: '/admin/courses', role: 'Admin/Manager', feature: 'Course list' },
    { path: '/admin/courses/crs_001/edit', role: 'Admin', feature: 'Course editor' },
    { path: '/learner/courses', role: 'Learner', feature: 'Course grid' },
  ];

  console.log('\n📋 Route Definitions:');
  routes.forEach(route => {
    console.log(`  ${route.path}`);
    console.log(`    Role: ${route.role}`);
    console.log(`    Feature: ${route.feature}`);
  });

  // Test permissions
  try {
    const { canAccessRoute } = require('@/lib/permissions');
    console.log('\n🔐 Permission Tests:');
    
    const tests = [
      { role: 'ADMIN', path: '/admin/courses', expected: true },
      { role: 'MANAGER', path: '/admin/courses', expected: true },
      { role: 'LEARNER', path: '/admin/courses', expected: false },
      { role: 'LEARNER', path: '/learner/courses', expected: true },
    ];

    tests.forEach(test => {
      const result = canAccessRoute(test.role as any, test.path);
      const status = result === test.expected ? '✓' : '✗';
      console.log(`  ${status} ${test.role} -> ${test.path}: ${result ? 'allowed' : 'blocked'}`);
    });
  } catch (error) {
    console.error('✗ Permission test error:', error);
  }

  console.log('\n✅ Diagnostic complete. If all tests pass, routes are configured correctly.');
  console.log('💡 If you see 404s, restart dev server: rm -rf .next && npm run dev');
}

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Wait for imports to be ready
  setTimeout(() => {
    try {
      testCourseRoutes();
    } catch (error) {
      console.log('⏳ Course routes not yet initialized (normal on first load)');
    }
  }, 1000);
}

