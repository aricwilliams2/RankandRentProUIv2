import { http } from 'msw';
import { setupWorker } from 'msw/browser';
import { sampleLeads } from '../data/sampleLeads';

// Load sample data from provided JSON files
const serpData = {
  status: "success",
  serp: {
    results: [
      {
        content: ["organic", {
          link: ["Some", {
            title: "Junk Pick Up Services Near Me | What We Take",
            url: ["Url", { url: "https://www.1800gotjunk.com/us_en/what-we-take/what_we_take" }],
            metrics: {
              rank: 88313,
              domainRating: 71,
              urlRating: 16,
              refpages: 403,
              domains: 108,
              traffic: 33584,
              cost: 10688647,
              keywords: 4018,
              topKeyword: "junk removal",
              topVolume: 80000,
            }
          }],
          siteLinks: []
        }],
        pos: 3,
        posWithMetrics: 1
      },
      {
        content: ["organic", {
          link: ["Some", {
            title: "Eco-Friendly Junk Removal Services",
            url: ["Url", { url: "https://www.collegehunkshaulingjunk.com/junk-removal/" }],
            metrics: {
              rank: 132376,
              domainRating: 69,
              urlRating: 30,
              refpages: 5632,
              domains: 101,
              traffic: 4473,
              cost: 1556518,
              keywords: 1080,
              topKeyword: "haul away junk",
              topVolume: 9100,
            }
          }],
          siteLinks: []
        }],
        pos: 4,
        posWithMetrics: 2
      },
      {
        content: ["organic", {
          link: ["Some", {
            title: "Junk King: North America's Best Junk Removal and Hauling ...",
            url: ["Url", { url: "https://www.junk-king.com/" }],
            metrics: {
              rank: 226361,
              domainRating: 63,
              urlRating: 29,
              refpages: 3910,
              domains: 929,
              traffic: 12194,
              cost: 3591612,
              keywords: 653,
              topKeyword: "junk king",
              topVolume: 8700,
            }
          }],
          siteLinks: []
        }],
        pos: 5,
        posWithMetrics: 3
      }
    ],
    source: "Serps"
  },
  lastUpdate: "2025-06-03T14:31:16Z"
};

const trafficData = {
  status: "success",
  traffic_history: [
    { date: "2025-01-01", organic: 11 },
    { date: "2025-02-01", organic: 22 },
    { date: "2025-03-01", organic: 25 },
    { date: "2025-04-01", organic: 26 },
    { date: "2025-05-01", organic: 32 },
    { date: "2025-06-01", organic: 31 }
  ],
  traffic: {
    trafficMonthlyAvg: 30,
    costMontlyAvg: 12520
  },
  top_pages: [
    { url: "https://www.justcallscott.com/", traffic: 22, share: 75.86 },
    { url: "https://www.justcallscott.com/junk-removal-morristown-tn", traffic: 3, share: 10.34 },
    { url: "https://www.justcallscott.com/maryville-tn", traffic: 1, share: 3.45 }
  ],
  top_countries: [
    { country: "us", share: 95.47 },
    { country: "ru", share: 3.88 },
    { country: "kr", share: 0.49 }
  ],
  top_keywords: [
    { keyword: "junk removal knoxville tn", position: 7, traffic: 300 },
    { keyword: "junk removal morristown tn", position: 3, traffic: 20 },
    { keyword: "junk removal knoxville", position: 9, traffic: 80 }
  ]
};

const competitorData = {
  domain_statistics: {
    organic: {
      keywords_in_pos_1: 0,
      keywords_in_pos_2_3: 0,
      keywords_in_pos_4_10: 5,
      estimated_traffic_volume: 110.87,
      total_keywords_count: 69,
      is_new: 16,
      is_up: 15,
      is_down: 34,
      is_lost: 0
    },
    paid: {
      keywords_in_pos_1: 0,
      keywords_in_pos_2_3: 0,
      keywords_in_pos_4_10: 0,
      estimated_traffic_volume: 0,
      total_keywords_count: 0
    }
  },
  keywords: [
    {
      keyword: "knoxville junk removal",
      avg_search_volume: 720,
      avg_cpc: 12.34,
      competition_level: "MEDIUM",
      keyword_difficulty: 26,
      rank: 7,
      previous_rank: 13,
      estimated_traffic_volume: 20
    },
    {
      keyword: "junk removal knoxville tn",
      avg_search_volume: 720,
      avg_cpc: 12.34,
      competition_level: "MEDIUM",
      keyword_difficulty: 26,
      rank: 6,
      previous_rank: 10,
      estimated_traffic_volume: 20
    },
    {
      keyword: "demolition knoxville",
      avg_search_volume: 90,
      avg_cpc: 14.63,
      competition_level: "LOW",
      keyword_difficulty: 0,
      rank: 23,
      previous_rank: 21,
      estimated_traffic_volume: 1
    }
  ],
  total_items: 69
};

