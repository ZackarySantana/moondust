export namespace store {
	
	export class OpenRouterChatMessageMetadata {
	    prompt_tokens?: number;
	    completion_tokens?: number;
	    total_tokens?: number;
	    cost_usd?: number;
	
	    static createFrom(source: any = {}) {
	        return new OpenRouterChatMessageMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.prompt_tokens = source["prompt_tokens"];
	        this.completion_tokens = source["completion_tokens"];
	        this.total_tokens = source["total_tokens"];
	        this.cost_usd = source["cost_usd"];
	    }
	}
	export class ChatMessageMetadata {
	    openrouter?: OpenRouterChatMessageMetadata;
	
	    static createFrom(source: any = {}) {
	        return new ChatMessageMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.openrouter = this.convertValues(source["openrouter"], OpenRouterChatMessageMetadata);
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
	    chat_provider?: string;
	    chat_model?: string;
	    metadata?: ChatMessageMetadata;
	
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
	export class Project {
	    id: string;
	    name: string;
	    directory: string;
	    remote_url: string;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.directory = source["directory"];
	        this.remote_url = source["remote_url"];
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
	    chat_provider?: string;
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

