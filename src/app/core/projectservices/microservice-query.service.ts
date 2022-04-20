import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import {IQuery} from '@shared/models/model/query.model';


type EntityResponseType = HttpResponse<IQuery>;
type EntityArrayResponseType = HttpResponse<IQuery[]>;
type StringArrayResponseType = HttpResponse<string[]>;

@Injectable({ providedIn: 'root' })
export class QueryService {
  public resourceUrl =  '/api/editor/querys';
  public upresourceUrl =  '/api/editor/uws/querys';
  public queryMappingsResourceUrl =  '/api/editor/querys/mappings';
  public projectresourceUrl =  '/api/editor/querys/project';
  public queryDisablestatusChangeConfirmedResourceUrl =  '/api/editor/querys/statuschange/disable';
  public queryEnablestatusChangeConfirmedResourceUrl =  '/api/editor/querys/statuschange/enable';

  constructor(protected http: HttpClient) {}

  create(query: IQuery, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IQuery>(`${this.upresourceUrl}/${uuid}`, query, { observe: 'response' });
  }

  update(query: IQuery, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IQuery>(`${this.resourceUrl}/${uuid}`, query, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IQuery>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IQuery[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IQuery[]>(`${this.projectresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IQuery>(`${this.queryDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }

  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IQuery>(`${this.queryEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }
}
