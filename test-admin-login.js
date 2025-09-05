// Simple test script to verify admin login functionality
const { authService } = require('./src/services/auth-service.ts');

async function testAdminLogin() {
  console.log('Testing admin login with new credentials...');
  
  try {
    const result = await authService.login({
      email: 'neuvera',
      password: 'neuvera@007'
    });
    
    if (result.isAuthenticated) {
      console.log('✅ Admin login successful!');
      console.log('User:', result.user);
    } else {
      console.log('❌ Admin login failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error during admin login:', error.message);
  }
}

// Run the test
testAdminLogin();
