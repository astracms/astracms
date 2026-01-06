"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@astra/ui/components/alert-dialog";
import { Badge } from "@astra/ui/components/badge";
import { Button } from "@astra/ui/components/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@astra/ui/components/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@astra/ui/components/dialog";
import { Input } from "@astra/ui/components/input";
import { Label } from "@astra/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@astra/ui/components/select";
import { Skeleton } from "@astra/ui/components/skeleton";
import { Textarea } from "@astra/ui/components/textarea";
import {
    ClockIcon,
    CrownIcon,
    FlowArrow,
    HandIcon,
    PauseIcon,
    PencilSimpleIcon,
    PlayIcon,
    PlusIcon,
    RssIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Workflow {
    id: string;
    name: string;
    description: string | null;
    status: "draft" | "active" | "paused" | "archived";
    triggerType: "manual" | "scheduled" | "webhook" | "rss_feed";
    isActive: boolean;
    lastRunAt: string | null;
    nextRunAt: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        nodes: number;
        runs: number;
    };
}

const triggerIcons = {
    manual: HandIcon,
    scheduled: ClockIcon,
    webhook: FlowArrow,
    rss_feed: RssIcon,
};

const triggerLabels = {
    manual: "Manual",
    scheduled: "Scheduled",
    webhook: "Webhook",
    rss_feed: "RSS Feed",
};

const statusColors = {
    draft: "secondary",
    active: "default",
    paused: "outline",
    archived: "destructive",
} as const;

export function PageClient() {
    const params = useParams<{ workspace: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newWorkflow, setNewWorkflow] = useState({
        name: "",
        description: "",
        triggerType: "manual" as const,
        customPrompt: "",
    });

    const {
        data: workflowsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["workflows"],
        queryFn: async () => {
            const res = await fetch("/api/workflows");
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch workflows");
            }
            return res.json() as Promise<{ workflows: Workflow[] }>;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof newWorkflow) => {
            const res = await fetch("/api/workflows", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create workflow");
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
            setIsCreateOpen(false);
            setNewWorkflow({
                name: "",
                description: "",
                triggerType: "manual",
                customPrompt: "",
            });
            toast.success("Workflow created successfully");
            router.push(`/${params.workspace}/workflows/${data.workflow.id}`);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete workflow");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
            toast.success("Workflow deleted");
        },
        onError: () => {
            toast.error("Failed to delete workflow");
        },
    });

    const executeMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/workflows/${id}/execute`, {
                method: "POST",
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to execute workflow");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
            toast.success("Workflow execution started");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Handle upgrade required
    if (error?.message?.includes("Pro plan")) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CrownIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-semibold text-2xl">AI Workflows - Pro Feature</h2>
                <p className="max-w-md text-muted-foreground">
                    AI Workflows let you automate blog creation with custom triggers and
                    AI-powered actions. Upgrade to Pro to unlock this feature.
                </p>
                <Button asChild>
                    <Link href={`/${params.workspace}/settings/billing`}>
                        <CrownIcon className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl space-y-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold text-3xl tracking-tight">AI Workflows</h1>
                    <p className="text-muted-foreground">
                        Automate blog creation with AI-powered workflows
                    </p>
                </div>
                <Dialog onOpenChange={setIsCreateOpen} open={isCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            New Workflow
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Workflow</DialogTitle>
                            <DialogDescription>
                                Set up an AI workflow to automate your content creation.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    onChange={(e) =>
                                        setNewWorkflow((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Weekly Blog Generator"
                                    value={newWorkflow.name}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Textarea
                                    id="description"
                                    onChange={(e) =>
                                        setNewWorkflow((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Generates a blog post every week about..."
                                    value={newWorkflow.description}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="trigger">Trigger Type</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setNewWorkflow((prev) => ({
                                            ...prev,
                                            triggerType: value as typeof newWorkflow.triggerType,
                                        }))
                                    }
                                    value={newWorkflow.triggerType}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manual">
                                            Manual - Run on demand
                                        </SelectItem>
                                        <SelectItem value="scheduled">
                                            Scheduled - Run on a schedule
                                        </SelectItem>
                                        <SelectItem value="rss_feed">
                                            RSS Feed - Trigger on new feed items
                                        </SelectItem>
                                        <SelectItem value="webhook">
                                            Webhook - Trigger via URL
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="customPrompt">Custom Prompt (optional)</Label>
                                <Textarea
                                    id="customPrompt"
                                    onChange={(e) =>
                                        setNewWorkflow((prev) => ({
                                            ...prev,
                                            customPrompt: e.target.value,
                                        }))
                                    }
                                    placeholder="Write blog posts focusing on beginner tutorials for React developers..."
                                    rows={3}
                                    value={newWorkflow.customPrompt}
                                />
                                <p className="text-muted-foreground text-xs">
                                    This prompt will guide the AI when generating content in this
                                    workflow.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsCreateOpen(false)} variant="outline">
                                Cancel
                            </Button>
                            <Button
                                disabled={!newWorkflow.name.trim() || createMutation.isPending}
                                onClick={() => createMutation.mutate(newWorkflow)}
                            >
                                {createMutation.isPending ? "Creating..." : "Create Workflow"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Workflow List */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={`skeleton-${i}`}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : workflowsData?.workflows.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <PlusIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mt-4 font-semibold text-lg">No workflows yet</h3>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Create your first AI workflow to automate content creation.
                        </p>
                        <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create Workflow
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workflowsData?.workflows.map((workflow) => {
                        const TriggerIcon = triggerIcons[workflow.triggerType];
                        return (
                            <Card className="group relative" key={workflow.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <TriggerIcon className="h-5 w-5 text-muted-foreground" />
                                            <CardTitle className="text-lg">{workflow.name}</CardTitle>
                                        </div>
                                        <Badge variant={statusColors[workflow.status]}>
                                            {workflow.status}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {workflow.description || "No description"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                                        <span>{triggerLabels[workflow.triggerType]}</span>
                                        <span>
                                            {workflow.lastRunAt
                                                ? `Last run ${formatDistanceToNow(new Date(workflow.lastRunAt), { addSuffix: true })}`
                                                : "Never run"}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
                                        <span>{workflow._count.nodes} nodes</span>
                                        <span>•</span>
                                        <span>{workflow._count.runs} runs</span>
                                    </div>
                                    <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                            asChild
                                            className="flex-1"
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Link
                                                href={`/${params.workspace}/workflows/${workflow.id}`}
                                            >
                                                <PencilSimpleIcon className="mr-1 h-3.5 w-3.5" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            disabled={executeMutation.isPending}
                                            onClick={() => executeMutation.mutate(workflow.id)}
                                            size="sm"
                                            variant="outline"
                                        >
                                            <PlayIcon className="h-3.5 w-3.5" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="outline">
                                                    <TrashIcon className="h-3.5 w-3.5" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete "{workflow.name}"?
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteMutation.mutate(workflow.id)}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default PageClient;
