export class ConOperationBase {
    opName?:   string ;
    icon?:     string ;
    reqType?:  string ;
    reqModel?: string ;
    resType?:  string ;
    resModel?: string ;
    constructor(options: {
        opName?:   string ;
        icon?:     string ;
        reqType?:  string ;
        reqModel?: string ;
        resType?:  string ;
        resModel?: string ;

    } = {}) {
        this.opName = options.opName;
        this.icon = options.icon;
        this.reqType = options.reqType;
        this.reqModel = options.reqModel;
        this.resType = options.resType;
        this.resModel = options.resModel;
    }
}