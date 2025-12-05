"use client";

import type {
	AddTagUIToolInvocation,
	AddCategoryUIToolInvocation,
	CreatePostUIToolInvocation,
	SearchUIToolInvocation,
} from "@/lib/ai/tools";

interface ToolViewProps<T> {
	invocation: T;
	respondToConfirmationRequest?: (params: {
		approvalId: string;
		approved: boolean;
	}) => void;
}

export function AddTagView({
	invocation,
	respondToConfirmationRequest,
}: ToolViewProps<AddTagUIToolInvocation>) {
	// Handle normal execution states
	switch (invocation.state) {
		case "input-available":
			return (
				<div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
					<div className="size-2 rounded-full bg-blue-500 animate-pulse" />
					<span className="text-blue-700 dark:text-blue-300">
						Creating tag "{invocation.input.name}"...
					</span>
				</div>
			);
		case "output-available":
			if ("error" in invocation.output) {
				return (
					<div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-lg">
						<span className="text-red-700 dark:text-red-300">
							❌ Error: {invocation.output.error}
						</span>
					</div>
				);
			}
			return (
				<div className="flex items-start gap-2 text-sm bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 rounded-lg">
					<span className="text-green-700 dark:text-green-300">
						✅ Tag "{invocation.output.tag.name}" created successfully
					</span>
				</div>
			);
		case "output-error":
			return (
				<div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-lg">
					<span className="text-red-700 dark:text-red-300">
						❌ Error: {invocation.errorText}
					</span>
				</div>
			);
	}
}

export function AddCategoryView({
	invocation,
	respondToConfirmationRequest,
}: ToolViewProps<AddCategoryUIToolInvocation>) {
	// Handle normal execution states
	switch (invocation.state) {
		case "input-available":
			return (
				<div className="flex items-center gap-2 text-sm bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-3 rounded-lg">
					<div className="size-2 rounded-full bg-purple-500 animate-pulse" />
					<span className="text-purple-700 dark:text-purple-300">
						Creating category "{invocation.input.name}"...
					</span>
				</div>
			);
		case "output-available":
			if ("error" in invocation.output) {
				return (
					<div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-lg">
						<span className="text-red-700 dark:text-red-300">
							❌ Error: {invocation.output.error}
						</span>
					</div>
				);
			}
			return (
				<div className="flex items-start gap-2 text-sm bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 rounded-lg">
					<span className="text-green-700 dark:text-green-300">
						✅ Category "{invocation.output.category.name}" created successfully
					</span>
				</div>
			);
		case "output-error":
			return (
				<div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-lg">
					<span className="text-red-700 dark:text-red-300">
						❌ Error: {invocation.errorText}
					</span>
				</div>
			);
	}
}

export function CreatePostView({
	invocation,
	respondToConfirmationRequest,
}: ToolViewProps<CreatePostUIToolInvocation>) {
	// Handle normal execution states
	switch (invocation.state) {
		case "input-available":
			return (
				<div className="flex items-center gap-2 text-sm bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-3 rounded-lg">
					<div className="size-2 rounded-full bg-indigo-500 animate-pulse" />
					<span className="text-indigo-700 dark:text-indigo-300">
						Creating post "{invocation.input.title}"...
					</span>
				</div>
			);
		case "output-available":
			if ("error" in invocation.output) {
				return (
					<div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-lg">
						<span className="text-red-700 dark:text-red-300">
							❌ Error: {invocation.output.error}
						</span>
					</div>
				);
			}
			return (
				<div className="flex flex-col gap-2 text-sm bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 rounded-lg">
					<span className="text-green-700 dark:text-green-300">
						✅ Post created successfully
					</span>
					<div className="text-xs text-green-600 dark:text-green-400 space-y-1 ml-6">
						<div>
							<strong>Title:</strong> {invocation.output.post.title}
						</div>
						<div>
							<strong>Slug:</strong> {invocation.output.post.slug}
						</div>
					</div>
				</div>
			);
		case "output-error":
			return (
				<div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-lg">
					<span className="text-red-700 dark:text-red-300">
						❌ Error: {invocation.errorText}
					</span>
				</div>
			);
	}
}

export function SearchView({ invocation }: { invocation: SearchUIToolInvocation }) {
	switch (invocation.state) {
		case "input-available":
			return (
				<div className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
					<div className="size-2 rounded-full bg-amber-500 animate-pulse" />
					<span className="text-amber-700 dark:text-amber-300">
						Searching for "{invocation.input.query}"...
					</span>
				</div>
			);
		case "output-available":
			if ("error" in invocation.output) {
				return (
					<div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-lg">
						<span className="text-red-700 dark:text-red-300">
							❌ Error: {invocation.output.error}
						</span>
					</div>
				);
			}

			const { results } = invocation.output;
			const totalResults =
				(results.posts?.length || 0) +
				(results.tags?.length || 0) +
				(results.categories?.length || 0);

			if (totalResults === 0) {
				return (
					<div className="flex items-start gap-2 text-sm bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800 p-3 rounded-lg">
						<span className="text-gray-700 dark:text-gray-300">
							No results found for "{invocation.input.query}"
						</span>
					</div>
				);
			}

			return (
				<div className="flex flex-col gap-2 text-sm bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 rounded-lg">
					<span className="text-green-700 dark:text-green-300">
						✅ Found {totalResults} result{totalResults !== 1 ? "s" : ""}
					</span>
					<div className="text-xs text-green-600 dark:text-green-400 space-y-2 ml-6">
						{results.posts && results.posts.length > 0 && (
							<div>
								<strong>Posts ({results.posts.length}):</strong>
								<ul className="list-disc list-inside ml-2">
									{results.posts.map((post: any) => (
										<li key={post.id}>{post.title}</li>
									))}
								</ul>
							</div>
						)}
						{results.tags && results.tags.length > 0 && (
							<div>
								<strong>Tags ({results.tags.length}):</strong>
								<ul className="list-disc list-inside ml-2">
									{results.tags.map((tag: any) => (
										<li key={tag.id}>{tag.name}</li>
									))}
								</ul>
							</div>
						)}
						{results.categories && results.categories.length > 0 && (
							<div>
								<strong>Categories ({results.categories.length}):</strong>
								<ul className="list-disc list-inside ml-2">
									{results.categories.map((category: any) => (
										<li key={category.id}>{category.name}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>
			);
		case "output-error":
			return (
				<div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-lg">
					<span className="text-red-700 dark:text-red-300">
						❌ Error: {invocation.errorText}
					</span>
				</div>
			);
	}
}
