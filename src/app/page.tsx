import { prisma } from '@/lib/prisma';
import { getDashboardMetrics } from '@/lib/metrics';
import { getTrendingIdeas } from '@/app/vote-actions';
import { getCurrentUser } from '@/app/auth-actions'; // Pass currentUser to client
import HomeClient from './HomeClient';
import { redirect } from 'next/navigation';

// Opt out of caching for demo purposes
export const dynamic = 'force-dynamic';

export default async function Home() {
  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      submitter: { select: { name: true, avatarUrl: true } }, // Include submitter info
      votes: true
    }
  });

  const [metrics, trending, currentUser] = await Promise.all([
    getDashboardMetrics(),
    getTrendingIdeas(),
    getCurrentUser()
  ]);

  if (!currentUser) {
    redirect('/login');
  }

  // Serialization
  const serialize = (items: any[]) => items.map(idea => ({
    ...idea,
    createdAt: idea.createdAt.toISOString(),
    updatedAt: idea.updatedAt ? idea.updatedAt.toISOString() : null, // Handle potential null in legacy
    businessValueScore: idea.businessValueScore || 0,
    voteCount: idea.votes?.length || 0,
    hasVoted: currentUser ? idea.votes.some((v: any) => v.userId === currentUser.id) : false,
    submitterName: idea.submitter?.name || 'Anonymous'
  }));

  return (
    <HomeClient
      ideas={serialize(ideas)}
      metrics={metrics}
      trending={serialize(trending)}
      currentUser={currentUser}
    />
  );
}
