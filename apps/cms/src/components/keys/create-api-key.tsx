"use client";

import { Button } from "@astra/ui/components/button";
import { Checkbox } from "@astra/ui/components/checkbox";
import { Input } from "@astra/ui/components/input";
import { Label } from "@astra/ui/components/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@astra/ui/components/popover";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@astra/ui/components/sheet";
import { toast } from "@astra/ui/components/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, KeyIcon, PlusIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AsyncButton } from "@/components/ui/async-button";
import { Calendar } from "@/components/ui/calendar";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { QUERY_KEYS } from "@/lib/queries/keys";
import {
	type ApiKeyFormValues,
	SCOPE_PRESETS,
	apiKeyScopes,
	apiKeySchema,
} from "@/lib/validations/api-key";
import type { ApiKeyWithPlainKey } from "@/types/api-key";
import { RevealKeyDialog } from "./reveal-key-dialog";

type CreateApiKeySheetProps = {
	children?: React.ReactNode;
};

function CreateApiKeySheet({ children }: CreateApiKeySheetProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [createdKey, setCreatedKey] = useState<ApiKeyWithPlainKey | null>(null);
	const workspaceId = useWorkspaceId();
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<ApiKeyFormValues>({
		resolver: zodResolver(apiKeySchema),
		defaultValues: {
			name: "",
			scopes: [],
			expiresAt: null,
		},
	});

	const watchedScopes = watch("scopes");
	const watchedExpiresAt = watch("expiresAt");
	const router = useRouter();

	const { mutate: createApiKey, isPending: isCreating } = useMutation({
		mutationFn: async (data: ApiKeyFormValues) => {
			const response = await fetch("/api/keys", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to create API key");
			}

			return response.json() as Promise<ApiKeyWithPlainKey>;
		},
		onSuccess: (data) => {
			toast.success("API key created successfully");
			setCreatedKey(data);
			reset();
			setIsOpen(false);
			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.API_KEYS(workspaceId),
				});
			}
			router.refresh();
		},
		onError: (error) => {
			console.error("Error creating API key:", error);
			toast.error("Failed to create API key");
		},
	});

	const handleScopeToggle = (scopeId: string, checked: boolean) => {
		const currentScopes = watchedScopes || [];
		if (checked) {
			setValue("scopes", [...currentScopes, scopeId]);
		} else {
			setValue(
				"scopes",
				currentScopes.filter((id) => id !== scopeId),
			);
		}
	};

	const handlePresetSelect = (preset: "READ_ONLY" | "FULL_ACCESS") => {
		setValue("scopes", [...SCOPE_PRESETS[preset]]);
	};

	const onSubmit = (data: ApiKeyFormValues) => {
		createApiKey(data);
	};

	// Group scopes by category
	const readScopes = apiKeyScopes.filter((s) => s.category === "read");
	const writeScopes = apiKeyScopes.filter((s) => s.category === "write");

	return (
		<>
			<Sheet onOpenChange={setIsOpen} open={isOpen}>
				<SheetTrigger asChild>
					{children || (
						<Button>
							<PlusIcon className="mr-2 size-4" />
							New API Key
						</Button>
					)}
				</SheetTrigger>
				<SheetContent className="overflow-y-auto">
					<SheetHeader className="p-6">
						<SheetTitle className="font-medium text-xl">New API Key</SheetTitle>
						<SheetDescription className="sr-only">
							Create a new API key to access your workspace via the API
						</SheetDescription>
					</SheetHeader>
					<form
						className="flex h-full flex-col justify-between"
						onSubmit={handleSubmit(onSubmit)}
					>
						<div className="mb-5 grid flex-1 auto-rows-min gap-6 px-6">
							<div className="grid gap-3">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									placeholder="My API Key"
									{...register("name")}
								/>
								{errors.name && (
									<p className="text-destructive text-sm">
										{errors.name.message}
									</p>
								)}
							</div>

							<div className="grid gap-3">
								<div className="mb-2 flex items-end justify-between">
									<Label>Permissions</Label>
									<div className="flex gap-2">
										<Button
											onClick={() => handlePresetSelect("READ_ONLY")}
											size="sm"
											type="button"
											variant="outline"
										>
											Read Only
										</Button>
										<Button
											onClick={() => handlePresetSelect("FULL_ACCESS")}
											size="sm"
											type="button"
											variant="outline"
										>
											Full Access
										</Button>
									</div>
								</div>
								<div className="grid gap-3">
									<div className="space-y-2">
										<Label className="text-muted-foreground text-xs">
											Read Permissions
										</Label>
										{readScopes.map((scope) => (
											<div className="flex items-center space-x-3" key={scope.id}>
												<Checkbox
													checked={watchedScopes?.includes(scope.id) || false}
													id={scope.id}
													onCheckedChange={(checked) =>
														handleScopeToggle(scope.id, checked as boolean)
													}
												/>
												<div className="flex-1">
													<Label
														className="cursor-pointer font-medium text-sm"
														htmlFor={scope.id}
													>
														{scope.label}
													</Label>
													<p className="text-muted-foreground text-xs">
														{scope.description}
													</p>
												</div>
											</div>
										))}
									</div>

									<div className="space-y-2">
										<Label className="text-muted-foreground text-xs">
											Write Permissions
										</Label>
										{writeScopes.map((scope) => (
											<div className="flex items-center space-x-3" key={scope.id}>
												<Checkbox
													checked={watchedScopes?.includes(scope.id) || false}
													id={scope.id}
													onCheckedChange={(checked) =>
														handleScopeToggle(scope.id, checked as boolean)
													}
												/>
												<div className="flex-1">
													<Label
														className="cursor-pointer font-medium text-sm"
														htmlFor={scope.id}
													>
														{scope.label}
													</Label>
													<p className="text-muted-foreground text-xs">
														{scope.description}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
								{errors.scopes && (
									<p className="text-destructive text-sm">
										{errors.scopes.message}
									</p>
								)}
							</div>

							<div className="grid gap-3">
								<Label htmlFor="expiresAt">Expiration (Optional)</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											className="justify-start text-left font-normal"
											id="expiresAt"
											type="button"
											variant="outline"
										>
											<CalendarIcon className="mr-2 size-4" />
											{watchedExpiresAt
												? format(watchedExpiresAt, "PPP")
												: "Never expires"}
										</Button>
									</PopoverTrigger>
									<PopoverContent align="start" className="w-auto p-0">
										<Calendar
											initialFocus
											mode="single"
											onSelect={(date) => setValue("expiresAt", date || null)}
											selected={watchedExpiresAt || undefined}
										/>
										{watchedExpiresAt && (
											<div className="border-t p-3">
												<Button
													className="w-full"
													onClick={() => setValue("expiresAt", null)}
													size="sm"
													type="button"
													variant="outline"
												>
													Clear expiration
												</Button>
											</div>
										)}
									</PopoverContent>
								</Popover>
								<p className="text-muted-foreground text-xs">
									Set an expiration date for this API key, or leave it blank for
									no expiration.
								</p>
							</div>
						</div>

						<SheetFooter className="p-6">
							<AsyncButton
								className="w-full"
								isLoading={isCreating}
								type="submit"
							>
								<KeyIcon className="mr-2 size-4" />
								Create API Key
							</AsyncButton>
						</SheetFooter>
					</form>
				</SheetContent>
			</Sheet>

			{/* Show the generated key once */}
			{createdKey && (
				<RevealKeyDialog
					apiKey={createdKey}
					onClose={() => setCreatedKey(null)}
					open={!!createdKey}
				/>
			)}
		</>
	);
}

export default CreateApiKeySheet;
