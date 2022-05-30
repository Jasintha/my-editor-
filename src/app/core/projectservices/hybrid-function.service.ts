import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import {IHybridfunction} from '@shared/models/model/hybridfunction.model';

type EntityResponseType = HttpResponse<IHybridfunction>;
type EntityArrayResponseType = HttpResponse<IHybridfunction[]>;

@Injectable({ providedIn: 'root' })
export class HybridfunctionService {
  public resourceUrl =  '/api/editor/proj/hybridfunctions';
  public hybridfunctionstatusChangeCheckResourceUrl =  '/api/editor/proj/hybridfunctions/statuschange/check';
  public hybridfunctionDisablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/hybridfunctions/statusdisabled/confirmed';
  public hybridfunctionEnablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/hybridfunctions/statusenabled/confirmed';

  constructor(protected http: HttpClient) {}

  create(hybridfunction: IHybridfunction, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IHybridfunction>(`${this.resourceUrl}/${uuid}`, hybridfunction, { observe: 'response' });
  }

  update(hybridfunction: IHybridfunction, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IHybridfunction>(`${this.resourceUrl}/${uuid}`, hybridfunction, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IHybridfunction>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IHybridfunction[]>(`${this.resourceUrl}/project/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IHybridfunction[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  checkStatusChange(id: string, uuid: string): Observable<HttpResponse<boolean>> {
    return this.http.get<boolean>(`${this.hybridfunctionstatusChangeCheckResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  saveCode(hybridfunction: IHybridfunction, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IHybridfunction>(`${this.resourceUrl}/${uuid}/code`, hybridfunction, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IHybridfunction>(`${this.hybridfunctionDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response'
    });
  }
  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IHybridfunction>(`${this.hybridfunctionEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response'
    });
  }
}
