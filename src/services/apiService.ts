import type { MarketResearch, CompetitorAnalysis, KeywordOpportunity } from '../types';

// Define interfaces for API responses
interface SerpResponse {
  status: string;
  serp: {
    results: any[];
    source: string;
  };
  lastUpdate: string;
}

interface TrafficResponse {
  status: string;
  traffic_history: {
    date: string;
    organic: number;
  }[];
  traffic: {
    trafficMonthlyAvg: number;
    costMontlyAvg: number;
  };
  top_pages: {
    url: string;
    traffic: number;
    share: number;
  }[];
  top_countries: {
    country: string;
    share: number;
  }[];
  top_keywords: {
    keyword: string;
    position: number;
    traffic: number;
  }[];
}

interface CompetitorResponse {
  domain_statistics: {
    organic: {
      keywords_in_pos_1: number;
      keywords_in_pos_2_3: number;
      keywords_in_pos_4_10: number;
      estimated_traffic_volume: number;
      total_keywords_count: number;
      is_new: number;
      is_up: number;
      is_down: number;
      is_lost: number;
    };
    paid: {
      keywords_in_pos_1: number;
      keywords_in_pos_2_3: number;
      keywords_in_pos_4_10: number;
      estimated_traffic_volume: number;
      total_keywords_count: number;
    };
  };
  keywords: {
    keyword: string;
    avg_search_volume: number;
    avg_cpc: number;
    competition_level: string;
    keyword_difficulty: number;
    rank: number;
    previous_rank: number;
    estimated_traffic_volume: number;
  }[];
  total_items: number;
}

// Mock API functions for demonstration - in production, these would be actual API calls
export const fetchSerpData = async (keyword: string): Promise<SerpResponse> => {
  // In a real implementation, this would make an actual API call
  // For demo purposes, we'll return the data from the provided JSON
  const response = await fetch('/api/serp?keyword=' + encodeURIComponent(keyword));
  return await response.json();
};

export const fetchTrafficData = async (domain: string): Promise<TrafficResponse> => {
  // In a real implementation, this would make an actual API call
  const response = await fetch('/api/traffic?domain=' + encodeURIComponent(domain));
  return await response.json();
};

export const fetchCompetitorData = async (domain: string): Promise<CompetitorResponse> => {
  // In a real implementation, this would make an actual API call
  const response = await fetch('/api/competitors?domain=' + encodeURIComponent(domain));
  return await response.json();
};

