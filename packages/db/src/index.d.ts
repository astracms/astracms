import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
declare const createClient: (url?: string) => PrismaClient<{
    adapter: PrismaNeon;
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
declare global {
    var prisma: PrismaClient | undefined;
}
declare let db: PrismaClient;
export { createClient, db };
export declare function backfillEditorPreferencesForAllWorkspaces(): Promise<void>;
//# sourceMappingURL=index.d.ts.map