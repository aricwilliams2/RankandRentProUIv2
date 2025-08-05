import type { ChecklistItem, ChecklistCategory } from '../types';

export const checklistCategories: ChecklistCategory[] = [
  {
    id: 'gmb-basic',
    name: 'GMB Basic Setup',
    description: 'Google My Business basic setup and optimization',
    color: '#2196F3',
    icon: 'MapPin',
    items: []
  },
  {
    id: 'website-seo',
    name: 'Website & SEO',
    description: 'Website optimization and SEO implementation',
    color: '#4CAF50',
    icon: 'Globe',
    items: []
  },
  {
    id: 'content-marketing',
    name: 'Content & Marketing',
    description: 'Content creation and marketing activities',
    color: '#FF9800',
    icon: 'FileText',
    items: []
  },
  {
    id: 'local-seo',
    name: 'Local SEO',
    description: 'Local search optimization and citations',
    color: '#9C27B0',
    icon: 'Map',
    items: []
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Social media presence and engagement',
    color: '#E91E63',
    icon: 'Share2',
    items: []
  },
  {
    id: 'advanced-optimization',
    name: 'Advanced Optimization',
    description: 'Advanced technical optimization and monitoring',
    color: '#607D8B',
    icon: 'Settings',
    items: []
  }
];

export const checklistItems: ChecklistItem[] = [
  // GMB Basic Setup
  {
    id: 'gmb-1',
    title: 'GMB Basic Audit Checklist Completed',
    description: 'Complete basic audit of Google My Business profile',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'critical',
    estimatedTime: 30
  },
  {
    id: 'gmb-2',
    title: 'Check for Schema Mark-up Validation',
    description: 'Verify schema markup is properly implemented and validated',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'gmb-3',
    title: 'All Fields Populated with Proper Attributes',
    description: 'Ensure all GMB fields are filled with accurate information',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },
  {
    id: 'gmb-4',
    title: '10 Images Uploaded',
    description: 'Upload at least 10 high-quality images to GMB profile',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'gmb-5',
    title: 'Review Scanner Shared with DDPL Contact Details',
    description: 'Share review scanner with client contact details',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 15
  },
  {
    id: 'gmb-6',
    title: 'List of Keywords Received',
    description: 'Obtain and document target keywords from client',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'critical',
    estimatedTime: 20
  },
  {
    id: 'gmb-7',
    title: 'Category Research Completed',
    description: 'Research and select appropriate business categories',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },
  {
    id: 'gmb-8',
    title: 'Top 5-10 Categories Listed',
    description: 'Document the top 5-10 relevant business categories',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'gmb-9',
    title: 'Services Added as per Categories',
    description: 'Add services that align with selected categories',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'gmb-10',
    title: 'Services Details Added as per Main Keywords',
    description: 'Add detailed service descriptions using main keywords',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'gmb-11',
    title: 'Business Name Corrected as per SEO',
    description: 'Optimize business name for SEO and local search',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 20
  },
  {
    id: 'gmb-12',
    title: 'Top 4 Product Categories Added',
    description: 'Add the top 4 most relevant product categories',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'gmb-13',
    title: 'Q&A Link Shared with Clients',
    description: 'Share Q&A section link with clients for engagement',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 10
  },
  {
    id: 'gmb-14',
    title: 'Map Added to Website',
    description: 'Embed Google Maps into the website',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'gmb-15',
    title: 'Google Free Website Created',
    description: 'Create a free Google My Business website',
    category: 'gmb-basic',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },

  // Website & SEO
  {
    id: 'website-1',
    title: 'Check Website Page SEO Optimization',
    description: 'Verify all website pages are properly SEO optimized',
    category: 'website-seo',
    isCompleted: false,
    priority: 'critical',
    estimatedTime: 90
  },
  {
    id: 'website-2',
    title: '10-12 FAQ Section Added to Website',
    description: 'Add comprehensive FAQ section with 10-12 questions',
    category: 'website-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },
  {
    id: 'website-3',
    title: 'All Related Products and Services Added',
    description: 'Add all relevant products and services to website',
    category: 'website-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'website-4',
    title: 'H1, H2, H3 Tags Added to Website',
    description: 'Implement proper heading hierarchy for SEO',
    category: 'website-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 30
  },
  {
    id: 'website-5',
    title: 'Schema Markup Inserted to Website',
    description: 'Add structured data markup to website',
    category: 'website-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },
  {
    id: 'website-6',
    title: 'Google Search Console Attached',
    description: 'Connect Google Search Console to website',
    category: 'website-seo',
    isCompleted: false,
    priority: 'critical',
    estimatedTime: 30
  },
  {
    id: 'website-7',
    title: 'Location Mapped with Other Search Engines',
    description: 'Add business to Bing and other search engines',
    category: 'website-seo',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'website-8',
    title: 'Google Tag Manager Attached',
    description: 'Implement Google Tag Manager for tracking',
    category: 'website-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'website-9',
    title: 'Google Map Embedded into Website',
    description: 'Embed interactive Google Map into website',
    category: 'website-seo',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },

  // Content & Marketing
  {
    id: 'content-1',
    title: 'Regular Work Started',
    description: 'Begin regular content creation and marketing work',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'critical',
    estimatedTime: 120
  },
  {
    id: 'content-2',
    title: 'Free Google Website Created and Published',
    description: 'Create and publish a free Google My Business website',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 90
  },
  {
    id: 'content-3',
    title: 'Find Relevant Categories through GMB Everywhere',
    description: 'Research and update categories using GMB Everywhere',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },
  {
    id: 'content-4',
    title: 'Competitor Analysis',
    description: 'Conduct comprehensive competitor analysis',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 120
  },
  {
    id: 'content-5',
    title: 'Get Reference Keywords from Client',
    description: 'Obtain target keywords and phrases from client',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'critical',
    estimatedTime: 30
  },
  {
    id: 'content-6',
    title: 'Business Related High Search Volume Keywords Research',
    description: 'Research high-volume keywords relevant to business',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 90
  },
  {
    id: 'content-7',
    title: 'Select High Volume Keywords',
    description: 'Select and prioritize high-volume keywords',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'content-8',
    title: 'Update Every Service and Description with Keywords',
    description: 'Optimize all service descriptions with target keywords',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'content-9',
    title: 'Product Based on Services Added with Category',
    description: 'Add products organized by service categories',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'content-10',
    title: '30 Citations Done',
    description: 'Complete 30 local business citations',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 180
  },
  {
    id: 'content-11',
    title: 'Q&A Added in Profile',
    description: 'Add Q&A section to business profile',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 30
  },
  {
    id: 'content-12',
    title: 'Message Enabled',
    description: 'Enable messaging feature on business profile',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 15
  },
  {
    id: 'content-13',
    title: 'Auto Responder through FAQ',
    description: 'Set up automated responses using FAQ',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 30
  },
  {
    id: 'content-14',
    title: 'Post for Every Service and Keywords',
    description: 'Create posts for each service and keyword',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 120
  },
  {
    id: 'content-15',
    title: 'Social Media Account Created with NAM+W',
    description: 'Create social media accounts with name and website',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },
  {
    id: 'content-16',
    title: '2 Posts Done on Social Media Page',
    description: 'Create and publish 2 posts on social media',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'content-17',
    title: '1 Offer Created',
    description: 'Create one promotional offer',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'content-18',
    title: 'Include Main Keywords in Product/Post Descriptions',
    description: 'Integrate main keywords into all descriptions',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },
  {
    id: 'content-19',
    title: 'Review Link Shared with Client',
    description: 'Share review link with client for collection',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 15
  },
  {
    id: 'content-20',
    title: 'Get Daily Written Reviews',
    description: 'Collect daily written reviews from clients',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 30
  },
  {
    id: 'content-21',
    title: 'Response to Reviews',
    description: 'Respond to all reviews professionally',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'content-22',
    title: 'Schema Markup with Social Media Accounts',
    description: 'Add schema markup linking social media accounts',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'content-23',
    title: 'Map Embedded in Website',
    description: 'Embed interactive map into website',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'content-24',
    title: 'Top Three Competitors Citations Link Extract',
    description: 'Extract citation links from top 3 competitors',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 90
  },
  {
    id: 'content-25',
    title: 'Top Three Competitors Category Research',
    description: 'Research categories used by top 3 competitors',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },
  {
    id: 'content-26',
    title: 'Photo File Names as per Keywords',
    description: 'Rename photo files using target keywords',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 30
  },
  {
    id: 'content-27',
    title: 'Bi-Weekly Posting on Social Media',
    description: 'Maintain bi-weekly social media posting schedule',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'content-28',
    title: 'Images Uploaded in 720x720px',
    description: 'Ensure all images are 720x720 pixels',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 45
  },
  {
    id: 'content-29',
    title: 'Profile Completed (Green)',
    description: 'Complete profile optimization (status: green)',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'critical',
    estimatedTime: 120
  },
  {
    id: 'content-30',
    title: 'Top 10 Citations for Regular Updates',
    description: 'Identify top 10 citation sources for regular updates',
    category: 'content-marketing',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },

  // Local SEO
  {
    id: 'local-1',
    title: 'Optimize Google My Business (GMB) Profile',
    description: 'Fill out all fields with accurate and detailed information',
    category: 'local-seo',
    isCompleted: false,
    priority: 'critical',
    estimatedTime: 90
  },
  {
    id: 'local-2',
    title: 'Encourage Positive Reviews',
    description: 'Ask satisfied customers to leave reviews on GMB profile',
    category: 'local-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 30
  },
  {
    id: 'local-3',
    title: 'High-Quality Visuals',
    description: 'Use professional, high-resolution images and videos',
    category: 'local-seo',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'local-4',
    title: 'Consistent NAP',
    description: 'Ensure business name, address, and phone are consistent',
    category: 'local-seo',
    isCompleted: false,
    priority: 'critical',
    estimatedTime: 45
  },
  {
    id: 'local-5',
    title: 'Link Building',
    description: 'Generate backlinks from local and industry-relevant websites',
    category: 'local-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 120
  },
  {
    id: 'local-6',
    title: 'Local Business Directories',
    description: 'List business in local online directories and review sites',
    category: 'local-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 90
  },
  {
    id: 'local-7',
    title: 'Social Media Engagement',
    description: 'Regularly update and engage with audience on social media',
    category: 'local-seo',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'local-8',
    title: 'Local Citations',
    description: 'Ensure business information is cited accurately across internet',
    category: 'local-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 120
  },
  {
    id: 'local-9',
    title: 'Online Reviews Management',
    description: 'Address negative reviews professionally and respond to feedback',
    category: 'local-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'local-10',
    title: 'Google Posts',
    description: 'Consistently post updates, offers, and events through GMB',
    category: 'local-seo',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'local-11',
    title: 'Accurate Service Area',
    description: 'Set clear and accurate service area on GMB profile',
    category: 'local-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 30
  },
  {
    id: 'local-12',
    title: 'Geo-Targeted Content',
    description: 'Create content that speaks to local audience needs',
    category: 'local-seo',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'local-13',
    title: 'Hyperlocal Keywords',
    description: 'Use keywords specific to service area in website content',
    category: 'local-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'local-14',
    title: 'Location-Specific Landing Pages',
    description: 'Create dedicated pages for different service areas',
    category: 'local-seo',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 90
  },
  {
    id: 'local-15',
    title: 'Local Partnerships',
    description: 'Collaborate with local businesses for cross-promotion',
    category: 'local-seo',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 120
  },
  {
    id: 'local-16',
    title: 'Local Events Participation',
    description: 'Attend and engage in local events, fairs, and activities',
    category: 'local-seo',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 180
  },
  {
    id: 'local-17',
    title: 'Geotagged Social Media',
    description: 'Use location tags in social media posts',
    category: 'local-seo',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 15
  },
  {
    id: 'local-18',
    title: 'Local Networking',
    description: 'Attend local networking events and connect with professionals',
    category: 'local-seo',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 120
  },
  {
    id: 'local-19',
    title: 'Localized Social Media Ads',
    description: 'Run ads targeting local users on social media',
    category: 'local-seo',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'local-20',
    title: 'Optimize for "Near Me" Searches',
    description: 'Optimize content for "near me" search queries',
    category: 'local-seo',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },

  // Social Media
  {
    id: 'social-1',
    title: 'Hyper-Targeted Content',
    description: 'Create content that addresses local audience concerns',
    category: 'social-media',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'social-2',
    title: 'Local Keyword Research',
    description: 'Research and use local keywords relevant to business',
    category: 'social-media',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'social-3',
    title: 'Location-Specific Hashtags',
    description: 'Use local hashtags in social media posts',
    category: 'social-media',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 15
  },
  {
    id: 'social-4',
    title: 'Industry-Specific Local Insights',
    description: 'Share local insights related to industry',
    category: 'social-media',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'social-5',
    title: 'Geo-Targeted Blog Posts',
    description: 'Write blog posts targeting specific neighborhoods',
    category: 'social-media',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 90
  },
  {
    id: 'social-6',
    title: 'Local Influencer Collaborations',
    description: 'Partner with local influencers for endorsements',
    category: 'social-media',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 120
  },
  {
    id: 'social-7',
    title: 'Localized Customer Stories',
    description: 'Share testimonials and case studies from local customers',
    category: 'social-media',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'social-8',
    title: 'Address Local Pain Points',
    description: 'Craft content that solves common local challenges',
    category: 'social-media',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'social-9',
    title: 'Participate in Local Forums',
    description: 'Engage in online local forums to establish authority',
    category: 'social-media',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 60
  },
  {
    id: 'social-10',
    title: 'Local Event Calendars',
    description: 'List business on local event calendars',
    category: 'social-media',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 30
  },

  // Advanced Optimization
  {
    id: 'advanced-1',
    title: 'GMB Messaging Automation',
    description: 'Set up automated responses during off-hours',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'advanced-2',
    title: 'Virtual Tours and 360° Images',
    description: 'Offer virtual tours of business space',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 120
  },
  {
    id: 'advanced-3',
    title: 'Local Community Involvement',
    description: 'Participate in local charities and initiatives',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 180
  },
  {
    id: 'advanced-4',
    title: 'Geotagged Social Media Posts',
    description: 'Encourage geotagging of posts related to business',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 15
  },
  {
    id: 'advanced-5',
    title: 'Geotargeted Ads',
    description: 'Use geotargeting in online advertising campaigns',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'advanced-6',
    title: 'Voice Search-Optimized Content',
    description: 'Create content that answers voice search queries',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'advanced-7',
    title: 'Regular Keyword Analysis',
    description: 'Continuously research and adjust target keywords',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'advanced-8',
    title: 'Business Attributes Consistency',
    description: 'Ensure attributes align across platforms',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 30
  },
  {
    id: 'advanced-9',
    title: 'Prominent Call-to-Action (CTA)',
    description: 'Include clear CTAs like "Call Now" or "Visit Us"',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'advanced-10',
    title: 'Employee Profiles',
    description: 'Showcase key staff members on GMB profile',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 45
  },
  {
    id: 'advanced-11',
    title: 'Curate User-Generated Content',
    description: 'Feature customer-generated content',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'advanced-12',
    title: 'Popular Times',
    description: 'Provide accurate popular times data',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 30
  },
  {
    id: 'advanced-13',
    title: 'Local Reviews on Third-Party Sites',
    description: 'Encourage reviews on platforms like Yelp and TripAdvisor',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'advanced-14',
    title: 'Local Listings Cleanup',
    description: 'Regularly audit and update business information',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },
  {
    id: 'advanced-15',
    title: 'Social Media Integration',
    description: 'Link to social media profiles from GMB listing',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 15
  },
  {
    id: 'advanced-16',
    title: 'Special Attributes',
    description: 'Highlight unique offerings like free Wi-Fi or vegan options',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 30
  },
  {
    id: 'advanced-17',
    title: 'Posts Frequency',
    description: 'Maintain consistent posting schedule on GMB profile',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'advanced-18',
    title: 'Local Events Participation',
    description: 'Participate in local events and sponsorships',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 180
  },
  {
    id: 'advanced-19',
    title: 'Voice Search Optimization',
    description: 'Optimize content for voice search queries',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'advanced-20',
    title: 'Local Schema Markup',
    description: 'Add local schema markup to website code',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 60
  },
  {
    id: 'advanced-21',
    title: 'Business Messaging Responsiveness',
    description: 'Respond promptly to messages through GMB',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 15
  },
  {
    id: 'advanced-22',
    title: 'Monitor Competitor Listings',
    description: 'Keep an eye on competitors GMB profiles',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'advanced-23',
    title: 'Google My Business Website',
    description: 'Create a simple website using GMB built-in tool',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 60
  },
  {
    id: 'advanced-24',
    title: 'Language and Accessibility',
    description: 'Offer content in local languages and ensure accessibility',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 90
  },
  {
    id: 'advanced-25',
    title: 'Consistent Branding',
    description: 'Use consistent logos and color schemes across platforms',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'advanced-26',
    title: 'Menu and Products',
    description: 'Showcase menu or products if applicable',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'advanced-27',
    title: 'Business Attributes Update',
    description: 'Regularly review and update business attributes',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'advanced-28',
    title: 'Health and Safety Measures',
    description: 'Communicate health and safety protocols',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 30
  },
  {
    id: 'advanced-29',
    title: 'Google Q&A Monitoring',
    description: 'Regularly check and respond to user-generated questions',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'advanced-30',
    title: 'Update Posts for Seasonal Offers',
    description: 'Tailor posts to seasonal promotions',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 30
  },
  {
    id: 'advanced-31',
    title: 'Encourage User-Generated Content',
    description: 'Prompt customers to share their experiences',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'advanced-32',
    title: 'Local Partnerships',
    description: 'Collaborate with local influencers or businesses',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 120
  },
  {
    id: 'advanced-33',
    title: 'Negative Review Handling',
    description: 'Address negative reviews professionally',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'advanced-34',
    title: 'Google Maps Reviews Embedding',
    description: 'Showcase Google Maps reviews on website',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'advanced-35',
    title: 'Use Relevant Keywords',
    description: 'Include relevant keywords in content',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 45
  },
  {
    id: 'advanced-36',
    title: 'Seasonal Decor and Imagery',
    description: 'Update images to reflect seasons and events',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 30
  },
  {
    id: 'advanced-37',
    title: 'Check Website Analytics',
    description: 'Monitor website traffic and user behavior',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'high',
    estimatedTime: 30
  },
  {
    id: 'advanced-38',
    title: 'Google Ads Location Extensions',
    description: 'Utilize location extensions in Google Ads',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 45
  },
  {
    id: 'advanced-39',
    title: 'Review Policy',
    description: 'Have a clear policy for handling guideline-violating reviews',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'medium',
    estimatedTime: 30
  },
  {
    id: 'advanced-40',
    title: 'Staff Bios and Images',
    description: 'Introduce key staff members with bios and images',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 60
  },
  {
    id: 'advanced-41',
    title: 'Offline Promotion of GMB Listing',
    description: 'Promote GMB profile in-store and in marketing materials',
    category: 'advanced-optimization',
    isCompleted: false,
    priority: 'low',
    estimatedTime: 30
  }
];

// Populate categories with their respective items
checklistCategories.forEach(category => {
  category.items = checklistItems.filter(item => item.category === category.id);
}); 