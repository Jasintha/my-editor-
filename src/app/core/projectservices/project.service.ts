import { Injectable } from '@angular/core';
import {HttpClient, HttpEvent, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';

import {IProject, Project} from '@app/shared/models/model/project.model';
import {IProjectImportMetadata} from '@shared/models/model/project_import_metadata.model';
import {IProjectEnvironmentStatus} from '@shared/models/model/environment.model';
import {IReleaseConfigReq} from '@shared/models/model/release-config.model';
import {ICreateFolderStatus, IMMPJobStatusResponse} from '@shared/models/model/mmpstatus.model';
import {createRequestOption} from '@shared/util/request-util';
import {defaultHttpOptions} from '@core/http/http-utils';

type EntityResponseType = HttpResponse<IProject>;
type ReleaseConfigResponseType = HttpResponse<IReleaseConfigReq>;
type EntityArrayResponseType = HttpResponse<IProject[]>;
type StringArrayResponseType = HttpResponse<string[]>;
type commonResponseType = HttpResponse<any>;

@Injectable({ providedIn: 'root' })
export class ProjectService {
  public resourceUrl = '/api/editor/projects';
  public upresourceUrl = '/api/editor/up/projects';
  public workspaceresourceUrl = '/api/editor/projects/workspace';
  public resourceGenUrl =  '/api/editor/up/projects/gen';
  public buildresourceGenUrl =  '/api/editor/up/projects/build';
  public resourceMmpGenUrl =  '/api/editor/up/projects/gen-mmp';
  public releaseConfigUrl =  '/api/editor/projects/release';
  public envstatusConfigUrl =  '/api/editor/projects/env/availability-status';
  public projectkeysResourceUrl =  '/api/editor/projects/keys';
  public projectEnvsURL =  '/api/editor/projects/envs';
  public defaultEnvPropsURL =  '/api/editor/projects/defaultenvs';
  public plugForResourceUrl =  '/api/editor/plugins';

  constructor(protected http: HttpClient) {}

  findAllProjectComponents(): Observable<any[]> {
    return this.http.get<any[]>(`/api/editor/projects/components`, defaultHttpOptions());
  }

  create(project: IProject): Observable<EntityResponseType> {
    return this.http.post<IProject>(this.resourceUrl, project, { observe: 'response' });
  }

  importproject(project: IProjectImportMetadata): Observable<HttpResponse<IProjectImportMetadata>> {
    return this.http.post<IProjectImportMetadata>(`${this.resourceUrl}/import`, project, { observe: 'response' });
  }

  importprojectByName(project: IProjectImportMetadata): Observable<HttpResponse<IProjectImportMetadata>> {
    return this.http.post<IProjectImportMetadata>(`${this.resourceUrl}/import/name`, project, { observe: 'response' });
  }

  syncproject(uuid: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.resourceUrl}/sync/${uuid}`, null, { observe: 'response' });
  }

  syncsourcecode(uuid: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.resourceUrl}/sync-external/${uuid}`, null, { observe: 'response' });
  }

  resolveAndSyncproject(optype: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.resourceUrl}/resolvesync/${uuid}/${optype}`, null, { observe: 'response' });
  }

  update(project: IProject): Observable<EntityResponseType> {
    return this.http.put<IProject>(this.resourceUrl, project, { observe: 'response' });
  }

  generateWithProject(project: IProject) {
    console.log('Generating request with project');
    return this.http.put<IProject>(this.resourceGenUrl, project, { observe: 'response' });
  }

  exportAsPlugin(project: IProject) {
    return this.http.post(`${this.plugForResourceUrl}/export-zip`, project, { observe: 'response', responseType: 'arraybuffer' });
  }

  generateFromProjectId(
    id: string,
    breakpoint: number,
    defaultTheme: number,
    genType: string,
    project: Project,
    uuid: string
  ): Observable<EntityResponseType> {
    console.log('Generating request from project id');
    return this.http.put<IProject>(`${this.upresourceUrl}/gen/${uuid}/${id}/${breakpoint}/${defaultTheme}/${genType}`, project, {
      observe: 'response',
    });
  }

  buildFromProjectId(id: string, genType: string, project: Project, buildid: string, uuid: string): Observable<EntityResponseType> {
    console.log('Building request from project id');
    return this.http.put<IProject>(`${this.buildresourceGenUrl}/${uuid}/${id}/${genType}/${buildid}`, project, {
      observe: 'response',
    });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IProject>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  findWithModels(uuid: string): Observable<EntityResponseType> {
    return this.http.get<IProject>(`${this.upresourceUrl}/models/${uuid}/${uuid}`, { observe: 'response' });
  }

  findWithModelsAndEvents(uuid: string): Observable<EntityResponseType> {
    return this.http.get<IProject>(`${this.upresourceUrl}/models/events/${uuid}/${uuid}`, { observe: 'response' });
  }

  findWithModelEventsAndSubrules(uuid: string): Observable<EntityResponseType> {
    return this.http.get<IProject>(`${this.upresourceUrl}/models/events/subrules/${uuid}/${uuid}`, { observe: 'response' });
  }

  findWithViews(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IProject>(`${this.upresourceUrl}/views/${uuid}/${id}`, { observe: 'response' });
  }

  findWithPages(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IProject>(`${this.upresourceUrl}/allpages/${uuid}/${id}`, { observe: 'response' });
  }

  findAll(id: string): Observable<EntityArrayResponseType> {
    return this.http.get<IProject[]>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProject[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  queryWorkspace(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProject[]>(this.workspaceresourceUrl, { params: options, observe: 'response' });
  }

  queryWorkspaceForEnvApps(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProject[]>(`${this.workspaceresourceUrl}/envapp`, { params: options, observe: 'response' });
  }

  findProjectsForImport(req?: any): Observable<HttpResponse<IProjectImportMetadata[]>> {
    const options = createRequestOption(req);
    return this.http.get<IProjectImportMetadata[]>(`${this.resourceUrl}/workspace-import`, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getProjectUUID(project: IProject): string {
    return project.projectUuid;
    // return project.id + '_' + project.apptypesID + '.' + project.name;
  }

  getProjectStatData(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.get<IProject>(`${this.upresourceUrl}/stats/${uuid}/${id}`, { observe: 'response' });
  }

  findProjectMapKeys(req?: any): Observable<StringArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<string[]>(this.projectkeysResourceUrl, { params: options, observe: 'response' });
  }

  saveReleaseConfig(releaseConfig, id): Observable<ReleaseConfigResponseType> {
    return this.http.put<IReleaseConfigReq>(`${this.releaseConfigUrl}/${id}`, releaseConfig, { observe: 'response' });
  }

  getReleaseConfig(id): Observable<ReleaseConfigResponseType> {
    return this.http.get<IReleaseConfigReq>(`${this.releaseConfigUrl}/${id}`, { observe: 'response' });
  }

  getProjectEnvs(id): Observable<HttpResponse<string[]>> {
    return this.http.get<string[]>(`${this.projectEnvsURL}/${id}`, { observe: 'response' });
  }

  geDefaultEnvs(): Observable<HttpResponse<string[]>> {
    return this.http.get<string[]>(`${this.defaultEnvPropsURL}`, { observe: 'response' });
  }

  getProjectEnvStatus(id): Observable<HttpResponse<IProjectEnvironmentStatus>> {
    return this.http.get<IProjectEnvironmentStatus>(`${this.envstatusConfigUrl}/${id}`, { observe: 'response' });
  }

  findAllMicroserviceProjects(): Observable<EntityArrayResponseType> {
    return this.http.get<IProject[]>(`${this.resourceUrl}/microservices`, { observe: 'response' });
  }

  generateMMPProject(id: string, gentype: string, buildid: string, uuid: string) {
    console.log('Generating mmp project');
    return this.http.put<IProject>(`${this.resourceMmpGenUrl}/${uuid}/${id}/${gentype}/${buildid}`, null, { observe: 'response' });
  }

  findfolderStat(id: string): Observable<HttpResponse<ICreateFolderStatus>> {
    return this.http.get<ICreateFolderStatus>(`${this.resourceUrl}/mmp-folderstatus/${id}`, { observe: 'response' });
  }

  findJobStat(id: string): Observable<HttpResponse<IMMPJobStatusResponse[]>> {
    return this.http.get<IMMPJobStatusResponse[]>(`${this.resourceUrl}/mmp-jobstatus/${id}`, { observe: 'response' });
  }

  findAllDashboardProjects(): Observable<EntityArrayResponseType> {
    return this.http.get<IProject[]>(`${this.resourceUrl}/dashboards`, { observe: 'response' });
  }
}
