'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Real function to create Jira ticket via REST API
async function createJiraTicket(idea: any, config: any) {
    const { url, projectKey, email, apiToken } = config;

    if (!url || !projectKey || !email || !apiToken) {
        throw new Error('JIRA configuration is incomplete');
    }

    // Create base64 encoded auth header
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

    // Prepare the JIRA issue payload
    const issueData = {
        fields: {
            project: {
                key: projectKey
            },
            summary: idea.title,
            description: {
                type: 'doc',
                version: 1,
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: idea.description || 'No description provided'
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: `\n\nSubmitted by: ${idea.submitter?.name || 'Unknown'}`
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: `Category: ${idea.category || 'N/A'}`
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: `Business Value Score: ${idea.businessValueScore || 'N/A'}`
                            }
                        ]
                    },
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: `T-Shirt Size: ${idea.tShirtSize || 'N/A'}`
                            }
                        ]
                    }
                ]
            },
            issuetype: {
                name: 'Story'
            },
            labels: ['innovation', 'idea-incubator', idea.category?.toLowerCase() || 'general']
        }
    };

    // Make the API call to JIRA
    const response = await fetch(`${url}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(issueData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('JIRA API Error:', errorText);
        throw new Error(`Failed to create JIRA ticket: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.key; // Returns the ticket key like "PROJ-123"
}

export async function saveJiraConfig(formData: FormData) {
    const url = formData.get('url') as string;
    const projectKey = formData.get('projectKey') as string;
    const email = formData.get('email') as string;
    const apiToken = formData.get('apiToken') as string;

    const config = { url, projectKey, email, apiToken };

    await prisma.integrationConfig.upsert({
        where: { key: 'JIRA_CONFIG' },
        update: { value: JSON.stringify(config) },
        create: { key: 'JIRA_CONFIG', value: JSON.stringify(config) }
    });

    revalidatePath('/admin');
}

export async function getJiraConfig() {
    const record = await prisma.integrationConfig.findUnique({
        where: { key: 'JIRA_CONFIG' }
    });
    return record ? JSON.parse(record.value) : null;
}

export async function createJiraStoryForIdea(ideaId: string) {
    // 1. Get Idea with submitter details
    const idea = await prisma.idea.findUnique({
        where: { id: ideaId },
        include: { submitter: true }
    });

    if (!idea) throw new Error("Idea not found");

    // 2. Get JIRA Config
    const config = await getJiraConfig();
    if (!config || !config.url || !config.projectKey || !config.email || !config.apiToken) {
        console.warn("JIRA config incomplete. Please configure JIRA in Admin settings.");
        // Create a mock ticket ID for demo purposes
        const mockTicketId = `DEMO-${Math.floor(Math.random() * 1000) + 1000}`;
        await prisma.idea.update({
            where: { id: ideaId },
            data: {
                jiraTicketId: mockTicketId,
                jiraStatus: 'To Do (Demo Mode)'
            }
        });
        return mockTicketId;
    }

    // 3. Create Real JIRA Ticket
    try {
        const ticketKey = await createJiraTicket(idea, config);

        // 4. Update Idea with Ticket Info
        await prisma.idea.update({
            where: { id: ideaId },
            data: {
                jiraTicketId: ticketKey,
                jiraStatus: 'To Do'
            }
        });

        console.log(`✅ Created JIRA story: ${ticketKey} for idea: ${idea.title}`);
        return ticketKey;
    } catch (e) {
        console.error("Failed to create JIRA ticket:", e);
        // Fallback to error ticket if JIRA creation fails
        const fallbackTicketId = `SYNC-FAILED-${Math.floor(Math.random() * 1000)}`;
        await prisma.idea.update({
            where: { id: ideaId },
            data: {
                jiraTicketId: fallbackTicketId,
                jiraStatus: 'Failed to sync - check JIRA config'
            }
        });
        // Re-throw to let caller handle it
        throw new Error(`JIRA sync failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
}
