import { NextResponse } from "next/server";
import { getAICreditStats } from "@/lib/ai-credits";
import { getServerSession } from "@/lib/auth/session";

export async function GET() {
  const sessionData = await getServerSession();

  if (!sessionData?.session.activeOrganizationId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const stats = await getAICreditStats(
      sessionData.session.activeOrganizationId
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching AI credit stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI credit statistics" },
      { status: 500 }
    );
  }
}
