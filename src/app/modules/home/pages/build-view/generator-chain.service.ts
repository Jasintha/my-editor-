import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {IGenerator} from '@shared/models/model/generator-chain.model';

type EntityResponseType = HttpResponse<IGenerator>;

@Injectable({ providedIn: 'root' })
export class GeneratorChainService {
    public resourceUrl =  'upapi/uws/genchain/log';
    public statusUrl = 'upapi/genchain/chainstatus';
    public generatorSearchLogs = ' /api/logs/generators';
    constructor(protected http: HttpClient) {}

    genConsolelog(projId: string, debugRows?: any, uuid?: string): any {
        return this.http.get(`${this.resourceUrl}/${uuid}/${projId}`, { observe: 'response', params: { limit: debugRows } });
    }

    getGeneratorLogs(projId: string, payload?: any): any {
        return this.http.post(`${this.generatorSearchLogs}`, payload, { observe: 'response' });
    }

    getReloadGenStatus(projId: string, uuid: string): any {
        return this.http.get(`${this.statusUrl}/${uuid}/${projId}`, { observe: 'response' });
    }
}
