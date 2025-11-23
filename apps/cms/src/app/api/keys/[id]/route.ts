import { db } from "@astra/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { apiKeyToggleSchema } from "@/lib/validations/api-key";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session?.session.activeOrganizationId) {
    return NextResponse.json({ error: "No active workspace" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const json = await req.json();
    // For now, only allowing updates to the enabled state
    const body = apiKeyToggleSchema.parse(json);

    const apiKey = await db.apiKey.update({
      where: {
        id,
        workspaceId: session.session.activeOrganizationId,
      },
      data: { ...body },
    });

    return NextResponse.json(apiKey, { status: 200 });
  } catch (error) {
    console.error("Error updating API key:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session?.session.activeOrganizationId) {
    return NextResponse.json({ error: "No active workspace" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const existingApiKey = await db.apiKey.findFirst({
      where: {
        id,
        workspaceId: session.session.activeOrganizationId,
      },
    });

    if (!existingApiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const deletedApiKey = await db.apiKey.delete({
      where: { id },
    });

    return NextResponse.json(deletedApiKey.id, { status: 204 });
  } catch (error) {
    console.error("Error deleting API key:", error);

    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
