'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartProps {
  data: Array<{ name: string; value: number }>;
  xAxisKey?: string;
  yAxisKey?: string;
  height?: number;
  colors?: string[];
}

export function LineChart({ 
  data, 
  xAxisKey = 'name', 
  yAxisKey = 'value', 
  height = 300 
}: ChartProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return <div style={{ height }}></div>;
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e4e4e4' : '#1a1a1a';
  const gridColor = isDark ? '#333333' : '#e0e0e0';
  const lineColor = isDark ? '#a453e9' : '#8a2be2';
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fill: textColor }} 
          axisLine={{ stroke: gridColor }}
          tickLine={{ stroke: gridColor }}
        />
        <YAxis 
          tick={{ fill: textColor }} 
          axisLine={{ stroke: gridColor }}
          tickLine={{ stroke: gridColor }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
            borderColor: isDark ? '#333333' : '#e0e0e0',
            color: textColor
          }} 
        />
        <Legend wrapperStyle={{ color: textColor }} />
        <Line 
          type="monotone" 
          dataKey={yAxisKey} 
          stroke={lineColor} 
          strokeWidth={2}
          activeDot={{ r: 6 }} 
          animationDuration={1500}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export function BarChart({ 
  data, 
  xAxisKey = 'name', 
  yAxisKey = 'value', 
  height = 300 
}: ChartProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return <div style={{ height }}></div>;
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e4e4e4' : '#1a1a1a';
  const gridColor = isDark ? '#333333' : '#e0e0e0';
  const barColor = isDark ? '#a453e9' : '#8a2be2';
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fill: textColor }} 
          axisLine={{ stroke: gridColor }}
          tickLine={{ stroke: gridColor }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis 
          tick={{ fill: textColor }} 
          axisLine={{ stroke: gridColor }}
          tickLine={{ stroke: gridColor }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
            borderColor: isDark ? '#333333' : '#e0e0e0',
            color: textColor
          }} 
        />
        <Legend wrapperStyle={{ color: textColor }} />
        <Bar 
          dataKey={yAxisKey} 
          fill={barColor} 
          radius={[4, 4, 0, 0]}
          animationDuration={1500}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function PieChart({ 
  data, 
  height = 300,
  colors = ['#a453e9', '#8000ff', '#5a00b8', '#4a0099', '#3c007a']
}: ChartProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return <div style={{ height }}></div>;
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e4e4e4' : '#1a1a1a';
  
  // Use theme-appropriate colors
  const chartColors = isDark 
    ? ['#a453e9', '#8000ff', '#5a00b8', '#4a0099', '#3c007a']
    : ['#8a2be2', '#9932cc', '#8b008b', '#800080', '#4b0082'];
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={chartColors[index % chartColors.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
            borderColor: isDark ? '#333333' : '#e0e0e0',
            color: textColor
          }} 
        />
        <Legend 
          formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}