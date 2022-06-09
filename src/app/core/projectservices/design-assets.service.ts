import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import {IApi} from '@shared/models/model/microservice-api.model';
import {IStoryActorRequest, IStoryScreenRequest} from '@shared/models/model/design-assets.model';


type EntityResponseType = HttpResponse<IApi>;
type EntityArrayResponseType = HttpResponse<IApi[]>;

@Injectable({ providedIn: 'root' })
export class DesignAssets {
    public resourceUrl =  '/api/editor/stories/actors';
    public screenResourceUrl =  '/api/editor/stories/screen';
    public commandresourceUrl =  '/api/editor/proj/commands';
    public queryresourceUrl =  '/api/editor/proj/querys';
    public apisForProjectResourceUrl =  '/api/editor/proj/microservice-apis/project';
    public allForProjectResourceUrl =  '/api/editor/proj/microservice-apis/project/all';

    constructor(protected http: HttpClient) {}

    // create(api: IApi, uuid: string): Observable<EntityResponseType> {
    //     return this.http.post<IApi>(`${this.resourceUrl}/${uuid}`, api, { observe: 'response' });
    // }

    actorUpdate(storyReq: IStoryActorRequest, uuid: string): Observable<HttpResponse<IStoryActorRequest>> {
        return this.http.put<IStoryActorRequest>(`${this.resourceUrl}/${uuid}`, storyReq, { observe: 'response' });
    }

    screenUpdate(storyReq: IStoryScreenRequest, uuid: string): Observable<HttpResponse<IStoryScreenRequest>> {
        return this.http.put<IStoryScreenRequest>(`${this.screenResourceUrl}/${uuid}`, storyReq, { observe: 'response' });
    }

    find(id: string, uuid: string): Observable<EntityResponseType> {
        return this.http.get<IApi>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
    }

    findAPIsForProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
        return this.http.get<IApi[]>(`${this.apisForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
    }

    findAllForProjectId(id: string, uuid: string): Observable<HttpResponse<any[]>> {
        return this.http.get<any[]>(`${this.allForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
    }

    query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IApi[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
    }

    delete(id: string, uuid: string): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
    }

    deleteCommand(id: string, uuid: string): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.commandresourceUrl}/${uuid}/${id}`, { observe: 'response' });
    }

    deleteQuery(id: string, uuid: string): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.queryresourceUrl}/${uuid}/${id}`, { observe: 'response' });
    }
}
