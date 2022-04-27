import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import {IProjecttemplate} from '@shared/models/model/projecttemplate.model';
import {createRequestOption} from '@shared/util/request-util';

type EntityResponseType = HttpResponse<IProjecttemplate>;
type EntityArrayResponseType = HttpResponse<IProjecttemplate[]>;

@Injectable({ providedIn: 'root' })
export class ProjecttemplateService {
  public resourceUrl = '/api/editor/projecttemplates';

  constructor(protected http: HttpClient) {}

  create(projecttemplate: IProjecttemplate): Observable<EntityResponseType> {
    return this.http.post<IProjecttemplate>(this.resourceUrl, projecttemplate, { observe: 'response' });
  }

  update(projecttemplate: IProjecttemplate): Observable<EntityResponseType> {
    return this.http.put<IProjecttemplate>(this.resourceUrl, projecttemplate, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IProjecttemplate>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProjecttemplate[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }
}
