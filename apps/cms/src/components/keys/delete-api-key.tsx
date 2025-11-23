"use client";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@astra/ui/components/alert-dialog";
import { toast } from "@astra/ui/components/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AsyncButton } from "@/components/ui/async-button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { QUERY_KEYS } from "@/lib/queries/keys";

type DeleteApiKeyModalProps = {
	apiKeyId: string;
	apiKeyName: string;
	onDelete: () => void;
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
};

export function DeleteApiKeyModal({
	apiKeyId,
	apiKeyName,
	onDelete,
	isOpen,
	onOpenChange,
}: DeleteApiKeyModalProps) {
	const workspaceId = useWorkspaceId();
	const queryClient = useQueryClient();

	const { mutate: deleteApiKey, isPending } = useMutation({
		mutationFn: () =>
			fetch(`/api/keys/${apiKeyId}`, {
				method: "DELETE",
			}),
		onSuccess: () => {
			toast.success("API key deleted successfully");
			onDelete();
			onOpenChange(false);
			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.API_KEYS(workspaceId),
				});
			}
		},
		onError: () => {
			toast.error("Failed to delete API key");
		},
	});

	return (
		<AlertDialog onOpenChange={onOpenChange} open={isOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete API key?</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete <strong>"{apiKeyName}"</strong>?
						This action cannot be undone and any applications using this key
						will lose access.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="min-w-20" disabled={isPending}>
						Cancel
					</AlertDialogCancel>
					<AsyncButton
						className="min-w-20"
						disabled={isPending}
						onClick={(e) => {
							e.preventDefault();
							deleteApiKey();
						}}
						variant="destructive"
					>
						Delete key
					</AsyncButton>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
