export namespace store {
	
	export class OpenRouterToolCallRecord {
	    id?: string;
	    name: string;
	    arguments?: string;
	    output?: string;
	
	    static createFrom(source: any = {}) {
	        return new OpenRouterToolCallRecord(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.arguments = source["arguments"];
	        this.output = source["output"];
	    }
	}
	export class AssistantTurnSegment {
	    text?: string;
	    tool?: OpenRouterToolCallRecord;
	
	    static createFrom(source: any = {}) {
	        return new AssistantTurnSegment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.text = source["text"];
	        this.tool = this.convertValues(source["tool"], OpenRouterToolCallRecord);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ClaudeChatMessageMetadata {
	    input_tokens?: number;
	    output_tokens?: number;
	    cache_read_tokens?: number;
	    cache_write_tokens?: number;
	    request_id?: string;
	    tool_calls?: OpenRouterToolCallRecord[];
	    segments?: AssistantTurnSegment[];
	
	    static createFrom(source: any = {}) {
	        return new ClaudeChatMessageMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.input_tokens = source["input_tokens"];
	        this.output_tokens = source["output_tokens"];
	        this.cache_read_tokens = source["cache_read_tokens"];
	        this.cache_write_tokens = source["cache_write_tokens"];
	        this.request_id = source["request_id"];
	        this.tool_calls = this.convertValues(source["tool_calls"], OpenRouterToolCallRecord);
	        this.segments = this.convertValues(source["segments"], AssistantTurnSegment);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CursorChatMessageMetadata {
	    input_tokens?: number;
	    output_tokens?: number;
	    cache_read_tokens?: number;
	    cache_write_tokens?: number;
	    request_id?: string;
	    plan_auto_percent_delta?: number;
	    plan_api_percent_delta?: number;
	    tool_calls?: OpenRouterToolCallRecord[];
	    segments?: AssistantTurnSegment[];
	
	    static createFrom(source: any = {}) {
	        return new CursorChatMessageMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.input_tokens = source["input_tokens"];
	        this.output_tokens = source["output_tokens"];
	        this.cache_read_tokens = source["cache_read_tokens"];
	        this.cache_write_tokens = source["cache_write_tokens"];
	        this.request_id = source["request_id"];
	        this.plan_auto_percent_delta = source["plan_auto_percent_delta"];
	        this.plan_api_percent_delta = source["plan_api_percent_delta"];
	        this.tool_calls = this.convertValues(source["tool_calls"], OpenRouterToolCallRecord);
	        this.segments = this.convertValues(source["segments"], AssistantTurnSegment);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class OpenRouterChatMessageMetadata {
	    prompt_tokens?: number;
	    completion_tokens?: number;
	    total_tokens?: number;
	    cost_usd?: number;
	    reasoning?: string;
	    reasoning_duration_sec?: number;
	    segments?: AssistantTurnSegment[];
	
	    static createFrom(source: any = {}) {
	        return new OpenRouterChatMessageMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.prompt_tokens = source["prompt_tokens"];
	        this.completion_tokens = source["completion_tokens"];
	        this.total_tokens = source["total_tokens"];
	        this.cost_usd = source["cost_usd"];
	        this.reasoning = source["reasoning"];
	        this.reasoning_duration_sec = source["reasoning_duration_sec"];
	        this.segments = this.convertValues(source["segments"], AssistantTurnSegment);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ChatMessageMetadata {
	    openrouter?: OpenRouterChatMessageMetadata;
	    cursor?: CursorChatMessageMetadata;
	    claude?: ClaudeChatMessageMetadata;
	
	    static createFrom(source: any = {}) {
	        return new ChatMessageMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.openrouter = this.convertValues(source["openrouter"], OpenRouterChatMessageMetadata);
	        this.cursor = this.convertValues(source["cursor"], CursorChatMessageMetadata);
	        this.claude = this.convertValues(source["claude"], ClaudeChatMessageMetadata);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ChatMessage {
	    id: string;
	    thread_id: string;
	    role: string;
	    content: string;
	    // Go type: time
	    created_at: any;
	    chat_provider: string;
	    chat_model?: string;
	    metadata?: ChatMessageMetadata;
	    lane_id?: string;
	
	    static createFrom(source: any = {}) {
	        return new ChatMessage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.thread_id = source["thread_id"];
	        this.role = source["role"];
	        this.content = source["content"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.chat_provider = source["chat_provider"];
	        this.chat_model = source["chat_model"];
	        this.metadata = this.convertValues(source["metadata"], ChatMessageMetadata);
	        this.lane_id = source["lane_id"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class ClaudeAuthStatus {
	    logged_in: boolean;
	    auth_method?: string;
	    api_provider?: string;
	    email?: string;
	    org_id?: string;
	    org_name?: string;
	    subscription_type?: string;
	
	    static createFrom(source: any = {}) {
	        return new ClaudeAuthStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.logged_in = source["logged_in"];
	        this.auth_method = source["auth_method"];
	        this.api_provider = source["api_provider"];
	        this.email = source["email"];
	        this.org_id = source["org_id"];
	        this.org_name = source["org_name"];
	        this.subscription_type = source["subscription_type"];
	    }
	}
	export class ClaudeLocalUsage {
	    window_days: number;
	    files_scanned: number;
	    lines_matched: number;
	    total_tokens: number;
	    input_tokens: number;
	    output_tokens: number;
	    cache_read_tokens: number;
	    cache_write_tokens: number;
	    input_percent_used?: number;
	    output_percent_used?: number;
	    cache_percent_used?: number;
	    scan_error?: string;
	
	    static createFrom(source: any = {}) {
	        return new ClaudeLocalUsage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.window_days = source["window_days"];
	        this.files_scanned = source["files_scanned"];
	        this.lines_matched = source["lines_matched"];
	        this.total_tokens = source["total_tokens"];
	        this.input_tokens = source["input_tokens"];
	        this.output_tokens = source["output_tokens"];
	        this.cache_read_tokens = source["cache_read_tokens"];
	        this.cache_write_tokens = source["cache_write_tokens"];
	        this.input_percent_used = source["input_percent_used"];
	        this.output_percent_used = source["output_percent_used"];
	        this.cache_percent_used = source["cache_percent_used"];
	        this.scan_error = source["scan_error"];
	    }
	}
	export class ClaudeCLIInfo {
	    installed: boolean;
	    binary_path: string;
	    version: string;
	    auth?: ClaudeAuthStatus;
	    auth_error?: string;
	    probe_error?: string;
	    local_usage?: ClaudeLocalUsage;
	    local_usage_error?: string;
	
	    static createFrom(source: any = {}) {
	        return new ClaudeCLIInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.installed = source["installed"];
	        this.binary_path = source["binary_path"];
	        this.version = source["version"];
	        this.auth = this.convertValues(source["auth"], ClaudeAuthStatus);
	        this.auth_error = source["auth_error"];
	        this.probe_error = source["probe_error"];
	        this.local_usage = this.convertValues(source["local_usage"], ClaudeLocalUsage);
	        this.local_usage_error = source["local_usage_error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class CursorUsageSnapshot {
	    auto_percent_used?: number;
	    api_percent_used?: number;
	    total_percent_used?: number;
	    display_message?: string;
	    auto_usage_message?: string;
	    api_usage_message?: string;
	
	    static createFrom(source: any = {}) {
	        return new CursorUsageSnapshot(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.auto_percent_used = source["auto_percent_used"];
	        this.api_percent_used = source["api_percent_used"];
	        this.total_percent_used = source["total_percent_used"];
	        this.display_message = source["display_message"];
	        this.auto_usage_message = source["auto_usage_message"];
	        this.api_usage_message = source["api_usage_message"];
	    }
	}
	export class CursorCLIInfo {
	    installed: boolean;
	    binary_path: string;
	    version: string;
	    status_output: string;
	    about_output: string;
	    usage?: CursorUsageSnapshot;
	    usage_error?: string;
	    probe_error?: string;
	
	    static createFrom(source: any = {}) {
	        return new CursorCLIInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.installed = source["installed"];
	        this.binary_path = source["binary_path"];
	        this.version = source["version"];
	        this.status_output = source["status_output"];
	        this.about_output = source["about_output"];
	        this.usage = this.convertValues(source["usage"], CursorUsageSnapshot);
	        this.usage_error = source["usage_error"];
	        this.probe_error = source["probe_error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class FileDiff {
	    path: string;
	    language: string;
	    original: string;
	    modified: string;
	
	    static createFrom(source: any = {}) {
	        return new FileDiff(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.language = source["language"];
	        this.original = source["original"];
	        this.modified = source["modified"];
	    }
	}
	export class GitCommitSummary {
	    hash: string;
	    subject: string;
	    author: string;
	    when: string;
	    exact_date: string;
	
	    static createFrom(source: any = {}) {
	        return new GitCommitSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.hash = source["hash"];
	        this.subject = source["subject"];
	        this.author = source["author"];
	        this.when = source["when"];
	        this.exact_date = source["exact_date"];
	    }
	}
	export class GitConflictState {
	    in_merge: boolean;
	    in_rebase: boolean;
	    conflict_files: string[];
	
	    static createFrom(source: any = {}) {
	        return new GitConflictState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.in_merge = source["in_merge"];
	        this.in_rebase = source["in_rebase"];
	        this.conflict_files = source["conflict_files"];
	    }
	}
	export class GitFileChange {
	    path: string;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new GitFileChange(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.status = source["status"];
	    }
	}
	export class GitReview {
	    branch: string;
	    ahead: number;
	    behind: number;
	    remote_url: string;
	    staged: GitFileChange[];
	    unstaged: GitFileChange[];
	    untracked: GitFileChange[];
	    local_commits: GitCommitSummary[];
	    main_commits: GitCommitSummary[];
	    diff_stat: string;
	    patch_preview: string;
	    stash_count: number;
	    has_remote: boolean;
	
	    static createFrom(source: any = {}) {
	        return new GitReview(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.branch = source["branch"];
	        this.ahead = source["ahead"];
	        this.behind = source["behind"];
	        this.remote_url = source["remote_url"];
	        this.staged = this.convertValues(source["staged"], GitFileChange);
	        this.unstaged = this.convertValues(source["unstaged"], GitFileChange);
	        this.untracked = this.convertValues(source["untracked"], GitFileChange);
	        this.local_commits = this.convertValues(source["local_commits"], GitCommitSummary);
	        this.main_commits = this.convertValues(source["main_commits"], GitCommitSummary);
	        this.diff_stat = source["diff_stat"];
	        this.patch_preview = source["patch_preview"];
	        this.stash_count = source["stash_count"];
	        this.has_remote = source["has_remote"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class GitStatus {
	    branch: string;
	    entries: string[];
	
	    static createFrom(source: any = {}) {
	        return new GitStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.branch = source["branch"];
	        this.entries = source["entries"];
	    }
	}
	export class LogLine {
	    seq: number;
	    // Go type: time
	    time: any;
	    level: string;
	    message: string;
	    extra?: string;
	
	    static createFrom(source: any = {}) {
	        return new LogLine(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.seq = source["seq"];
	        this.time = this.convertValues(source["time"], null);
	        this.level = source["level"];
	        this.message = source["message"];
	        this.extra = source["extra"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NotificationChannelConfig {
	    push: boolean;
	    in_app: boolean;
	    slack: boolean;
	    email: boolean;
	    slack_webhook_url?: string;
	
	    static createFrom(source: any = {}) {
	        return new NotificationChannelConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.push = source["push"];
	        this.in_app = source["in_app"];
	        this.slack = source["slack"];
	        this.email = source["email"];
	        this.slack_webhook_url = source["slack_webhook_url"];
	    }
	}
	
	export class OpenRouterChatModel {
	    id: string;
	    name: string;
	    provider: string;
	    description: string;
	    description_full: string;
	    pricing_tier: string;
	    pricing_prompt: string;
	    pricing_completion: string;
	    pricing_summary: string;
	    vision: boolean;
	    reasoning: boolean;
	    long_context: boolean;
	    context_length: number;
	
	    static createFrom(source: any = {}) {
	        return new OpenRouterChatModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.provider = source["provider"];
	        this.description = source["description"];
	        this.description_full = source["description_full"];
	        this.pricing_tier = source["pricing_tier"];
	        this.pricing_prompt = source["pricing_prompt"];
	        this.pricing_completion = source["pricing_completion"];
	        this.pricing_summary = source["pricing_summary"];
	        this.vision = source["vision"];
	        this.reasoning = source["reasoning"];
	        this.long_context = source["long_context"];
	        this.context_length = source["context_length"];
	    }
	}
	export class OpenRouterModelUsage {
	    model_id: string;
	    // Go type: time
	    last_used_at: any;
	    use_count: number;
	    total_cost_usd: number;
	    average_cost_usd: number;
	    total_prompt_tokens: number;
	    total_completion_tokens: number;
	
	    static createFrom(source: any = {}) {
	        return new OpenRouterModelUsage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.model_id = source["model_id"];
	        this.last_used_at = this.convertValues(source["last_used_at"], null);
	        this.use_count = source["use_count"];
	        this.total_cost_usd = source["total_cost_usd"];
	        this.average_cost_usd = source["average_cost_usd"];
	        this.total_prompt_tokens = source["total_prompt_tokens"];
	        this.total_completion_tokens = source["total_completion_tokens"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class OpenRouterUsageMetrics {
	    total_assistant_messages: number;
	    distinct_models: number;
	    total_cost_usd: number;
	    average_cost_per_assistant_turn_usd: number;
	    total_prompt_tokens: number;
	    total_completion_tokens: number;
	    recently_used: OpenRouterModelUsage[];
	    most_used: OpenRouterModelUsage[];
	    most_expensive: OpenRouterModelUsage[];
	
	    static createFrom(source: any = {}) {
	        return new OpenRouterUsageMetrics(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total_assistant_messages = source["total_assistant_messages"];
	        this.distinct_models = source["distinct_models"];
	        this.total_cost_usd = source["total_cost_usd"];
	        this.average_cost_per_assistant_turn_usd = source["average_cost_per_assistant_turn_usd"];
	        this.total_prompt_tokens = source["total_prompt_tokens"];
	        this.total_completion_tokens = source["total_completion_tokens"];
	        this.recently_used = this.convertValues(source["recently_used"], OpenRouterModelUsage);
	        this.most_used = this.convertValues(source["most_used"], OpenRouterModelUsage);
	        this.most_expensive = this.convertValues(source["most_expensive"], OpenRouterModelUsage);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Project {
	    id: string;
	    name: string;
	    directory: string;
	    remote_url: string;
	    default_branch?: string;
	    auto_fetch?: string;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.directory = source["directory"];
	        this.remote_url = source["remote_url"];
	        this.default_branch = source["default_branch"];
	        this.auto_fetch = source["auto_fetch"];
	    }
	}
	export class Settings {
	    ssh_auth_sock: string;
	    default_worktree: string;
	    notifications: Record<string, NotificationChannelConfig>;
	    keyboard_shortcuts: Record<string, string>;
	    openrouter_api_key?: string;
	    openrouter_clear?: boolean;
	    has_openrouter_api_key?: boolean;
	    agent_tools_enabled?: Record<string, boolean>;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ssh_auth_sock = source["ssh_auth_sock"];
	        this.default_worktree = source["default_worktree"];
	        this.notifications = this.convertValues(source["notifications"], NotificationChannelConfig, true);
	        this.keyboard_shortcuts = source["keyboard_shortcuts"];
	        this.openrouter_api_key = source["openrouter_api_key"];
	        this.openrouter_clear = source["openrouter_clear"];
	        this.has_openrouter_api_key = source["has_openrouter_api_key"];
	        this.agent_tools_enabled = source["agent_tools_enabled"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Thread {
	    id: string;
	    project_id: string;
	    title: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	    worktree_dir: string;
	    chat_provider: string;
	    chat_model?: string;
	
	    static createFrom(source: any = {}) {
	        return new Thread(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.project_id = source["project_id"];
	        this.title = source["title"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.worktree_dir = source["worktree_dir"];
	        this.chat_provider = source["chat_provider"];
	        this.chat_model = source["chat_model"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

