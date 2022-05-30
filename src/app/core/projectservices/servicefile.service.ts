import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';

type EntityResponseType = HttpResponse<any>;
type EntityArrayResponseType = HttpResponse<any[]>;

@Injectable({ providedIn: 'root' })
export class ServiceFileService {
  public resourceUrl =  '/api/editor/proj/servicefiles';

  constructor(protected http: HttpClient) {}

  create(serviceFile: any, uuid: string): Observable<EntityResponseType> {
    return this.http.post<any>(`${this.resourceUrl}/${uuid}`, serviceFile, { observe: 'response' });
  }

  update(serviceFile: any, uuid: string): Observable<EntityResponseType> {
    return this.http.put<any>(`${this.resourceUrl}/${uuid}`, serviceFile, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<any[]>(`${this.resourceUrl}/project/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<any[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

}
