// Simple test runner script
const { execSync } = require('child_process');

console.log('Running tracking integration tests...');

try {
  // Run the tests using Jest
  execSync('npx jest src/tests/tracking-integration.test.ts --verbose', { stdio: 'inherit' });
  console.log('\nTests completed successfully!');
} catch (error) {
  console.error('\nTests failed:', error.message);
  process.exit(1);
}