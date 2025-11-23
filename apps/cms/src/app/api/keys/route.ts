import { db } from "@astra/db";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { apiKeySchema } from "@/lib/validations/api-key";
import { generateApiKey, hashApiKey } from "@/lib/crypto/api-key";

export async function GET() {
	const sessionData = await getServerSession();

	if (!sessionData || !sessionData.session.activeOrganizationId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const apiKeys = await db.apiKey.findMany({
		where: {
			workspaceId: sessionData.session.activeOrganizationId,
		},
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			name: true,
			keyPrefix: true,
			scopes: true,
			enabled: true,
			lastUsedAt: true,
			expiresAt: true,
			createdAt: true,
			updatedAt: true,
			createdBy: true,
			workspaceId: true,
		},
	});

	return NextResponse.json(apiKeys, { status: 200 });
}

export async function POST(req: Request) {
	const sessionData = await getServerSession();

	if (!sessionData || !sessionData.session.activeOrganizationId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const json = await req.json();
		const body = apiKeySchema.parse(json);

		// Generate the API key
		const { key: plainKey, keyPrefix } = generateApiKey();

		// Hash the key before storing
		const hashedKey = await hashApiKey(plainKey);

		// Create the API key in the database
		const apiKey = await db.apiKey.create({
			data: {
				name: body.name,
				key: hashedKey,
				keyPrefix,
				scopes: body.scopes,
				expiresAt: body.expiresAt || null,
				workspaceId: sessionData.session.activeOrganizationId,
				createdBy: sessionData.user.id,
			},
		});

		// Return the API key with the plain key (this is the ONLY time it will be shown)
		return NextResponse.json(
			{
				...apiKey,
				plainKey, // Include the plain key in the response
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating API key:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to create API key" },
			{ status: 500 },
		);
	}
}
