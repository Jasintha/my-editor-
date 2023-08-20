import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import { defaultHttpOptions } from '../public-api';

type EntityResponseType = HttpResponse<any>;
type EntityArrayResponseType = HttpResponse<any[]>;

@Injectable({ providedIn: 'root' })
export class UIBService {
  public dashboardUrl =  '/api/uib/dashboard';
  public applicationUrl =  '/api/uib/apps';
  public uibCreateProjectUrl = '/api/editor/epics/req/';
  public uibCreateFlowUrl = '/api/editor/proj/subrules/';
  public uibViewSourceUrl = '/api/uib/';

  constructor(protected http: HttpClient) {}

  queryDashboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.dashboardUrl}`, defaultHttpOptions());
  }

  queryApps(): Observable<any[]> {
    return this.http.get<any[]>(`${this.applicationUrl}`, defaultHttpOptions());
  }

  queryViewSource( ruleId: string, configId: string, user: string, uuid: string):  Observable<any[]> {
    return this.http.get<any[]>(`${this.uibViewSourceUrl}/${ruleId}/${configId}/${user}/${uuid}`, defaultHttpOptions());
  }

  createUIBProject(newProj, uuid: string): Observable<EntityResponseType> {
    return this.http.post<any>(`${this.uibCreateProjectUrl}/${uuid}`, newProj,  { observe: 'response' });
  }

  createUIBFlowProject(newFlow, uuid: string): Observable<EntityResponseType> {
    return this.http.post<any>(`${this.uibCreateFlowUrl}/${uuid}`, newFlow,  { observe: 'response' });
  }
}
