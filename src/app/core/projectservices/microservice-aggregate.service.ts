import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TreeNode } from 'primeng/api';
import { IAggregate } from '@shared/models/model/aggregate.model';
import { IProject } from '@shared/models/model/project.model';
import { IStatusChangeRequest } from '@shared/models/model/status-change-request.model';
import {createRequestOption} from '@shared/util/request-util';
import {IValueObject} from '@home/pages/aggregate/microservice-add-model-dialog.component';

type EntityResponseType = HttpResponse<IAggregate>;
type EntityArrayResponseType = HttpResponse<IAggregate[]>;
type StringArrayResponseType = HttpResponse<string[]>;
type StatusChangeRequestArrayResponseType = HttpResponse<IStatusChangeRequest[]>;

@Injectable({ providedIn: 'root' })
export class AggregateService {
  public resourceUrl =  '/api/editor/proj/aggregates';
  public projectresourceUrl =  '/api/editor/proj/aggregates/project';
  public designresourceUrl =  '/api/editor/proj/aggregates/design';
  public aggregatestatusChangeResourceUrl =  '/api/editor/proj/aggregates/statuschange';
  public aggregateDisablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/aggregates/statuschange/disable';
  public aggregateEnablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/aggregates/statuschange/enable';
  public domainModelFileUploadResourceUrl =  '/api/editor/proj/aggregates/file-upload';
  public exportResoucreURL =  '/api/editor/proj/aggregates/export';
  public aggregateModelKeysResourceUrl =  '/api/editor/proj/aggregates/keys';
  public checkEntityNameAvailabilityURL =  '/api/editor/proj/aggregates/names';
  public retrieveAllValueObj = '/api/editor/proj/valueobjects/all';
  public createValueObject = '/api/editor/proj/valueobjects'
  constructor(protected http: HttpClient) {}

  create(aggregate: IAggregate, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IAggregate>(`${this.resourceUrl}/${uuid}`, aggregate, { observe: 'response' });
  }

  findAllMicroserviceProjects(): Observable<EntityArrayResponseType> {
    return this.http.get<IProject[]>(`${this.resourceUrl}/microservices`, { observe: 'response' });
  }


  update(aggregate: IAggregate, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IAggregate>(`${this.resourceUrl}/${uuid}`, aggregate, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IAggregate>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }


  findByProjectUUId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IAggregate[]>(`${this.projectresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  saveModelDesign(aggregate: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.designresourceUrl}/${uuid}`, aggregate, { observe: 'response' });
  }

  findDesignById(id: string, uuid: string): Observable<HttpResponse<TreeNode>> {
    return this.http.get<TreeNode>(`${this.designresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

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

  findAllRetrieveValueObj(uuid: string): Observable<HttpResponse<IValueObject[]>> {
    return this.http.get<IValueObject[]>(`${this.retrieveAllValueObj}/${uuid}`, { observe: 'response' });
  }

  createValueObj(aggregate: IValueObject, uuid: string): Observable<HttpResponse<IValueObject>> {
    return this.http.post<IValueObject>(`${this.createValueObject}/${uuid}`, aggregate, { observe: 'response' });
  }
}
