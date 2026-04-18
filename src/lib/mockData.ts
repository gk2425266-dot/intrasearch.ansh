import { Document } from '../types';

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Q1 2026 Financial Strategy',
    description: 'Detailed breakdown of the financial goals and budget allocation for the first quarter of 2026.',
    content: 'Our strategy for Q1 2026 focuses on aggressive growth in the APAC region while maintaining a lean operational structure in EMEA...',
    url: 'https://drive.google.com/file/d/123',
    sourceType: 'drive',
    department: 'Finance',
    fileType: 'pdf',
    updatedAt: '2026-03-15T10:00:00Z',
    tags: ['finance', 'strategy', '2026']
  },
  {
    id: '2',
    title: 'Employee Benefits Handbook',
    description: 'Comprehensive guide to all employee benefits, including health insurance, 401k, and PTO policies.',
    content: 'Lattice Corp provides a robust benefits package designed to support our employees and their families...',
    url: 'https://wiki.lattice-corp.io/hr/benefits',
    sourceType: 'wiki',
    department: 'HR',
    fileType: 'link',
    updatedAt: '2026-01-10T09:00:00Z',
    tags: ['hr', 'benefits', 'handbook']
  },
  {
    id: '3',
    title: 'Project Phoenix Roadmap',
    description: 'The architectural roadmap for the Project Phoenix migration to microservices.',
    content: 'Phase 1: Database decoupling. Phase 2: Service extraction. Phase 3: Global load balancing...',
    url: 'https://github.com/lattice-corp/phoenix/docs',
    sourceType: 'github',
    department: 'Engineering',
    fileType: 'doc',
    updatedAt: '2026-04-01T14:30:00Z',
    tags: ['engineering', 'phoenix', 'roadmap']
  },
  {
    id: '4',
    title: 'Design System - V2.0 Guidelines',
    description: 'Updated design guidelines for the Lattice Design System, including new color palettes and typography.',
    content: 'Our new design language focuses on clarity, accessibility, and high contrast...',
    url: 'https://figma.com/file/lattice-ds',
    sourceType: 'wiki',
    department: 'Design',
    fileType: 'link',
    updatedAt: '2026-03-28T11:15:00Z',
    tags: ['design', 'ui', 'ux']
  },
  {
    id: '5',
    title: 'Security Incident Response Plan',
    description: 'Protocol for handling security breaches and data leaks within the organization.',
    content: 'In the event of a suspected breach, the first responder must immediately notify the CISO...',
    url: 'https://drive.google.com/file/d/456',
    sourceType: 'drive',
    department: 'Security',
    fileType: 'pdf',
    updatedAt: '2026-02-20T16:45:00Z',
    tags: ['security', 'incident', 'policy']
  },
  {
    id: '6',
    title: 'Internal API Documentation',
    description: 'Technical documentation for all internal REST and GraphQL APIs.',
    content: 'Base URL: https://api.internal.lattice-corp.io. Authentication: Bearer token...',
    url: 'https://wiki.lattice-corp.io/eng/api',
    sourceType: 'wiki',
    department: 'Engineering',
    fileType: 'link',
    updatedAt: '2026-04-10T08:20:00Z',
    tags: ['engineering', 'api', 'docs']
  },
  {
    id: '7',
    title: 'Marketing Campaign - Summer 2026',
    description: 'Strategy and assets for the upcoming Summer 2026 global marketing campaign.',
    content: 'Target audience: Tech-savvy professionals aged 25-45. Key message: Innovation simplified...',
    url: 'https://drive.google.com/file/d/789',
    sourceType: 'drive',
    department: 'Marketing',
    fileType: 'doc',
    updatedAt: '2026-04-05T13:00:00Z',
    tags: ['marketing', 'campaign', '2026']
  },
  {
    id: '8',
    title: 'Slack: #announcements - New Office Policy',
    description: 'Discussion regarding the new hybrid work policy and office reopening schedule.',
    content: 'Starting May 1st, we will transition to a 3-day office week for all local employees...',
    url: 'https://lattice-corp.slack.com/archives/C123',
    sourceType: 'slack',
    department: 'Operations',
    fileType: 'message',
    updatedAt: '2026-04-12T10:30:00Z',
    tags: ['operations', 'policy', 'office']
  }
];
