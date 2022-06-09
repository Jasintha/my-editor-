import {TreeNode} from 'primeng/api';

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

export interface IStoryScreenRequest {
    storyUuid?: string;
    screenTemplate?: string;
    screenName?: string;
    screenActions?: any;
}

export class StoryScreenRequest implements IStoryScreenRequest {
    constructor(public storyUuid?: string, public screenTemplate?: string, public screenName?: string, public screenActions?: any) {}
}

export interface IStoryProcessRequest {
    storyUuid?: string;
    processName?: string;
    apiTemplate?: string;
    apiMethod?: string;
    returnRecord?: string;
    returnObject?: string;
}

export class StoryProcessRequest implements IStoryProcessRequest {
    constructor(public storyUuid?: string, public processName?: string, public apiTemplate?: string,
                public apiMethod?: string, public returnRecord?: string,
                public returnObject?: string) {}
}


export interface IStoryModelRequest {
    storyUuid?: string;
    createType?: string;
    modelName?: string;
    modeluuid?: string;
    isDto?: boolean;
    data?: TreeNode[];
}

export class StoryModelRequest implements IStoryModelRequest {
    constructor(public storyUuid?: string, public createType?: string, public modelName?: string,
                public modeluuid?: string, public isDto?: boolean,
                public data?: TreeNode[]) {}
}
