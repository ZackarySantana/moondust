export namespace store {
    export class Project {
        ID: string;
        Name: string;
        Directory: string;
        Branch: string;
        // Go type: time.Time
        CreatedAt: any;
        // Go type: time.Time
        UpdatedAt: any;

        static createFrom(source: any = {}) {
            return new Project(source);
        }

        constructor(source: any = {}) {
            if ("string" === typeof source) source = JSON.parse(source);
            this.ID = source["ID"];
            this.Name = source["Name"];
            this.Directory = source["Directory"];
            this.Branch = source["Branch"];
            this.CreatedAt = source["CreatedAt"];
            this.UpdatedAt = source["UpdatedAt"];
        }
    }

    export class Thread {
        ID: string;
        ProjectID: string;
        Title: string;
        WorktreeDir: string;
        ChatProvider: string;
        ChatModel: string;
        // Go type: time.Time
        CreatedAt: any;
        // Go type: time.Time
        UpdatedAt: any;

        static createFrom(source: any = {}) {
            return new Thread(source);
        }

        constructor(source: any = {}) {
            if ("string" === typeof source) source = JSON.parse(source);
            this.ID = source["ID"];
            this.ProjectID = source["ProjectID"];
            this.Title = source["Title"];
            this.WorktreeDir = source["WorktreeDir"];
            this.ChatProvider = source["ChatProvider"];
            this.ChatModel = source["ChatModel"];
            this.CreatedAt = source["CreatedAt"];
            this.UpdatedAt = source["UpdatedAt"];
        }
    }
}
