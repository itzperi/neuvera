import { NextRequest, NextResponse } from 'next/server';

// Mock user data - in a real implementation, this would be fetched from a database
const mockUsers = [
  {
    id: 'user_1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User'
  },
  {
    id: 'user_2',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    avatar: 'https://ui-avatars.com/api/?name=Regular+User'
  },
  {
    id: 'user_3',
    email: 'neuvera',  // Using username as email for the special case
    name: 'Neuvera Admin',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Neuvera+Admin'
  }
];

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Special case for the specific credentials
    if (email === 'neuvera' && password === '1234@') {
      const user = mockUsers.find(u => u.email === 'neuvera');
      
      return NextResponse.json(
        { 
          message: 'Login successful',
          user: {
            id: user?.id,
            email: user?.email,
            name: user?.name,
            role: user?.role,
            avatar: user?.avatar
          }
        },
        { status: 200 }
      );
    }
    
    // In a real implementation, this would query a database
    // and verify the password using a secure method like bcrypt
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // In a real implementation, we would verify the password here
    // For this mock, we'll assume the password is correct
    
    // Create a session or JWT token
    // In a real implementation, this would create a secure session or JWT
    
    // Return user data (excluding sensitive information)
    return NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}