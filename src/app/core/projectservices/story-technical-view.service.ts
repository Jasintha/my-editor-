import { Injectable } from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';

import {createRequestOption} from '@shared/util/request-util';
import {IStatusChangeRequest, IStory, IStoryUpdateReq, IWorkflow, StoryUpdateReq} from '@shared/models/model/requirement.model';
import { TreeNode } from 'primeng/api';

type EntityResponseType = HttpResponse<IStory>;
type EntityArrayResponseType = HttpResponse<IStory[]>;

@Injectable({ providedIn: 'root' })
export class StoryService {
  public resourceUrl = '/api/editor/stories';
  public workflowresourceUrl = '/api/editor/workflows';
  public epicresourceUrl = '/api/editor/epics';
  public storyresourceUrl = '/api/editor/stories';
  public storystatusChangeCheckResourceUrl = '/api/editor/stories/statuschange/check';
  public storyDisablestatusChangeConfirmedResourceUrl = '/api/editor/stories/statusdisabled/confirmed';
  public storyEnablestatusChangeConfirmedResourceUrl = '/api/editor/stories/statusenabled/confirmed';
  public storyStatusChange = '/api/editor/stories/status';
  public storyTextReq = '/api/editor/stories/text';
  public storyDetailURL = '/sp/setstorydata';

  constructor(protected http: HttpClient) {}

  create(story: IStory, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IStory>(`${this.resourceUrl}/${uuid}`, story, { observe: 'response' });
  }

  createModel(model: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.resourceUrl}/model/${uuid}`, model, { observe: 'response' });
  }

  createService(service: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.resourceUrl}/service/${uuid}`, service, { observe: 'response' });
  }

  update(story: IStory, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IStory>(`${this.resourceUrl}/${uuid}`, story, { observe: 'response' });
  }

  updateStoryStatus(story: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.resourceUrl}/status/${uuid}`, story, { observe: 'response' });
  }

  updateStoryTechDetails(story: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.resourceUrl}/tech-details/${uuid}`, story, { observe: 'response' });
  }

  updateEpicStatus(story: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.epicresourceUrl}/status/${uuid}`, story, { observe: 'response' });
  }

  createWorkflow(story: IWorkflow, uuid: string): Observable<HttpResponse<IWorkflow>> {
    return this.http.post<IWorkflow>(`${this.workflowresourceUrl}/${uuid}`, story, { observe: 'response' });
  }

  createWorkflowScreen(story: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.workflowresourceUrl}/screen/${uuid}`, story, { observe: 'response' });
  }

  findEpicTreeData(uuid: string, id: string): Observable<HttpResponse<TreeNode>> {
    return this.http.get<TreeNode>(`${this.epicresourceUrl}/project/treedata/${uuid}/${id}`, { observe: 'response' });
  }

  findStoriesTreeDataByEpic(uuid: string, id: string): Observable<HttpResponse<TreeNode[]>> {
    return this.http.get<TreeNode[]>(`${this.storyresourceUrl}/project/epic/treedata/${uuid}/${id}`, { observe: 'response' });
  }

  findStorieByEpic(uuid: string, id: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.storyresourceUrl}/project/epic/${uuid}/${id}`, { observe: 'response' });
  }

  createWorkflowActivator(story: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.workflowresourceUrl}/activator/${uuid}`, story, { observe: 'response' });
  }

  updateWorkflow(story: IWorkflow, uuid: string): Observable<HttpResponse<IWorkflow>> {
    return this.http.put<IWorkflow>(`${this.workflowresourceUrl}/${uuid}`, story, { observe: 'response' });
  }

  updateWorkflowReq(story: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.workflowresourceUrl}/wfreq/${uuid}`, story, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IStory>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IStory[]>(`${this.resourceUrl}/project/${uuid}/${id}`, { observe: 'response' });
  }

  findTechDetailByProjectId(uuid: string, id: string): Observable<HttpResponse<any>> {
    return this.http.get<any>(`${this.resourceUrl}/project/story/techdetails/${uuid}/${id}`, { observe: 'response' });
  }

  findByScreensForPortalByProjectId(portalid: string, uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.workflowresourceUrl}/project/portalscreens/${uuid}/${portalid}`, { observe: 'response' });
  }

  findAllApisForServiceByProjectId(serviceid: string, uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.workflowresourceUrl}/project/serviceapis/${uuid}/${serviceid}`, { observe: 'response' });
  }

  findAllModelsForServiceByProjectId(serviceid: string, uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.workflowresourceUrl}/project/servicemodels/${uuid}/${serviceid}`, { observe: 'response' });
  }

  findPortalsByProjectId(uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.workflowresourceUrl}/project/portals/${uuid}`, { observe: 'response' });
  }

  findServicesByProjectId(uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.workflowresourceUrl}/project/services/${uuid}`, { observe: 'response' });
  }

  findActorsByProjectId(uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.resourceUrl}/project/actor/${uuid}`, { observe: 'response' });
  }

  findStoryTreeData(id: string, uuid: string): Observable<HttpResponse<TreeNode[]>> {
    return this.http.get<TreeNode[]>(`${this.resourceUrl}/project/treedata/${uuid}/${id}`, { observe: 'response' });
  }
  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IStory[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  deleteEpic(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.epicresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  checkStatusChange(id: string, uuid: string): Observable<HttpResponse<boolean>> {
    return this.http.get<boolean>(`${this.storystatusChangeCheckResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  saveCode(story: IStory, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IStory>(`${this.resourceUrl}/${uuid}/code`, story, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IStory>(`${this.storyDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response',
    });
  }
  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IStory>(`${this.storyEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response',
    });
  }

  changeprogressStatus(changeStatus: IStatusChangeRequest, uuid):Observable<HttpResponse<IStatusChangeRequest>> {
    return this.http.put<IStatusChangeRequest>(`${this.storyStatusChange}/${uuid}`, changeStatus, { observe: 'response' });
  }

  storyTextUpdateReq(textReq: IStoryUpdateReq, uuid):Observable<HttpResponse<IStoryUpdateReq>> {
    return this.http.put<IStoryUpdateReq>(`${this.storyTextReq}/${uuid}`, textReq, { observe: 'response' });
  }

  sendStoryDetails(storyid, epicid, reqid, serviceid): Observable<HttpResponse<any>> {
    let params = new HttpParams();
    params = params.append('storyid', storyid);
    params = params.append('epicid', epicid);
    params = params.append('reqid', reqid);
    params = params.append('serviceid', serviceid);
    return this.http.post<any>(`${this.storyDetailURL}`, null, { params, observe: 'response' });
  }
}
