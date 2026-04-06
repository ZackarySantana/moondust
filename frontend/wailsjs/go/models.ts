export namespace store {
	
	export class Project {
	    name: string;
	    directory: string;
	    remote_url?: string;
	    meta?: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.directory = source["directory"];
	        this.remote_url = source["remote_url"];
	        this.meta = source["meta"];
	    }
	}

}

