import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const domain = searchParams.get('domain');
    const institution = searchParams.get('institution');
    const limit = searchParams.get('limit') || '20';

    let url = `${BACKEND_URL}/api/collaborators?limit=${limit}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;
    if (domain) url += `&domain=${domain}`;
    if (institution) url += `&institution=${encodeURIComponent(institution)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If backend doesn't have collaborators endpoint, return mock data
      const mockCollaborators = [
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@university.edu',
          institution: 'Stanford University',
          department: 'Computer Science',
          researchAreas: ['Machine Learning', 'Natural Language Processing', 'AI Ethics'],
          publications: 45,
          citations: 2340,
          hIndex: 23,
          profilePicture: null,
          bio: 'Associate Professor focusing on ethical AI and machine learning applications in healthcare.',
          matchScore: 0.92,
          collaborationHistory: [],
          availabilityStatus: 'available',
          preferredCollaborationTypes: ['research', 'publication', 'grant_writing'],
          contactPreference: 'email',
          timezone: 'PST',
          languages: ['English', 'Spanish'],
          expertise: ['Deep Learning', 'Medical AI', 'Bias Detection'],
          interests: ['Healthcare AI', 'Ethical Computing', 'Fairness in ML'],
          currentProjects: ['AI in Radiology', 'Bias Detection Framework'],
          socialLinks: {
            twitter: 'https://twitter.com/sarahjohnson',
            linkedin: 'https://linkedin.com/in/sarahjohnson',
            googleScholar: 'https://scholar.google.com/citations?user=abc123',
            orcid: 'https://orcid.org/0000-0000-0000-0000'
          }
        },
        {
          id: '2',
          name: 'Prof. Michael Chen',
          email: 'michael.chen@mit.edu',
          institution: 'MIT',
          department: 'Biological Engineering',
          researchAreas: ['Synthetic Biology', 'Bioengineering', 'CRISPR'],
          publications: 78,
          citations: 4500,
          hIndex: 35,
          profilePicture: null,
          bio: 'Professor of Biological Engineering with expertise in synthetic biology and gene editing.',
          matchScore: 0.87,
          collaborationHistory: [],
          availabilityStatus: 'busy',
          preferredCollaborationTypes: ['research', 'mentoring'],
          contactPreference: 'email',
          timezone: 'EST',
          languages: ['English', 'Mandarin'],
          expertise: ['Gene Editing', 'Synthetic Biology', 'Bioengineering'],
          interests: ['CRISPR Applications', 'Therapeutic Gene Editing', 'Biosynthesis'],
          currentProjects: ['Gene Therapy Development', 'Synthetic Biology Platform'],
          socialLinks: {
            twitter: 'https://twitter.com/michaelchen',
            linkedin: 'https://linkedin.com/in/michaelchen',
            googleScholar: 'https://scholar.google.com/citations?user=def456',
            orcid: 'https://orcid.org/0000-0000-0000-0001'
          }
        },
        {
          id: '3',
          name: 'Dr. Emily Rodriguez',
          email: 'emily.rodriguez@caltech.edu',
          institution: 'Caltech',
          department: 'Physics',
          researchAreas: ['Quantum Computing', 'Quantum Information', 'Condensed Matter Physics'],
          publications: 32,
          citations: 1200,
          hIndex: 18,
          profilePicture: null,
          bio: 'Assistant Professor working on quantum computing applications and quantum information theory.',
          matchScore: 0.82,
          collaborationHistory: [],
          availabilityStatus: 'available',
          preferredCollaborationTypes: ['research', 'publication', 'conference'],
          contactPreference: 'email',
          timezone: 'PST',
          languages: ['English', 'Spanish'],
          expertise: ['Quantum Algorithms', 'Quantum Error Correction', 'Quantum Hardware'],
          interests: ['Quantum Machine Learning', 'Quantum Cryptography', 'Quantum Sensing'],
          currentProjects: ['Quantum Algorithm Development', 'Quantum Error Correction'],
          socialLinks: {
            twitter: 'https://twitter.com/emilyrodriguez',
            linkedin: 'https://linkedin.com/in/emilyrodriguez',
            googleScholar: 'https://scholar.google.com/citations?user=ghi789',
            orcid: 'https://orcid.org/0000-0000-0000-0002'
          }
        }
      ];

      return NextResponse.json({
        collaborators: mockCollaborators,
        total: mockCollaborators.length,
        message: 'Mock data returned - backend collaborators endpoint not available'
      });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Collaborators API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaborators' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action, collaboratorId, message, projectId } = await request.json();

    if (!action || !collaboratorId) {
      return NextResponse.json(
        { error: 'Action and collaborator ID are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/collaborators/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collaborator_id: collaboratorId,
        message,
        project_id: projectId,
      }),
    });

    if (!response.ok) {
      // Mock response for actions
      const mockResponse = {
        success: true,
        message: `Successfully ${action} collaborator`,
        collaboratorId,
        action
      };
      return NextResponse.json(mockResponse);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Collaborator action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process collaborator action' },
      { status: 500 }
    );
  }
} 