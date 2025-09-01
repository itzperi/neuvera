'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { CalendarIcon, Download, Filter, LogOut, RefreshCw, Search } from 'lucide-react';
import { trackingDataService, TrackingEvent, UserSession, PageView, TrackingStats } from '@/services/tracking-data-service';
import { authService } from '@/services/auth-service';
import HeatmapVisualization from '@/components/heatmap-visualization';

export default function TrackingDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({ 
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date() 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<TrackingEvent[]>([]);
  const [realTimeEvents, setRealTimeEvents] = useState<TrackingEvent[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch tracking stats
        const statsData = await trackingDataService.getStats({
          startDate: dateRange.from,
          endDate: dateRange.to
        });
        setStats(statsData);
        
        // Fetch recent events
        const eventsData = await trackingDataService.getEvents({
          limit: 50,
          startDate: dateRange.from,
          endDate: dateRange.to
        });
        setRecentEvents(eventsData);
        
        // Fetch user sessions
        const sessionsData = await trackingDataService.getSessions({
          limit: 20,
          startDate: dateRange.from,
          endDate: dateRange.to
        });
        setUserSessions(sessionsData);
        
        // Fetch page views
        const pageViewsData = await trackingDataService.getPageViews({
          limit: 50,
          startDate: dateRange.from,
          endDate: dateRange.to
        });
        setPageViews(pageViewsData);
        
        // Fetch real-time events
        const realTimeData = await trackingDataService.getRealTimeEvents(10);
        setRealTimeEvents(realTimeData);
      } catch (error) {
        console.error('Error fetching tracking data:', error);
        // Handle error state
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time updates
    const realTimeInterval = setInterval(async () => {
      try {
        const realTimeData = await trackingDataService.getRealTimeEvents(10);
        setRealTimeEvents(realTimeData);
      } catch (error) {
        console.error('Error fetching real-time events:', error);
      }
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(realTimeInterval);
  }, [dateRange]);
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Fetch tracking stats
      const statsData = await trackingDataService.getStats({
        startDate: dateRange.from,
        endDate: dateRange.to
      });
      setStats(statsData);
      
      // Fetch recent events
      const eventsData = await trackingDataService.getEvents({
        limit: 50,
        startDate: dateRange.from,
        endDate: dateRange.to
      });
      setRecentEvents(eventsData);
      
      // Fetch real-time events
      const realTimeData = await trackingDataService.getRealTimeEvents(10);
      setRealTimeEvents(realTimeData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle export
  const handleExport = async (type: 'events' | 'sessions' | 'pageViews', format: 'csv' | 'json') => {
    try {
      const exportUrl = await trackingDataService.exportData({
        type,
        format,
        startDate: dateRange.from,
        endDate: dateRange.to
      });
      
      // In a real application, this would trigger a download
      window.open(exportUrl, '_blank');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tracking Dashboard</h1>
          <p className="text-muted-foreground">Monitor user activity and tracking events</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => {
            authService.logout();
            router.push('/admin/login');
          }}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
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
                selected={{
                  from: dateRange?.from,
                  to: dateRange?.to,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={() => handleExport('events', 'csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all tracking pixels</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPageViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total page views tracked</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Distinct user identifiers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(stats.averageSessionDuration / 60)}m {stats.averageSessionDuration % 60}s
              </div>
              <p className="text-xs text-muted-foreground mt-1">Time spent per session</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-[720px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="heatmaps">Heatmaps</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Overview tab content */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Events Over Time</CardTitle>
                  <CardDescription>Tracking events by day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <LineChart
                      data={[
                        { name: 'Page Views', data: stats.eventsByType.find(e => e.type === 'page_view')?.count || 0 },
                        { name: 'Clicks', data: stats.eventsByType.find(e => e.type === 'click')?.count || 0 },
                        { name: 'Form Submits', data: stats.eventsByType.find(e => e.type === 'form_submit')?.count || 0 },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Most viewed pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <BarChart
                      data={stats.topPages.map(page => ({
                        name: page.url,
                        value: page.views
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Device Distribution</CardTitle>
                  <CardDescription>Users by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <PieChart
                      data={stats.deviceDistribution.map(device => ({
                        name: device.device,
                        value: device.count
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Referrers</CardTitle>
                  <CardDescription>Traffic sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <BarChart
                      data={stats.topReferrers.map(referrer => ({
                        name: referrer.referrer,
                        value: referrer.count
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="events" className="space-y-6">
          {/* Events tab content */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Events</CardTitle>
              <CardDescription>All captured tracking events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="page_view">Page Views</SelectItem>
                    <SelectItem value="click">Clicks</SelectItem>
                    <SelectItem value="scroll">Scrolls</SelectItem>
                    <SelectItem value="form_submit">Form Submissions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge variant={event.type === 'page_view' ? 'outline' : 'default'}>
                          {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{event.url}</TableCell>
                      <TableCell>{event.userId}</TableCell>
                      <TableCell>{event.sessionId}</TableCell>
                      <TableCell>{format(new Date(event.timestamp), 'MMM dd, HH:mm:ss')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          {/* Sessions tab content */}
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
        
        <TabsContent value="pages" className="space-y-6">
          {/* Pages tab content */}
          <Card>
            <CardHeader>
              <CardTitle>Page Views</CardTitle>
              <CardDescription>Tracked page views across your site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by URL or title..."
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
                    <SelectItem value="all">All Pages</SelectItem>
                    <SelectItem value="landing">Landing Pages</SelectItem>
                    <SelectItem value="exit">Exit Pages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Avg. Time on Page</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Last Viewed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageViews.map((pageView) => (
                    <TableRow key={pageView.id}>
                      <TableCell className="max-w-xs truncate">{pageView.url}</TableCell>
                      <TableCell>{pageView.title}</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>{pageView.timeOnPage ? `${pageView.timeOnPage}s` : '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{pageView.referrer}</TableCell>
                      <TableCell>{format(new Date(pageView.timestamp), 'MMM dd, HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="realtime" className="space-y-6">
          {/* Real-time tab content */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Events</CardTitle>
              <CardDescription>Live tracking events as they happen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Showing events from the last minute</p>
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 flex items-center justify-between">
                    <h4 className="font-medium">Live Event Stream</h4>
                    <Badge variant="outline">{realTimeEvents.length} events</Badge>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    {realTimeEvents.length > 0 ? (
                      <div className="divide-y">
                        {realTimeEvents.map((event) => (
                          <div key={event.id} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={event.type === 'page_view' ? 'outline' : 'default'}>
                                {event.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(event.timestamp), 'HH:mm:ss')}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                              <div>
                                <span className="text-muted-foreground">URL:</span> {event.url}
                              </div>
                              <div>
                                <span className="text-muted-foreground">User ID:</span> {event.userId}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Session:</span> {event.sessionId}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Action:</span> {event.action}
                              </div>
                            </div>
                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                <details>
                                  <summary className="cursor-pointer">Metadata</summary>
                                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                    {JSON.stringify(event.metadata, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        No real-time events available. Events will appear here as they occur.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}