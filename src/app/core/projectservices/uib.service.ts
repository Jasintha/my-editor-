import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import { defaultHttpOptions } from '../public-api';

type EntityResponseType = HttpResponse<any>;
type EntityArrayResponseType = HttpResponse<any[]>;

@Injectable({ providedIn: 'root' })
export class UIBService {
  public dashboardUrl =  '/api/editor/uib/dashboard';
  public applicationUrl =  '/api/editor/uib/application';
  public uibProjectsUrl = '/api/editor/projects/uib/components'
  public uibServiceUrl = '/api/editor/uib/servicefiles'

  constructor(protected http: HttpClient) {}

  queryDashboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.dashboardUrl}`, defaultHttpOptions());
  }

  queryApps(): Observable<any[]> {
    return this.http.get<any[]>(`${this.applicationUrl}`, defaultHttpOptions());
  }

  queryAllUIComponents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.uibProjectsUrl}`, defaultHttpOptions());
  }

  queryProjectPurposes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.applicationUrl}`, defaultHttpOptions());
  }

  createUIBProject(serviceFile: any, uuid: string): Observable<EntityResponseType> {
    return this.http.post<any>(`${this.uibServiceUrl}/${uuid}`, serviceFile, { observe: 'response' });
  }
}
