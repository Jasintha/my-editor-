import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {IServiceAccount} from '@shared/models/model/service-account.model';
import {createRequestOption} from '@shared/util/request-util';



type EntityResponseType = HttpResponse<IServiceAccount>;
type EntityArrayResponseType = HttpResponse<IServiceAccount[]>;

@Injectable({ providedIn: 'root' })
export class ServiceAccountService {
  public resourceUrl = '/api/editor/service-accounts';
  public gitresourceUrl = '/api/editor/service-accounts/github';

  constructor(protected http: HttpClient) {}

  create(serviceAccount: IServiceAccount): Observable<EntityResponseType> {
    return this.http.post<IServiceAccount>(this.resourceUrl, serviceAccount, { observe: 'response' });
  }

  update(serviceAccount: IServiceAccount): Observable<EntityResponseType> {
    return this.http.put<IServiceAccount>(this.resourceUrl, serviceAccount, { observe: 'response' });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IServiceAccount>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IServiceAccount[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  githubAccQuery(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IServiceAccount[]>(this.gitresourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }
}
