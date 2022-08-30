export interface IEpicServiceBuildStatus {
    servicename?: string;
    referenceName?: string;
    apptype?: string;
    serviceuuid?: string;
    lastbuildstatus?: string;
    lastrungenerator?: string;
    lastrungenid?: string;
    gitrunid?: string;
    statusinfo?: string;

}

export class EpicServiceBuildStatus implements IEpicServiceBuildStatus {
    constructor(
        public servicename?: string,
        public referenceName?: string,
        public apptype?: string,
        public serviceuuid?: string,
        public lastbuildstatus?: string,
        public lastrungenerator?: string,
        public lastrungenid?: string,
        public gitrunid?: string,
        public statusinfo?: string,
    ) {}
}

export interface IEpicServiceGenReq {
    services?: string[];

}

export class EpicServiceGenReq implements IEpicServiceGenReq {
    constructor(
        public services?: string[],
    ) {}
}