import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import { ITask } from '@app/shared/models/model/task.model';

type EntityResponseType = HttpResponse<ITask>;
type EntityArrayResponseType = HttpResponse<ITask[]>;
type StringArrayResponseType = HttpResponse<string[]>;

@Injectable({ providedIn: 'root' })
export class TaskService {
  public resourceUrl =  '/api/editor/proj/tasks';
  public upresourceUrl =  '/api/editor/proj/uws/tasks';
  public projectresourceUrl =  '/api/editor/proj/tasks/project';
  public maintaskprojectresourceUrl =  '/api/editor/proj/tasks/main/project';
  public taskDisablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/tasks/statuschange/disable';
  public taskEnablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/tasks/statuschange/enable';

  constructor(protected http: HttpClient) {}

  create(task: ITask, uuid: string): Observable<EntityResponseType> {
    return this.http.post<ITask>(`${this.upresourceUrl}/${uuid}`, task, { observe: 'response' });
  }

  update(task: ITask, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ITask>(`${this.resourceUrl}/${uuid}`, task, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<ITask>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITask[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<ITask[]>(`${this.projectresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findMainTasksByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<ITask[]>(`${this.maintaskprojectresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  delete(id: string, uuid: string, tasktype: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { params: { tasktype: tasktype }, observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ITask>(`${this.taskDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }

  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ITask>(`${this.taskEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }
}
