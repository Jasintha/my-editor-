export interface IStoryActorRequest {
    storyUuid?: string;
    actors?: StoryActor[];
}

export class StoryActorRequest implements IStoryActorRequest {
    constructor(public storyUuid?: string, public actors?: StoryActor[]) {}
}

export interface IStoryActor {
    actorName?: string;
    actoruuid?: string;
    createType?: string;
    permissionLevel?: string;
}

export class StoryActor implements IStoryActor {
    constructor(public actorName?: string, public actoruuid?: string,public createType?: string,public permissionLevel?: string) {}
}
