'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trackingDataService } from '@/services/tracking-data-service';

interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
}

interface HeatmapData {
  points: HeatmapPoint[];
  maxValue: number;
  pageUrl: string;
}

export default function HeatmapVisualization() {
  const [activeTab, setActiveTab] = useState('clicks');
  const [selectedPage, setSelectedPage] = useState('all');
  const [pages, setPages] = useState<string[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Fetch available pages for selection
  useEffect(() => {
    const fetchPages = async () => {
      // In a real implementation, this would fetch from an API
      const pageViews = await trackingDataService.getPageViews();
      const uniquePages = Array.from(new Set(pageViews.map(pv => pv.url)));
      setPages(['all', ...uniquePages]);
    };
    
    fetchPages();
  }, []);

  // Fetch heatmap data when tab or page selection changes
  useEffect(() => {
    const fetchHeatmapData = async () => {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from an API
      // Simulate API call with timeout
      setTimeout(() => {
        // Generate mock heatmap data
        const mockData: HeatmapPoint[] = [];
        const maxPoints = 50;
        let maxValue = 0;
        
        for (let i = 0; i < maxPoints; i++) {
          const value = Math.floor(Math.random() * 10) + 1;
          maxValue = Math.max(maxValue, value);
          
          mockData.push({
            x: Math.floor(Math.random() * canvasSize.width),
            y: Math.floor(Math.random() * canvasSize.height),
            value
          });
        }
        
        setHeatmapData({
          points: mockData,
          maxValue,
          pageUrl: selectedPage === 'all' ? 'All Pages' : selectedPage
        });
        
        setIsLoading(false);
      }, 1000);
    };
    
    fetchHeatmapData();
  }, [activeTab, selectedPage, canvasSize]);

  // Render heatmap on canvas when data changes
  useEffect(() => {
    if (!heatmapData || isLoading) return;
    
    const canvas = document.getElementById('heatmapCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw heatmap points
    heatmapData.points.forEach(point => {
      const radius = 20 + (point.value / heatmapData.maxValue) * 30;
      const alpha = 0.2 + (point.value / heatmapData.maxValue) * 0.6;
      
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      
      // Color based on interaction type
      let color;
      if (activeTab === 'clicks') {
        color = `rgba(255, 0, 0, ${alpha})`; // Red for clicks
      } else if (activeTab === 'moves') {
        color = `rgba(0, 0, 255, ${alpha})`; // Blue for mouse movements
      } else {
        color = `rgba(0, 255, 0, ${alpha})`; // Green for scrolls
      }
      
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [heatmapData, isLoading, activeTab]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Interaction Heatmap</CardTitle>
        <CardDescription>
          Visualize where users interact with your pages
        </CardDescription>
        <div className="flex items-center space-x-4">
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Page" />
            </SelectTrigger>
            <SelectContent>
              {pages.map(page => (
                <SelectItem key={page} value={page}>
                  {page === 'all' ? 'All Pages' : page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            // Refresh data
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 1000);
          }}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="clicks">Clicks</TabsTrigger>
            <TabsTrigger value="moves">Mouse Movement</TabsTrigger>
            <TabsTrigger value="scrolls">Scroll Depth</TabsTrigger>
          </TabsList>
          
          <div className="relative border rounded-md overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
            
            <div className="relative">
              {/* Placeholder website screenshot (in a real implementation, this would be an actual screenshot) */}
              <div className="bg-muted h-[600px] w-full flex items-center justify-center text-muted-foreground">
                {selectedPage === 'all' ? (
                  <p>Aggregated data from all pages</p>
                ) : (
                  <p>Website preview for: {selectedPage}</p>
                )}
              </div>
              
              {/* Heatmap overlay */}
              <canvas 
                id="heatmapCanvas" 
                width={canvasSize.width} 
                height={canvasSize.height}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Showing {activeTab} heatmap for {selectedPage === 'all' ? 'all pages' : selectedPage}</p>
            <p className="mt-1">Data collected from user interactions in the last 30 days</p>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}