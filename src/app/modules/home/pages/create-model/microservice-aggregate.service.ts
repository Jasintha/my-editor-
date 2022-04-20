import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import {IStatusChangeRequest} from '@shared/models/model/status-change-request.model';
import {IAggregate} from '@shared/models/model/aggregate.model';


type EntityResponseType = HttpResponse<IAggregate>;
type EntityArrayResponseType = HttpResponse<IAggregate[]>;
type StringArrayResponseType = HttpResponse<string[]>;
type StatusChangeRequestArrayResponseType = HttpResponse<IStatusChangeRequest[]>;

@Injectable({ providedIn: 'root' })
export class AggregateService {
  public resourceUrl =  '/api/editor/aggregates';
  public projectresourceUrl =  '/api/editor/aggregates/project';
  public designresourceUrl =  '/api/editor/aggregates/design';
  public aggregatestatusChangeResourceUrl =  '/api/editor/aggregates/statuschange';
  public aggregateDisablestatusChangeConfirmedResourceUrl =  '/api/editor/aggregates/statuschange/disable';
  public aggregateEnablestatusChangeConfirmedResourceUrl =  '/api/editor/aggregates/statuschange/enable';
  public domainModelFileUploadResourceUrl =  '/api/editor/aggregates/file-upload';
  public exportResoucreURL =  '/api/editor/aggregates/export';
  public aggregateModelKeysResourceUrl =  '/api/editor/aggregates/keys';
  public checkEntityNameAvailabilityURL =  '/api/editor/aggregates/names';
  constructor(protected http: HttpClient) {}

  create(aggregate: IAggregate, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IAggregate>(`${this.resourceUrl}/${uuid}`, aggregate, { observe: 'response' });
  }

  update(aggregate: IAggregate, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IAggregate>(`${this.resourceUrl}/${uuid}`, aggregate, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IAggregate>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAggregate[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  findByProjectUUId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IAggregate[]>(`${this.projectresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  saveModelDesign(aggregate: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.designresourceUrl}/${uuid}`, aggregate, { observe: 'response' });
  }

  // findDesignById(id: string, uuid: string): Observable<HttpResponse<TreeNode>> {
  //   return this.http.get<TreeNode>(`${this.designresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  // }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IAggregate>(`${this.aggregateDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }

  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IAggregate>(`${this.aggregateEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }
  uploadDomainModelsFile(data, uuid: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.domainModelFileUploadResourceUrl}/${uuid}`, data, { observe: 'response' });
  }

  getModelDownloader(id: string, uuid: string): any {
    return this.http.get(`${this.exportResoucreURL}/${uuid}/${id}`, { observe: 'response', responseType: 'arraybuffer' });
  }

  findAggregateModelMapKeys(req?: any, uuid?: string): Observable<StringArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<string[]>(`${this.aggregateModelKeysResourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  findNameAvailability(name: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.get(`${this.checkEntityNameAvailabilityURL}/${uuid}/${name}`, { observe: 'response' });
  }
}
