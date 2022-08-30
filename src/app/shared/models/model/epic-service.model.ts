export interface IEpicService {
    uuid?: string;
    name?: string;
    referenceName?: string;
    serviceUUID?: string;
}

export class EpicService implements IEpicService {
    constructor(
        public uuid?: string,
        public name?: string,
        public referenceName?: string,
        public serviceUUID?: string,
    ) {}
}