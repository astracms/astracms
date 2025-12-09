import { db } from "@astra/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getLastVisitedWorkspace } from "@/utils/workspace/client";

export default async function SuccessPage() {
  const authInfo = await getServerSession();

  if (!authInfo) {
    redirect("/login");
  }

  const cookieStore = await cookies();

  let workspaceSlug: string | undefined;

  workspaceSlug = getLastVisitedWorkspace(cookieStore);

  if (!workspaceSlug && authInfo.session.activeOrganizationId) {
    const workspace = await db.organization.findUnique({
      where: { id: authInfo.session.activeOrganizationId as string },
      select: { slug: true },
    });
    workspaceSlug = workspace?.slug;
  }

  if (workspaceSlug) {
    redirect(`/${workspaceSlug}/settings/billing?success=true`);
  }

  redirect("/");
}