// Mock leads store
let mockLeads = [...sampleLeads];
let nextLeadId = Math.max(...mockLeads.map(lead => lead.id)) + 1;

// Mock research data
const mockResearchData = [
  {
    id: 1,
    niche: "Junk Removal",
    location: "Atlanta, GA",
    competition: "Medium",
    avgRent: 2500,
    leadGenerated: 45,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    niche: "Landscaping",
    location: "Miami, FL", 
    competition: "High",
    avgRent: 3200,
    leadGenerated: 62,
    createdAt: "2024-01-20"
  }
];

// Create mock handlers
const handlers = [
  http.get('/api/serp', (req, res, ctx) => {
    const keyword = req.url.searchParams.get('keyword');
    console.log('Mock SERP API called with keyword:', keyword);
    return res(ctx.status(200), ctx.json(serpData));
  }),

  http.get('/api/traffic', (req, res, ctx) => {
    const domain = req.url.searchParams.get('domain');
    console.log('Mock Traffic API called with domain:', domain);
    return res(ctx.status(200), ctx.json(trafficData));
  }),

  http.get('/api/competitors', (req, res, ctx) => {
    const domain = req.url.searchParams.get('domain');
    console.log('Mock Competitor API called with domain:', domain);
    return res(ctx.status(200), ctx.json(competitorData));
  }),

  http.get('/api/research', (req, res, ctx) => {
    console.log('Mock Research API called');
    return res(ctx.status(200), ctx.json(mockResearchData));
  }),

  // Leads API handlers
  http.get('http://127.0.0.1:8000/api/leads', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '1');
    const limit = parseInt(req.url.searchParams.get('limit') || '10');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLeads = mockLeads.slice(startIndex, endIndex);
    
    console.log('Mock Leads API called - GET');
    return res(ctx.status(200), ctx.json({
      leads: paginatedLeads,
      total: mockLeads.length,
      page,
      totalPages: Math.ceil(mockLeads.length / limit)
    }));
  }),

  http.post('http://127.0.0.1:8000/api/leads', async (req, res, ctx) => {
    const newLead = await req.json();
    const lead = {
      ...newLead,
      id: nextLeadId++,
      createdAt: new Date().toISOString()
    };
    mockLeads.push(lead);
    console.log('Mock Leads API called - POST');
    return res(ctx.status(201), ctx.json(lead));
  }),

  http.put('http://127.0.0.1:8000/api/leads/:id', async (req, res, ctx) => {
    const leadId = parseInt(ctx.params.id);
    const updatedData = await req.json();
    const leadIndex = mockLeads.findIndex(lead => lead.id === leadId);
    
    if (leadIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Lead not found' }));
    }
    
    mockLeads[leadIndex] = { ...mockLeads[leadIndex], ...updatedData };
    console.log('Mock Leads API called - PUT');
    return res(ctx.status(200), ctx.json(mockLeads[leadIndex]));
  }),

  http.delete('http://127.0.0.1:8000/api/leads/:id', (req, res, ctx) => {
    const leadId = parseInt(ctx.params.id);
    const leadIndex = mockLeads.findIndex(lead => lead.id === leadId);
    
    if (leadIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Lead not found' }));
    }
    
    mockLeads.splice(leadIndex, 1);
    console.log('Mock Leads API called - DELETE');
    return res(ctx.status(200), ctx.json({ message: 'Lead deleted successfully' }));
  })
];

// Initialize MSW worker
export const worker = setupWorker(...handlers);

// Start the worker
export const startMockServer = () => {
  if (import.meta.env.DEV) {
    worker.start({
      onUnhandledRequest: 'bypass'
    }).catch(error => {
      console.error('Error starting mock server:', error);
    });
    console.log('Mock API server started');
  }
};