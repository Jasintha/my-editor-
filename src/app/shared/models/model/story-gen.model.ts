export interface IStoryGen {
    projectUuid?: string;
    storyUuid?: string;
}

export class StoryGen implements IStoryGen {
    constructor(
        public projectUuid?: string,
        public storyUuid?: string,
    ) {}
}
