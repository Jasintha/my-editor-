import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import {ICommand} from '@shared/models/model/command.model';

type EntityResponseType = HttpResponse<ICommand>;
type EntityArrayResponseType = HttpResponse<ICommand[]>;
type StringArrayResponseType = HttpResponse<string[]>;

@Injectable({ providedIn: 'root' })
export class CommandService {
  public resourceUrl =  '/api/editor/proj/commands';
  public upresourceUrl =  '/api/editor/proj/uws/commands';
  public projectresourceUrl =  '/api/editor/proj/commands/project';
  public commandDisablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/commands/statuschange/disable';
  public commandEnablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/commands/statuschange/enable';

  constructor(protected http: HttpClient) {}

  create(command: ICommand, uuid: string): Observable<EntityResponseType> {
    return this.http.post<ICommand>(`${this.upresourceUrl}/${uuid}`, command, { observe: 'response' });
  }

  update(command: ICommand, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ICommand>(`${this.resourceUrl}/${uuid}`, command, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<ICommand>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ICommand[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<ICommand[]>(`${this.projectresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ICommand>(`${this.commandDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }

  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ICommand>(`${this.commandEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }
}
