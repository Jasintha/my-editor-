import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import { IRequirement, IEpic, IStory } from '@shared/models/model/requirement.model';

type EntityResponseType = HttpResponse<IRequirement>;
type EntityArrayResponseType = HttpResponse<IRequirement[]>;

@Injectable({ providedIn: 'root' })
export class RequirementService {
  public resourceUrl = '/api/editor/requirements';
  public epicresourceUrl = '/api/editor/epics';
  public storyresourceUrl = '/api/editor/stories';
  public requirementstatusChangeCheckResourceUrl = '/api/editor/requirements/statuschange/check';
  public requirementDisablestatusChangeConfirmedResourceUrl = '/api/editor/requirements/statusdisabled/confirmed';
  public requirementEnablestatusChangeConfirmedResourceUrl = '/api/editor/requirements/statusenabled/confirmed';

  constructor(protected http: HttpClient) {}

  create(requirement: IRequirement, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IRequirement>(`${this.resourceUrl}/${uuid}`, requirement, { observe: 'response' });
  }

  createEpic(epic: IEpic, uuid: string): Observable<HttpResponse<IEpic>> {
    return this.http.post<IEpic>(`${this.epicresourceUrl}/${uuid}`, epic, { observe: 'response' });
  }

  addEpicToReq(epic: IEpic, uuid: string): Observable<HttpResponse<IEpic>> {
    return this.http.post<IEpic>(`${this.epicresourceUrl}/req/${uuid}`, epic, { observe: 'response' });
  }

  createStory(epic: IStory, uuid: string, createService?: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.storyresourceUrl}/${uuid}`, epic, { params: { createservice: createService }, observe: 'response' });
  }

  updateEpic(epic: IEpic, uuid: string): Observable<HttpResponse<IEpic>> {
    return this.http.put<IEpic>(`${this.epicresourceUrl}/${uuid}`, epic, { observe: 'response' });
  }

  updateStory(epic: IStory, uuid: string): Observable<HttpResponse<IStory>> {
    return this.http.put<IStory>(`${this.storyresourceUrl}/${uuid}`, epic, { observe: 'response' });
  }

  update(requirement: IRequirement, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IRequirement>(`${this.resourceUrl}/${uuid}`, requirement, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IRequirement>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IRequirement[]>(`${this.resourceUrl}/project/${uuid}/${id}`, { observe: 'response' });
  }

  findSummaryByProjectId(uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.resourceUrl}/project/summaryview/${uuid}`, { observe: 'response' });
  }

  findEpicsByProjectId(id: string, uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.epicresourceUrl}/project/${uuid}/${id}`, { observe: 'response' });
  }
  findEpicsDetailsByProjectId(id: string, uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.epicresourceUrl}/project/details/${uuid}/${id}`, { observe: 'response' });
  }

  findEpicsForReqByProjectId(id: string, uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.epicresourceUrl}/project/req//${uuid}/${id}`, { observe: 'response' });
  }

  findRequirementTreeData(id: string, uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.resourceUrl}/project/treedata/${uuid}/${id}`, { observe: 'response' });
  }

  findAllDesignTreeData(): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.resourceUrl}/project/alldesigntreedata`, { observe: 'response' });
  }

  findEpicTreeData(id: string, uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.resourceUrl}/project/epic-summary/${uuid}/${id}`, { observe: 'response' });
  }

  findActorTreeData(id: string, uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.resourceUrl}/project/actor-summary/${uuid}/${id}`, { observe: 'response' });
  }

  findEpicsByProjId(id: string, uuid: string): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.epicresourceUrl}/project/${uuid}/${id}`, { observe: 'response' });
  }
  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IRequirement[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  checkStatusChange(id: string, uuid: string): Observable<HttpResponse<boolean>> {
    return this.http.get<boolean>(`${this.requirementstatusChangeCheckResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  saveCode(requirement: IRequirement, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IRequirement>(`${this.resourceUrl}/${uuid}/code`, requirement, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IRequirement>(`${this.requirementDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response',
    });
  }
  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IRequirement>(`${this.requirementEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response',
    });
  }
}
