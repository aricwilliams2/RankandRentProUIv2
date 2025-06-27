import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import { KeywordData, TrafficInsights } from '../types';

interface KeywordRankingChartProps {
  keywords: KeywordData[];
}

export const KeywordRankingChart: React.FC<KeywordRankingChartProps> = ({ keywords }) => {
  const theme = useTheme();
  
  // Process data and reverse the ranks (so higher is better in the chart)
  const data = keywords.map(k => ({
    name: k.keyword,
    current: 100 - k.currentRank, // Transform to make higher ranks show higher on chart
    previous: 100 - k.previousRank,
    volume: k.volume
  })).slice(0, 10); // Limit to top 10

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} label={{ value: 'Ranking Score', position: 'insideBottom', offset: -5 }} />
        <YAxis dataKey="name" type="category" width={145} tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'current' || name === 'previous') {
              return [`Position: ${Math.round(100 - Number(value))}`, name === 'current' ? 'Current Rank' : 'Previous Rank'];
            }
            return [value, name];
          }}
          labelFormatter={(label) => `Keyword: ${label}`}
        />
        <Legend />
        <Bar dataKey="current" fill={theme.palette.primary.main} name="Current Rank" />
        <Bar dataKey="previous" fill={theme.palette.grey[400]} name="Previous Rank" />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface TrafficHistoryChartProps {
  trafficData: TrafficInsights;
}

export const TrafficHistoryChart: React.FC<TrafficHistoryChartProps> = ({ trafficData }) => {
  const theme = useTheme();
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={trafficData.history}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} visitors`, 'Organic Traffic']} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="organic" 
          stroke={theme.palette.primary.main} 
          activeDot={{ r: 8 }}
          name="Organic Traffic"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface TopPagesChartProps {
  pages: Array<{ url: string, traffic: number, share: number }>;
}

export const TopPagesChart: React.FC<TopPagesChartProps> = ({ pages }) => {
  const theme = useTheme();
  
  // Colors for pie slices
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.primary.light,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main
  ];
  
  // Process data to make it more readable
  const data = pages.map(page => ({
    name: page.url.replace(/^https?:\/\/[^/]+\//, '/'),
    value: page.traffic,
    share: page.share
  }));
  
  return (
    <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => {
              if (name === 'value') {
                return [`${value} visits`, 'Traffic'];
              }
              return [value, name];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface KeywordTrendsChartProps {
  trends: {
    new: number;
    improved: number;
    declined: number;
    lost: number;
  };
}

export const KeywordTrendsChart: React.FC<KeywordTrendsChartProps> = ({ trends }) => {
  const theme = useTheme();
  
  const data = [
    { name: 'New', value: trends.new, color: theme.palette.success.main },
    { name: 'Improved', value: trends.improved, color: theme.palette.info.main },
    { name: 'Declined', value: trends.declined, color: theme.palette.warning.main },
    { name: 'Lost', value: trends.lost, color: theme.palette.error.main },
  ];
  
  return (
    <Box sx={{ height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Keywords">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};