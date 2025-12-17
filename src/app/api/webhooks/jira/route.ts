
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMarketingCopy } from '@/lib/ai';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        // 1. Safe Event Extraction
        // JIRA webhooks structure: { webhookEvent: 'jira:issue_updated', issue: { fields: { status: { name: 'Done' } } } }
        const eventType = payload.webhookEvent;
        const issue = payload.issue;

        if (!issue || !issue.fields) {
            return NextResponse.json({ message: "Invalid Payload" }, { status: 400 });
        }

        const status = issue.fields.status?.name;
        const issueType = issue.fields.issuetype?.name;
        const jiraKey = issue.key;

        // 2. Validate Trigger (Done + Epic)
        // Note: Adjust 'Done' to match your exact JIRA workflow status name
        if (status !== 'Done' || issueType !== 'Epic') {
            return NextResponse.json({ message: "Ignored: Not a completed Epic" }, { status: 200 });
        }

        console.log(`🚀 JIRA Webhook: Detected Completion for ${jiraKey}`);

        // 3. Find Internal Idea
        // We assume the internal Idea has the JIRA Key stored
        const idea = await prisma.idea.findFirst({
            where: { jiraTicketId: jiraKey }
        });

        if (!idea) {
            console.warn(`Internal Idea not found for JIRA Key: ${jiraKey}`);
            return NextResponse.json({ message: "Idea not matched" }, { status: 404 });
        }

        // 4. Generate G2M Assets
        const techSummary = issue.fields.summary;
        const techDesc = issue.fields.description || ""; // JIRA description can be complex object or string depending on version. assuming string for simple parsing or raw dump.

        // Handling ADF (Atlassian Document Format) if needed, but for now passing raw object string
        const descString = typeof techDesc === 'string' ? techDesc : JSON.stringify(techDesc);

        const marketingKit = await generateMarketingCopy(techSummary, descString);

        if (marketingKit) {
            // 5. Update Status & Store Artifacts
            // Schema update would be ideal to store the 'Launch Kit', but we'll use a Review comment or Status for now
            await prisma.idea.update({
                where: { id: idea.id },
                data: {
                    status: 'G2M_READY',
                    jiraStatus: 'Done'
                }
            });

            // Log the Kit generation
            await logAuditAction({
                entityType: 'IDEA',
                entityId: idea.id,
                actionType: 'GENERATE_G2M',
                actorId: 'SYSTEM_AI',
                changes: {
                    jira_key: jiraKey,
                    marketing_kit: marketingKit
                }
            });

            // Notify Team (Simulated)
            console.log("📢 MARKETING KIT READY:", marketingKit);
        }

        return NextResponse.json({ status: "success", kit: marketingKit });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ status: "error", message: "Internal Server Error" }, { status: 500 });
    }
}
