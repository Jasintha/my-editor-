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
  public uibCreateProjectUrl = '/api/editor/epics/req';
  public uibCreateFlowUrl = '/api/editor/proj/subrules';
  public uibCreateLambdaUrl = '/api/editor/proj/lambdafunctions';
  public uibCreateModelUrl = '/api/editor/proj/aggregates';
  public uibViewSourceUrl = '/api/uib';
  public singleProUrl = 'api/editor/projects'

  constructor(protected http: HttpClient) {}

  queryDashboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.dashboardUrl}`, defaultHttpOptions());
  }

  queryApps(): Observable<any[]> {
    return this.http.get<any[]>(`${this.applicationUrl}`, defaultHttpOptions());
  }

  queryViewSource( ruleId: string, configId: string, user: string, uuid: string):  Observable<string> {
    return this.http.get(`${this.uibViewSourceUrl}/${ruleId}/${configId}/${user}/${uuid}`,{responseType: 'text'});
  }

  findProjectComponents(projId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/editor/projects/components/${projId}`, defaultHttpOptions());
  }

  createUIBProject(newProj, uuid: string): Observable<EntityResponseType> {
    return this.http.post<any>(`${this.uibCreateProjectUrl}/${uuid}`, newProj,  { observe: 'response' });
  }

  updateUIBProject(newProj): Observable<EntityResponseType> {
    return this.http.put<any>(`${this.singleProUrl}`, newProj,  { observe: 'response' });
  }
  
  deleteUIBProject(uuid: string): Observable<EntityResponseType> {
    return this.http.delete<any>(`${this.singleProUrl}/${uuid}`,  { observe: 'response' });
  }

  createUIBFlowProject(newFlow, uuid: string): Observable<EntityResponseType> {
    return this.http.post<any>(`${this.uibCreateFlowUrl}/${uuid}`, newFlow,  { observe: 'response' });
  }

  createUIBLambdaProject(newFlow, uuid: string): Observable<EntityResponseType> {
    return this.http.post<any>(`${this.uibCreateLambdaUrl}/${uuid}`, newFlow,  { observe: 'response' });
  }

  createUIBModelProject(newFlow, uuid: string): Observable<EntityResponseType> {
    return this.http.post<any>(`${this.uibCreateModelUrl}/${uuid}`, newFlow,  { observe: 'response' });
  }

  updateViewSource(newFlow, ruleId: string, configId: string, user: string, uuid: string):  Observable<string> {
    return this.http.post(`${this.uibViewSourceUrl}/${ruleId}/${configId}/${user}/${uuid}`,newFlow, {responseType: 'text'});
  }
}