// Function to perform market research analysis
export const performMarketResearch = async (niche: string, location: string): Promise<MarketResearch> => {
  try {
    // This would combine multiple API calls in a real implementation
    // For now, we'll simulate the analysis process
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create research data with realistic values
    const competitionScore = Math.floor(Math.random() * 60) + 20;
    const monthlySearchVolume = Math.floor(Math.random() * 15000) + 5000;
    const estimatedValue = Math.floor(Math.random() * 3000) + 2000;
    
    const competitors: CompetitorAnalysis[] = [
      {
        id: '1',
        domain: `${niche.toLowerCase().replace(/\s+/g, '')}pros.com`,
        domainAuthority: Math.floor(Math.random() * 30) + 20,
        backlinks: Math.floor(Math.random() * 200) + 100,
        organicKeywords: Math.floor(Math.random() * 500) + 200,
        estimatedTraffic: Math.floor(Math.random() * 2000) + 1000,
        topKeywords: [
          `${niche.toLowerCase()} ${location.split(',')[0].toLowerCase()}`,
          `best ${niche.toLowerCase()} in ${location.split(',')[0].toLowerCase()}`,
          `affordable ${niche.toLowerCase()} services`
        ],
        weaknesses: [
          'Poor mobile experience',
          'Limited service pages',
          'Few local citations'
        ]
      },
      {
        id: '2',
        domain: `${location.split(',')[0].toLowerCase()}${niche.toLowerCase()}.com`,
        domainAuthority: Math.floor(Math.random() * 20) + 30,
        backlinks: Math.floor(Math.random() * 300) + 150,
        organicKeywords: Math.floor(Math.random() * 600) + 300,
        estimatedTraffic: Math.floor(Math.random() * 3000) + 1500,
        topKeywords: [
          `${niche.toLowerCase()} company ${location.split(',')[0].toLowerCase()}`,
          `${niche.toLowerCase()} services near me`,
          `professional ${niche.toLowerCase()}`
        ],
        weaknesses: [
          'Outdated content',
          'Slow website speed',
          'Few customer reviews'
        ]
      }
    ];

    const keywordOpportunities: KeywordOpportunity[] = [
      {
        id: '1',
        keyword: `${niche.toLowerCase()} services in ${location.split(',')[0].toLowerCase()}`,
        searchVolume: Math.floor(Math.random() * 800) + 200,
        difficulty: Math.floor(Math.random() * 40) + 10,
        cpc: parseFloat((Math.random() * 10 + 5).toFixed(2)),
        competition: 'medium',
        intent: 'transactional'
      },
      {
        id: '2',
        keyword: `best ${niche.toLowerCase()} ${location.split(',')[0].toLowerCase()}`,
        searchVolume: Math.floor(Math.random() * 500) + 100,
        difficulty: Math.floor(Math.random() * 30) + 20,
        cpc: parseFloat((Math.random() * 8 + 4).toFixed(2)),
        competition: 'high',
        intent: 'commercial'
      },
      {
        id: '3',
        keyword: `affordable ${niche.toLowerCase()} near me`,
        searchVolume: Math.floor(Math.random() * 300) + 100,
        difficulty: Math.floor(Math.random() * 20) + 15,
        cpc: parseFloat((Math.random() * 7 + 3).toFixed(2)),
        competition: 'medium',
        intent: 'transactional'
      },
      {
        id: '4',
        keyword: `${niche.toLowerCase()} company reviews`,
        searchVolume: Math.floor(Math.random() * 200) + 50,
        difficulty: Math.floor(Math.random() * 25) + 10,
        cpc: parseFloat((Math.random() * 5 + 2).toFixed(2)),
        competition: 'low',
        intent: 'informational'
      }
    ];

    // Create the research object
    const research: MarketResearch = {
      id: String(Date.now()),
      niche,
      location,
      status: 'completed',
      monthlySearchVolume,
      competitionScore,
      estimatedValue,
      competitors,
      keywordOpportunities,
      notes: `The ${niche} market in ${location} shows ${competitionScore < 40 ? 'low' : competitionScore < 70 ? 'moderate' : 'high'} competition with good opportunity for ranking. Local service providers have ${competitionScore < 40 ? 'weak online presence' : 'established sites but ranking vulnerabilities'}. With proper optimization, a new site could rank within 3-6 months.`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return research;
  } catch (error) {
    console.error('Error performing market research:', error);
    throw error;
  }
};

// Function to process SERP data into competitor analysis
export const processSerpData = (data: SerpResponse): any[] => {
  if (!data.serp || !data.serp.results) return [];

  return data.serp.results
    .filter(result => result.content[0] === 'organic')
    .map(result => {
      const content = result.content[1];
      const link = content.link[1];
      const metrics = link.metrics;
      
      return {
        domain: link.url[1].url.replace(/^https?:\/\//, '').split('/')[0],
        title: link.title,
        url: link.url[1].url,
        metrics: metrics ? {
          domainRating: metrics.domainRating || 0,
          organicKeywords: metrics.keywords || 0,
          organicTraffic: metrics.traffic || 0,
          backlinks: metrics.refpages || 0,
          domains: metrics.domains || 0,
        } : null
      };
    })
    .filter(item => item.metrics);
};

// Function to extract top keywords from competitor data
export const extractTopKeywords = (data: CompetitorResponse): any[] => {
  if (!data.keywords) return [];

  return data.keywords
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 20)
    .map(keyword => ({
      keyword: keyword.keyword,
      volume: keyword.avg_search_volume,
      cpc: keyword.avg_cpc,
      difficulty: keyword.keyword_difficulty,
      competition: keyword.competition_level.toLowerCase(),
      currentRank: keyword.rank,
      previousRank: keyword.previous_rank,
      trafficPotential: keyword.estimated_traffic_volume
    }));
};

// Function to analyze domain statistics
export const analyzeDomainStatistics = (data: CompetitorResponse) => {
  const stats = data.domain_statistics.organic;
  
  return {
    totalKeywords: stats.total_keywords_count,
    keywordsTop10: stats.keywords_in_pos_1 + stats.keywords_in_pos_2_3 + stats.keywords_in_pos_4_10,
    keywordsTop3: stats.keywords_in_pos_1 + stats.keywords_in_pos_2_3,
    keywordsFirst: stats.keywords_in_pos_1,
    estimatedTraffic: stats.estimated_traffic_volume,
    keywordTrends: {
      new: stats.is_new,
      improved: stats.is_up,
      declined: stats.is_down,
      lost: stats.is_lost,
    }
  };
};