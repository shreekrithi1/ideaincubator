import { prisma } from './prisma';
import { headers } from 'next/headers';

type AuditPayload = {
    entityType: string;
    entityId: string;
    actionType: string;
    actorId: string;
    actorEmail?: string;
    actorRole?: string;
    changes?: any;
}

export async function logAuditAction(payload: AuditPayload) {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = headersList.get('user-agent') || 'Unknown';

    try {
        const changesJson = payload.changes ? JSON.stringify(payload.changes) : null;

        await prisma.systemAuditLog.create({
            data: {
                entityType: payload.entityType,
                entityId: payload.entityId,
                actionType: payload.actionType,
                actorId: payload.actorId,
                actorEmail: payload.actorEmail,
                actorRole: payload.actorRole,
                changesPayload: changesJson,
                ipAddress: ip,
                userAgent: userAgent
            }
        });
        console.log(`🛡️ Audit Log Recorded: ${payload.actionType} on ${payload.entityType}/${payload.entityId}`);
    } catch (error) {
        console.error("Failed to write Audit Log:", error);
        // In strict envs, we might throw here to rollback the transaction
    }
}
