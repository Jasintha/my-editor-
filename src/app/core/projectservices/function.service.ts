import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import {ILamdafunction} from '@shared/models/model/lamdafunction.model';

type EntityResponseType = HttpResponse<ILamdafunction>;
type EntityArrayResponseType = HttpResponse<ILamdafunction[]>;

@Injectable({ providedIn: 'root' })
export class LamdafunctionService {
  public resourceUrl =  '/api/editor/lambdafunctions';
  public lamdafunctionstatusChangeCheckResourceUrl =  '/api/editor/lambdafunctions/statuschange/check';
  public lamdafunctionDisablestatusChangeConfirmedResourceUrl =  '/api/editor/lambdafunctions/statusdisabled/confirmed';
  public lamdafunctionEnablestatusChangeConfirmedResourceUrl =  '/api/editor/lambdafunctions/statusenabled/confirmed';

  constructor(protected http: HttpClient) {}

  create(lamdafunction: ILamdafunction, uuid: string): Observable<EntityResponseType> {
    return this.http.post<ILamdafunction>(`${this.resourceUrl}/${uuid}`, lamdafunction, { observe: 'response' });
  }

  update(lamdafunction: ILamdafunction, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ILamdafunction>(`${this.resourceUrl}/${uuid}`, lamdafunction, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<ILamdafunction>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<ILamdafunction[]>(`${this.resourceUrl}/project/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ILamdafunction[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  checkStatusChange(id: string, uuid: string): Observable<HttpResponse<boolean>> {
    return this.http.get<boolean>(`${this.lamdafunctionstatusChangeCheckResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  saveCode(lamdafunction: ILamdafunction, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ILamdafunction>(`${this.resourceUrl}/code/${uuid}`, lamdafunction, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ILamdafunction>(`${this.lamdafunctionDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response'
    });
  }
  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ILamdafunction>(`${this.lamdafunctionEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response'
    });
  }
}
