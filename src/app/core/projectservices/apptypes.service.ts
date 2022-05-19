import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IApptypes } from '@shared/models/model/apptypes.model';
import { IGenerator } from '@shared/models/model/generator-chain.model';
import {createRequestOption} from '@shared/util/request-util';

type EntityResponseType = HttpResponse<IApptypes>;
type EntityArrayResponseType = HttpResponse<IApptypes[]>;
type GeneratorChainArrayResponseType = HttpResponse<IGenerator[]>;

@Injectable({ providedIn: 'root' })
export class ApptypesService {
  public resourceUrl = '/api/editor/apptypes';
  public resourceGeneratorDevUrl = '/api/editor/apptypes/project/gen/dev';
  public resourceGeneratorProdUrl = '/api/editor/apptypes/project/gen/prod';

  constructor(protected http: HttpClient) {}

  create(apptypes: IApptypes): Observable<EntityResponseType> {
    return this.http.post<IApptypes>(this.resourceUrl, apptypes, { observe: 'response' });
  }

  update(apptypes: IApptypes): Observable<EntityResponseType> {
    return this.http.put<IApptypes>(this.resourceUrl, apptypes, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IApptypes>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getDevChainByAppType(projectId: string): Observable<GeneratorChainArrayResponseType> {
    return this.http.get<IGenerator[]>(`${this.resourceGeneratorDevUrl}/${projectId}`, { observe: 'response' });
  }

  getPreviewChainByAppType(apptype: string): Observable<GeneratorChainArrayResponseType> {
    return this.http.get<IGenerator[]>(`${this.resourceUrl}/project/preview/gen/dev/${apptype}`, { observe: 'response' });
  }

  getProdChainByAppType(projectId: string): Observable<GeneratorChainArrayResponseType> {
    return this.http.get<IGenerator[]>(`${this.resourceGeneratorProdUrl}/${projectId}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IApptypes[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }
}
