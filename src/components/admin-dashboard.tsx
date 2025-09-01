'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, PieChart } from '@/components/ui/charts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download, Filter, RefreshCw, Search } from 'lucide-react';

// Types for tracking data
interface ChatInteraction {
  id: string;
  userId: string;
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  responseTime?: number;
  tokenCount?: number;
}

interface UserInteraction {
  id: string;
  userId: string;
  sessionId: string;
  eventType: string;
  eventCategory: string;
  eventAction: string;
  timestamp: string;
  metadata: Record<string, any>;
}

interface UserSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  interactions: number;
  platform: string;
  device: string;
  browser: string;
}

interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  totalMessages: number;
  averageResponseTime: number;
  messagesByDay: { date: string; count: number }[];
  usersByDay: { date: string; count: number }[];
  topQueries: { query: string; count: number }[];
  errorRate: number;
  deviceDistribution: { device: string; count: number }[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({ 
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date() 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSessions: 0,
    totalMessages: 0,
    averageResponseTime: 0,
    messagesByDay: [],
    usersByDay: [],
    topQueries: [],
    errorRate: 0,
    deviceDistribution: []
  });
  const [recentChats, setRecentChats] = useState<ChatInteraction[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real application, these would be API calls to your backend
        // For now, we'll simulate the data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const mockStats: DashboardStats = {
          totalUsers: 1245,
          activeSessions: 78,
          totalMessages: 8976,
          averageResponseTime: 420, // ms
          messagesByDay: [
            { date: '2023-06-01', count: 120 },
            { date: '2023-06-02', count: 145 },
            { date: '2023-06-03', count: 132 },
            { date: '2023-06-04', count: 167 },
            { date: '2023-06-05', count: 189 },
            { date: '2023-06-06', count: 201 },
            { date: '2023-06-07', count: 176 }
          ],
          usersByDay: [
            { date: '2023-06-01', count: 45 },
            { date: '2023-06-02', count: 52 },
            { date: '2023-06-03', count: 49 },
            { date: '2023-06-04', count: 63 },
            { date: '2023-06-05', count: 71 },
            { date: '2023-06-06', count: 84 },
            { date: '2023-06-07', count: 67 }
          ],
          topQueries: [
            { query: 'How to integrate API', count: 87 },
            { query: 'Pricing information', count: 64 },
            { query: 'Account setup help', count: 52 },
            { query: 'Feature comparison', count: 43 },
            { query: 'Troubleshooting errors', count: 38 }
          ],
          errorRate: 2.4,
          deviceDistribution: [
            { device: 'Desktop', count: 720 },
            { device: 'Mobile', count: 412 },
            { device: 'Tablet', count: 113 }
          ]
        };
        
        const mockChats: ChatInteraction[] = Array(10).fill(null).map((_, i) => ({
          id: `chat-${i}`,
          userId: `user-${Math.floor(Math.random() * 100)}`,
          messageId: `msg-${i}`,
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: i % 2 === 0 
            ? ['How do I use this feature?', 'Can you explain pricing?', 'I need help with setup'][Math.floor(Math.random() * 3)]
            : ['Here\'s how to use that feature...', 'Our pricing structure is...', 'For setup, you need to...'][Math.floor(Math.random() * 3)],
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
          responseTime: i % 2 === 0 ? undefined : Math.floor(Math.random() * 1000),
          tokenCount: i % 2 === 0 ? undefined : Math.floor(Math.random() * 500)
        }));
        
        const mockSessions: UserSession[] = Array(8).fill(null).map((_, i) => ({
          id: `session-${i}`,
          userId: `user-${Math.floor(Math.random() * 100)}`,
          startTime: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
          endTime: i < 6 ? new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString() : undefined,
          duration: i < 6 ? Math.floor(Math.random() * 1800) : undefined,
          pageViews: Math.floor(Math.random() * 20) + 1,
          interactions: Math.floor(Math.random() * 50) + 1,
          platform: ['Windows', 'macOS', 'iOS', 'Android'][Math.floor(Math.random() * 4)],
          device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
          browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)]
        }));
        
        setStats(mockStats);
        setRecentChats(mockChats);
        setUserSessions(mockSessions);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Handle error state
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dateRange]);
  
  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    // Re-fetch data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  // Filter sessions based on search query and category
  const filteredSessions = userSessions.filter(session => {
    const matchesSearch = searchQuery === '' || 
      session.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.browser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.platform.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = filterCategory === 'all' || 
      (filterCategory === 'active' && !session.endTime) ||
      (filterCategory === 'completed' && session.endTime);
      
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange as any}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Live right now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+8% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageResponseTime} ms</div>
            <p className="text-xs text-muted-foreground mt-1">-15ms from last week</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chats">Chat History</TabsTrigger>
          <TabsTrigger value="sessions">User Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages Over Time</CardTitle>
                <CardDescription>Daily message volume for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={stats.messagesByDay.map(item => ({ 
                    name: format(new Date(item.date), 'MMM dd'), 
                    value: item.count 
                  }))} 
                  xAxisKey="name"
                  yAxisKey="value"
                  height={300}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>New Users</CardTitle>
                <CardDescription>Daily new user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={stats.usersByDay.map(item => ({ 
                    name: format(new Date(item.date), 'MMM dd'), 
                    value: item.count 
                  }))} 
                  xAxisKey="name"
                  yAxisKey="value"
                  height={300}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top User Queries</CardTitle>
                <CardDescription>Most common user questions</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={stats.topQueries.map(item => ({ 
                    name: item.query.length > 20 ? item.query.substring(0, 20) + '...' : item.query, 
                    value: item.count 
                  }))} 
                  xAxisKey="name"
                  yAxisKey="value"
                  height={300}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>User device breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={stats.deviceDistribution.map(item => ({ 
                    name: item.device, 
                    value: item.count 
                  }))} 
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Chat Activity</CardTitle>
              <CardDescription>Latest user-chatbot interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentChats.map((chat) => (
                    <TableRow key={chat.id}>
                      <TableCell>{chat.userId}</TableCell>
                      <TableCell>
                        <Badge variant={chat.role === 'user' ? 'outline' : 'default'}>
                          {chat.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{chat.content}</TableCell>
                      <TableCell>{format(new Date(chat.timestamp), 'MMM dd, HH:mm')}</TableCell>
                      <TableCell>{chat.responseTime ? `${chat.responseTime} ms` : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chats" className="space-y-6">
          {/* Chat history tab content */}
          <Card>
            <CardHeader>
              <CardTitle>Chat History</CardTitle>
              <CardDescription>Complete history of user-chatbot interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="user">User Messages</SelectItem>
                    <SelectItem value="assistant">Assistant Messages</SelectItem>
                    <SelectItem value="error">Error States</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentChats.map((chat) => (
                    <TableRow key={chat.id}>
                      <TableCell>{chat.userId}</TableCell>
                      <TableCell>
                        <Badge variant={chat.role === 'user' ? 'outline' : 'default'}>
                          {chat.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{chat.content}</TableCell>
                      <TableCell>{format(new Date(chat.timestamp), 'MMM dd, HH:mm')}</TableCell>
                      <TableCell>{chat.responseTime ? `${chat.responseTime} ms` : '-'}</TableCell>
                      <TableCell>{chat.tokenCount || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          {/* User sessions tab content */}
          <Card>
            <CardHeader>
              <CardTitle>User Sessions</CardTitle>
              <CardDescription>Active and recent user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user ID, browser, platform..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="active">Active Sessions</SelectItem>
                    <SelectItem value="completed">Completed Sessions</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Page Views</TableHead>
                    <TableHead>Interactions</TableHead>
                    <TableHead>Platform / Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.userId}</TableCell>
                      <TableCell>
                        <Badge variant={session.endTime ? 'outline' : 'default'}>
                          {session.endTime ? 'Completed' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(session.startTime), 'MMM dd, HH:mm')}</TableCell>
                      <TableCell>
                        {session.duration 
                          ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` 
                          : 'In progress'}
                      </TableCell>
                      <TableCell>{session.pageViews}</TableCell>
                      <TableCell>{session.interactions}</TableCell>
                      <TableCell>
                        {session.platform} / {session.device} / {session.browser}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics tab content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>API response times and error rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Average Response Time</h4>
                    <div className="flex items-center">
                      <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full" 
                          style={{ width: `${Math.min(stats.averageResponseTime / 10, 100)}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm">{stats.averageResponseTime} ms</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Error Rate</h4>
                    <div className="flex items-center">
                      <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${stats.errorRate > 5 ? 'bg-destructive' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(stats.errorRate * 5, 100)}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm">{stats.errorRate}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">API Calls</h4>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">12,543</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Success</p>
                        <p className="text-lg font-bold">12,241</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Failed</p>
                        <p className="text-lg font-bold">302</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Session metrics and interaction data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Avg. Session Duration</h4>
                    <div className="flex items-center">
                      <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full" 
                          style={{ width: '65%' }}
                        />
                      </div>
                      <span className="ml-2 text-sm">4m 32s</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Messages per Session</h4>
                    <div className="flex items-center">
                      <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full" 
                          style={{ width: '42%' }}
                        />
                      </div>
                      <span className="ml-2 text-sm">8.4</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">User Retention</h4>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">1-Day</p>
                        <p className="text-lg font-bold">68%</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">7-Day</p>
                        <p className="text-lg font-bold">42%</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">30-Day</p>
                        <p className="text-lg font-bold">28%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}