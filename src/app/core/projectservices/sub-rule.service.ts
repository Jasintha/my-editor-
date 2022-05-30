import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import { ISubrule } from '@shared/models/model/subrule.model';

type EntityResponseType = HttpResponse<ISubrule>;
type EntityArrayResponseType = HttpResponse<ISubrule[]>;

@Injectable({ providedIn: 'root' })
export class SubruleService {
  public resourceUrl =  '/api/editor/proj/subrules';
  public subrulestatusChangeCheckResourceUrl =  '/api/editor/proj/subrules/statuschange/check';
  public subruleDisablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/subrules/statusdisabled/confirmed';
  public subruleEnablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/subrules/statusenabled/confirmed';

  constructor(protected http: HttpClient) {}

  create(subrule: ISubrule, uuid: string): Observable<EntityResponseType> {
    return this.http.post<ISubrule>(`${this.resourceUrl}/${uuid}`, subrule, { observe: 'response' });
  }

  update(subrule: ISubrule, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ISubrule>(`${this.resourceUrl}/${uuid}`, subrule, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<ISubrule>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<ISubrule[]>(`${this.resourceUrl}/project/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubrule[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  checkStatusChange(id: string, uuid: string): Observable<HttpResponse<boolean>> {
    return this.http.get<boolean>(`${this.subrulestatusChangeCheckResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  saveCode(subrule: ISubrule, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ISubrule>(`${this.resourceUrl}/${uuid}/code`, subrule, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ISubrule>(`${this.subruleDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response'
    });
  }
  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ISubrule>(`${this.subruleEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response'
    });
  }
}
