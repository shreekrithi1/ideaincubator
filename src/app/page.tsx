import { prisma } from '@/lib/prisma';
import { getDashboardMetrics } from '@/lib/metrics';
import { getTrendingIdeas } from '@/app/vote-actions';
import { getCurrentUser } from '@/app/auth-actions'; // Pass currentUser to client
import HomeClient from './HomeClient';
import { redirect } from 'next/navigation';

// Opt out of caching for demo purposes
export const dynamic = 'force-dynamic';

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Get current quarter and year
  const currentDate = new Date();
  const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
  const currentYear = currentDate.getFullYear();

  // Fetch current quarterly goals
  const currentGoals = await prisma.quarterlyGoal.findMany({
    where: {
      quarter: currentQuarter,
      year: currentYear,
      status: 'ACTIVE'
    },
    include: {
      contributions: {
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      submitter: { select: { name: true, avatarUrl: true } }, // Include submitter info
      votes: true
    }
  });

  // Filter user's active ideas
  const userActiveIdeas = ideas.filter(idea =>
    idea.submitterId === currentUser.id &&
    ['PENDING_MODERATION', 'EXECUTIVE_REVIEW', 'IN_DEV', 'SUBMITTED'].includes(idea.status)
  );

  const [metrics, trending] = await Promise.all([
    getDashboardMetrics(),
    getTrendingIdeas()
  ]);

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

  const serializeGoals = (goals: any[]) => goals.map(goal => ({
    ...goal,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    deadline: goal.deadline ? goal.deadline.toISOString() : null,
    completedAt: goal.completedAt ? goal.completedAt.toISOString() : null,
    contributions: goal.contributions.map((c: any) => ({
      ...c,
      createdAt: c.createdAt.toISOString()
    }))
  }));

  return (
    <HomeClient
      ideas={serialize(ideas)}
      metrics={metrics}
      trending={serialize(trending)}
      currentUser={currentUser}
      currentGoals={serializeGoals(currentGoals)}
      userActiveIdeas={serialize(userActiveIdeas)}
    />
  );
}
