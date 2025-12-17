
interface JiraEpicPayload {
    title: string;
    description: string;
    submitterName: string;
    businessValue: number;
}

export async function createJiraEpic(payload: JiraEpicPayload) {
    const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
    const JIRA_USER = process.env.JIRA_USER;
    const JIRA_API_TOKEN = process.env.JIRA_TOKEN;
    const PROJECT_KEY = process.env.JIRA_PROJECT_KEY || "PROD";
    const EPIC_NAME_FIELD = process.env.JIRA_EPIC_NAME_FIELD || "customfield_10011"; // Configurable custom field ID

    if (!JIRA_DOMAIN || !JIRA_USER || !JIRA_API_TOKEN) {
        console.warn("⚠️ JIRA Credentials not set. Skipping actual JIRA sync.");
        return {
            key: `MOCK-${Math.floor(Math.random() * 1000)}`,
            id: "mock-id",
            self: "http://mock-jira"
        };
    }

    const url = `${JIRA_DOMAIN}/rest/api/3/issue`;
    const auth = Buffer.from(`${JIRA_USER}:${JIRA_API_TOKEN}`).toString('base64');

    const body = {
        fields: {
            project: {
                key: PROJECT_KEY
            },
            summary: `Incubator: ${payload.title}`,
            description: {
                type: "doc",
                version: 1,
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: `Submitter: ${payload.submitterName}\n`
                            },
                            {
                                type: "text",
                                text: `Business Value Score: ${payload.businessValue}\n\n`
                            },
                            {
                                type: "text",
                                text: payload.description
                            }
                        ]
                    }
                ]
            },
            issuetype: {
                name: "Epic"
            },
            // Dynamic key for the Epic Name custom field
            [EPIC_NAME_FIELD]: payload.title,

            priority: {
                name: payload.businessValue > 80 ? "High" : "Medium"
            },
            labels: ["Incubator", "Empower-Innovation"]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`JIRA API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log(`✅ JIRA Epic Created Successfully: ${data.key}`);
        return data; // { id: string, key: string, self: string }

    } catch (error) {
        console.error("❌ JIRA Creation Failed:", error);
        throw error;
    }
}
