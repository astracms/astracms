import { db } from "@astracms/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { getLastVisitedWorkspace } from "@/utils/workspace/client";
import { env } from "@/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkoutId = searchParams.get("checkout_id");

  const authInfo = await getServerSession();

  if (!authInfo) {
    return NextResponse.redirect(
      new URL("/login", env.NEXT_PUBLIC_APP_URL)
    );
  }

  const cookieStore = await cookies();

  console.log("Checkout ID", checkoutId);

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
    return NextResponse.redirect(
      new URL(
        `/${workspaceSlug}/settings/billing?success=true`,
        env.NEXT_PUBLIC_APP_URL
      )
    );
  }

  return NextResponse.redirect(new URL("/", env.NEXT_PUBLIC_APP_URL));
}
