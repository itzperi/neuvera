"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard,
  Monitor,
  Gauge,
  ChartSpline,
  MonitorCheck,
  SquareActivity,
  MonitorDot,
  ChartPie,
  ChartNetwork,
  ServerOff,
  Radar,
  KeyRound
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminPanelProps {
  className?: string;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}

interface UserActivity {
  id: string;
  username: string;
  action: string;
  timestamp: string;
  ip: string;
  status: "success" | "warning" | "error";
}

interface ChatStat {
  metric: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
}

interface SystemMetric {
  name: string;
  value: number;
  status: "healthy" | "warning" | "critical";
  unit: string;
}

export default function AdminPanel({ className = "", isAuthenticated = false, onLogout, onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const [userActivities] = useState<UserActivity[]>([
    {
      id: "1",
      username: "user_001",
      action: "Chat Session Started",
      timestamp: "2024-01-15 14:30:22",
      ip: "192.168.1.1",
      status: "success"
    },
    {
      id: "2",
      username: "user_002",
      action: "Authentication Failed",
      timestamp: "2024-01-15 14:28:15",
      ip: "192.168.1.2",
      status: "error"
    },
    {
      id: "3",
      username: "user_003",
      action: "Message Sent",
      timestamp: "2024-01-15 14:25:10",
      ip: "192.168.1.3",
      status: "success"
    },
    {
      id: "4",
      username: "user_004",
      action: "Page View Tracked",
      timestamp: "2024-01-15 14:20:05",
      ip: "192.168.1.4",
      status: "success"
    },
    {
      id: "5",
      username: "user_005",
      action: "Tracking Pixel Fired",
      timestamp: "2024-01-15 14:15:33",
      ip: "192.168.1.5",
      status: "success"
    }
  ]);

  const [chatStats] = useState<ChatStat[]>([
    { metric: "Total Messages", value: 15420, change: 12.5, trend: "up" },
    { metric: "Active Users", value: 342, change: -2.1, trend: "down" },
    { metric: "Response Time", value: 1.2, change: 8.3, trend: "up" },
    { metric: "Success Rate", value: 98.7, change: 0.5, trend: "up" }
  ]);

  const [systemMetrics] = useState<SystemMetric[]>([
    { name: "CPU Usage", value: 45, status: "healthy", unit: "%" },
    { name: "Memory", value: 78, status: "warning", unit: "%" },
    { name: "Disk Space", value: 92, status: "critical", unit: "%" },
    { name: "Network", value: 23, status: "healthy", unit: "MB/s" }
  ]);

  const filteredActivities = userActivities.filter(activity =>
    activity.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": case "healthy": return "bg-green-500/20 text-green-400";
      case "warning": return "bg-yellow-500/20 text-yellow-400";
      case "error": case "critical": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleLogout = () => {
    onLogout?.();
  };

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Neuvera Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => onNavigate?.("landing")}
                variant="outline"
                className="border-border text-foreground hover:bg-secondary"
              >
                Back to Home
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-border text-foreground hover:bg-secondary"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 lg:grid-cols-6 bg-secondary border-border">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <ChartSpline className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <SquareActivity className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center space-x-2">
              <MonitorCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Radar className="w-4 h-4" />
              <span className="hidden sm:inline">Pixel Events</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {chatStats.map((stat, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.metric}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`flex items-center space-x-1 text-sm ${
                        stat.trend === "up" ? "text-green-400" : 
                        stat.trend === "down" ? "text-red-400" : "text-gray-400"
                      }`}>
                        <span>{stat.change > 0 ? "+" : ""}{stat.change}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ChartPie className="w-5 h-5 text-primary" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{metric.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                metric.status === "healthy" ? "bg-green-500" :
                                metric.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${metric.value}%` }}
                            />
                          </div>
                          <span className="text-sm text-foreground">{metric.value}{metric.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SquareActivity className="w-5 h-5 text-primary" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm text-foreground">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.username} • {activity.timestamp}</p>
                        </div>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ChartNetwork className="w-5 h-5 text-primary" />
                    <span>Chat Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ChartSpline className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Chart visualization would be rendered here</p>
                      <p className="text-sm">Real-time chat performance metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gauge className="w-5 h-5 text-primary" />
                    <span>User Engagement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ChartPie className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Engagement metrics chart</p>
                      <p className="text-sm">User interaction patterns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">User Activity</h2>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-input border-border text-foreground"
                />
              </div>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">User</TableHead>
                      <TableHead className="text-muted-foreground">Action</TableHead>
                      <TableHead className="text-muted-foreground">Timestamp</TableHead>
                      <TableHead className="text-muted-foreground">IP Address</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => (
                      <TableRow key={activity.id} className="border-border hover:bg-secondary/50">
                        <TableCell className="text-foreground">{activity.username}</TableCell>
                        <TableCell className="text-foreground">{activity.action}</TableCell>
                        <TableCell className="text-muted-foreground">{activity.timestamp}</TableCell>
                        <TableCell className="text-muted-foreground">{activity.ip}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemMetrics.map((metric, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <MonitorDot className={`w-4 h-4 ${
                          metric.status === "healthy" ? "text-green-400" :
                          metric.status === "warning" ? "text-yellow-400" : "text-red-400"
                        }`} />
                        <span className="text-sm text-muted-foreground">{metric.name}</span>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-2xl font-bold text-foreground">{metric.value}{metric.unit}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            metric.status === "healthy" ? "bg-green-500" :
                            metric.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ServerOff className="w-5 h-5 text-primary" />
                  <span>System Health Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Real-time system monitoring dashboard</p>
                    <p className="text-sm">Live performance metrics and alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab - Pixel Tracking */}
          <TabsContent value="events" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Radar className="w-5 h-5 text-primary" />
                  <span>Tracking Pixel Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">24,531</div>
                    <div className="text-sm text-muted-foreground">Page Views Today</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">1,287</div>
                    <div className="text-sm text-muted-foreground">Unique Visitors</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">96.8%</div>
                    <div className="text-sm text-muted-foreground">Tracking Success Rate</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Tracked Events</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-foreground">Page View - Landing Page</div>
                        <div className="text-xs text-muted-foreground">Referrer: google.com | User Agent: Chrome/121.0</div>
                      </div>
                      <div className="text-xs text-muted-foreground">2 mins ago</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-foreground">Button Click - Try Neuvera</div>
                        <div className="text-xs text-muted-foreground">Session ID: a1b2c3 | Duration: 45s</div>
                      </div>
                      <div className="text-xs text-muted-foreground">5 mins ago</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-foreground">Chat Session Started</div>
                        <div className="text-xs text-muted-foreground">User ID: user_456 | Auth Status: Authenticated</div>
                      </div>
                      <div className="text-xs text-muted-foreground">8 mins ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    <span>System Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">API Rate Limit</label>
                    <Input 
                      defaultValue="1000"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Session Timeout (minutes)</label>
                    <Input 
                      defaultValue="30"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Update Configuration
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <KeyRound className="w-5 h-5 text-primary" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">Two-Factor Authentication</span>
                    <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">IP Whitelisting</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400">Partial</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">SSL Certificate</span>
                    <Badge className="bg-green-500/20 text-green-400">Valid</Badge>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Manage Security
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}