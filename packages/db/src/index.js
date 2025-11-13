import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
const createClient = (url) => {
    const connectionString = url || process.env.DATABASE_URL;
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
};
let db;
if (process.env.NODE_ENV === "production") {
    db = createClient();
}
else {
    if (!global.prisma) {
        global.prisma = createClient();
    }
    db = global.prisma;
}
export { createClient, db };
export async function backfillEditorPreferencesForAllWorkspaces() {
    const prisma = db;
    const workspaces = await prisma.organization.findMany({
        select: { id: true },
    });
    for (const ws of workspaces) {
        await prisma.editorPreferences.upsert({
            where: { workspaceId: ws.id },
            create: {
                workspaceId: ws.id,
                ai: { create: { enabled: false } },
            },
            update: {
                ai: {
                    upsert: {
                        create: { enabled: false },
                        update: {},
                    },
                },
            },
        });
    }
}
//# sourceMappingURL=index.js.map