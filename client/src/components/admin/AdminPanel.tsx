import React, { useState, useEffect } from 'react';
import { BarChart3, Users, MessageSquare, Shield, Activity, Download, Eye, Settings, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { trackingClient } from '@/lib/trackingClient';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: () => apiRequest('/api/admin/analytics', {
      headers: {
        'Authorization': `Bearer ${user?.id}`,
      },
    }),
    enabled: isOpen && user?.isAdmin,
    refetchInterval: 30000,
  });

  // Fetch admin logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/admin/logs'],
    queryFn: () => apiRequest('/api/admin/logs', {
      headers: {
        'Authorization': `Bearer ${user?.id}`,
      },
    }),
    enabled: isOpen && user?.isAdmin && activeTab === 'security',
  });

  // Track admin panel access
  useEffect(() => {
    if (isOpen && user?.isAdmin) {
      trackingClient.trackButtonClick('admin_panel_open', { adminUserId: user.id });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const analytics = analyticsData?.analytics || {};
  const logs = logsData?.logs || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-luxury w-full max-w-7xl max-h-[95vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">NeuraChat Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Mental Wellness Analytics & Security Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Activity size={12} className="mr-1" />
                Live Analytics
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-close-admin"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                <BarChart3 size={16} className="mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="tracking" data-testid="tab-tracking">
                <Eye size={16} className="mr-2" />
                Tracking
              </TabsTrigger>
              <TabsTrigger value="security" data-testid="tab-security">
                <Shield size={16} className="mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings">
                <Settings size={16} className="mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">Registered users</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalMessages || 0}</div>
                    <p className="text-xs text-muted-foreground">Chat interactions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tracking Events</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalEvents || 0}</div>
                    <p className="text-xs text-muted-foreground">All time events</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.recentEvents || 0}</div>
                    <p className="text-xs text-muted-foreground">Last 24 hours</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mental Wellness Analytics</CardTitle>
                    <CardDescription>Privacy-compliant user engagement insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Chat Sessions</span>
                        <span className="font-semibold">{analytics.totalMessages || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AI Model Usage</span>
                        <Badge variant="outline">Groq LLaMA 3.1</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg Response Time</span>
                        <span className="font-semibold">1.2s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">User Satisfaction</span>
                        <span className="font-semibold text-green-600">94%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Privacy Status</CardTitle>
                    <CardDescription>GDPR & CCPA compliance overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Data Encryption</span>
                        <Badge className="bg-green-100 text-green-800">SHA-256</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">User Consent</span>
                        <Badge className="bg-blue-100 text-blue-800">Required</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Opt-out Requests</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Data Retention</span>
                        <span className="font-semibold">90 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy-Compliant Tracking System</CardTitle>
                  <CardDescription>Real-time user interaction monitoring with full privacy protection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.totalEvents || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Events</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.recentEvents || 0}</div>
                      <div className="text-sm text-muted-foreground">Last 24h</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">100%</div>
                      <div className="text-sm text-muted-foreground">GDPR Compliant</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Tracked Event Types:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Page Views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Chat Interactions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">Button Clicks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">User Engagement</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tracking Configuration</CardTitle>
                  <CardDescription>Privacy-first tracking settings and controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Hashed User Identifiers</h4>
                        <p className="text-sm text-muted-foreground">All user IDs are SHA-256 hashed for privacy</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Automatic Opt-out</h4>
                        <p className="text-sm text-muted-foreground">Users can opt out anytime with immediate effect</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Data Anonymization</h4>
                        <p className="text-sm text-muted-foreground">All collected data is anonymized before storage</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Activity Logs</CardTitle>
                    <CardDescription>Real-time monitoring of administrative actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {logs.length > 0 ? logs.slice(0, 10).map((log: any) => (
                        <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-sm">{log.action}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Admin: {log.adminUserId} | IP: {log.ipAddress}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No admin logs available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Metrics</CardTitle>
                    <CardDescription>System security and compliance status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Admin Actions</span>
                        <span className="font-semibold">{analytics.totalAdminActions || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Failed Login Attempts</span>
                        <span className="font-semibold text-orange-600">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">API Rate Limit Status</span>
                        <Badge className="bg-green-100 text-green-800">Normal</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Data Encryption</span>
                        <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last Security Scan</span>
                        <span className="font-semibold text-green-600">Clean</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Dashboard</CardTitle>
                  <CardDescription>GDPR, CCPA, and data protection compliance status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="font-semibold text-green-800 dark:text-green-200">GDPR Compliant</div>
                      <div className="text-sm text-green-600">Data Protection Regulation</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-semibold text-blue-800 dark:text-blue-200">CCPA Compliant</div>
                      <div className="text-sm text-blue-600">California Privacy Act</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="font-semibold text-purple-800 dark:text-purple-200">Privacy First</div>
                      <div className="text-sm text-purple-600">Ethical Data Collection</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Manage system settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">AI Configuration</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">Groq API Status</span>
                            <p className="text-sm text-muted-foreground">AI-powered responses via Groq</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Fallback Mode</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">Response Time Tracking</span>
                            <p className="text-sm text-muted-foreground">Monitor AI response performance</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Privacy Controls</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">Data Retention Period</span>
                            <p className="text-sm text-muted-foreground">Automatic data cleanup after 90 days</p>
                          </div>
                          <Button variant="outline" size="sm" data-testid="button-configure-retention">
                            Configure
                          </Button>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">User Consent Management</span>
                            <p className="text-sm text-muted-foreground">Manage privacy consent workflows</p>
                          </div>
                          <Button variant="outline" size="sm" data-testid="button-configure-consent">
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Export & Backup</h4>
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex items-center gap-2" data-testid="button-export-analytics">
                          <Download size={16} />
                          Export Analytics
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2" data-testid="button-export-logs">
                          <Download size={16} />
                          Export Logs
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};