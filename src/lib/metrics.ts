import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface DashboardMetrics {
    totalIdeas: number;
    ideasByStatus: number[]; // [DRAFT, MODERATED, EXEC_REVIEW, IN_DEV, G2M]
    pipelineVelocity: number; // Avg days from Draft to IN_DEV
    approvalRate: number; // % of ideas approved vs rejected
    topContributors: { initial: string; name: string; count: number; avatarUrl: string | null }[];
    highValueOpportunities: number; // Ideas with Score > 80

    // Engagement Metrics (Firebase/Google Analytics style)
    totalVotes: number;
    activeUsers7Days: number;
    totalComments: number;

    // Funnel Data
    funnel: {
        submitted: number;
        moderated: number;
        approved: number;
        launched: number;
    };

    // Trend Data (Last 7 days)
    dailySubmissions: { date: string; count: number }[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const ideas = await prisma.idea.findMany({
        include: {
            submitter: true,
            votes: true,
            // reviews: true // Assuming reviews are related
        }
    });

    const reviews = await prisma.review.findMany();
    const votes = await prisma.vote.findMany();
    const users = await prisma.user.findMany(); // For active user calc

    const statusMap = { 'DRAFT': 0, 'SUBMITTED': 0, 'MODERATED': 1, 'EXECUTIVE_REVIEW': 2, 'IN_DEV': 3, 'G2M_READY': 4, 'LAUNCHED': 4 };
    const histogram = [0, 0, 0, 0, 0];

    let totalVelocityDays = 0;
    let velocityCount = 0;
    let highValueCount = 0;
    const contributorMap: Record<string, number> = {};

    // Filter for Active Users (Last 7 Days) - Simulated if no login timestamp
    // Ideally we would query SystemAuditLog for distinct actorIds in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Funnel Counts
    let submittedCount = 0;
    let moderatedCount = 0;
    let approvedCount = 0; // Executive Approved
    let launchedCount = 0;

    // Trend Data
    const dailyTrend: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyTrend[d.toISOString().split('T')[0]] = 0;
    }

    ideas.forEach(idea => {
        // Histogram
        const idx = statusMap[idea.status as keyof typeof statusMap] || 0;
        histogram[idx]++;

        // High Value
        if ((idea.businessValueScore || 0) > 80) highValueCount++;

        // Contributors
        const userId = idea.submitterId;
        contributorMap[userId] = (contributorMap[userId] || 0) + 1;

        // Velocity
        if (idea.status === 'IN_DEV' || idea.status === 'G2M_READY') {
            const days = (new Date().getTime() - new Date(idea.createdAt).getTime()) / (1000 * 3600 * 24);
            totalVelocityDays += days;
            velocityCount++;
        }

        // Funnel
        if (['SUBMITTED', 'MODERATED', 'EXECUTIVE_REVIEW', 'IN_DEV', 'G2M_READY', 'LAUNCHED'].includes(idea.status)) submittedCount++;
        if (['MODERATED', 'EXECUTIVE_REVIEW', 'IN_DEV', 'G2M_READY', 'LAUNCHED'].includes(idea.status)) moderatedCount++;
        if (['IN_DEV', 'G2M_READY', 'LAUNCHED'].includes(idea.status)) approvedCount++;
        if (idea.status === 'LAUNCHED') launchedCount++;

        // Daily Trend
        const dateKey = idea.createdAt.toISOString().split('T')[0];
        if (dailyTrend[dateKey] !== undefined) {
            dailyTrend[dateKey]++;
        }
    });

    // Approval Rate calculation
    const approvals = reviews.filter(r => r.decision === 'APPROVE').length;
    const rejections = reviews.filter(r => r.decision === 'REJECT').length;
    const totalDecisions = approvals + rejections;
    const approvalRate = totalDecisions > 0 ? Math.round((approvals / totalDecisions) * 100) : 0;

    // Top Contributors with User Details
    const topContributorIds = Object.entries(contributorMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const topContributors = topContributorIds.map(([id, count]) => {
        const user = users.find(u => u.id === id);
        return {
            initial: user?.name.charAt(0).toUpperCase() || '?',
            name: user?.name || 'Unknown',
            avatarUrl: user?.avatarUrl || null,
            count
        };
    });

    const activeUsers7Days = new Set([...votes.map(v => v.userId), ...ideas.map(i => i.submitterId)]).size; // Simple unique active users

    return {
        totalIdeas: ideas.length,
        ideasByStatus: histogram,
        pipelineVelocity: velocityCount > 0 ? Math.round(totalVelocityDays / velocityCount) : 0,
        approvalRate,
        topContributors,
        highValueOpportunities: highValueCount,
        totalVotes: votes.length,
        activeUsers7Days, // Use mock/calc
        totalComments: reviews.length, // approximation
        funnel: {
            submitted: submittedCount,
            moderated: moderatedCount,
            approved: approvedCount,
            launched: launchedCount
        },
        dailySubmissions: Object.entries(dailyTrend)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))
    };
}
