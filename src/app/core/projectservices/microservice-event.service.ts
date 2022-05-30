import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import {IEvent} from '@shared/models/model/microservice-event.model';

type EntityResponseType = HttpResponse<IEvent>;
type EntityArrayResponseType = HttpResponse<IEvent[]>;
type StringArrayResponseType = HttpResponse<string[]>;

@Injectable({ providedIn: 'root' })
export class EventService {
  public resourceUrl =  '/api/editor/proj/events';
  public projectresourceUrl =  '/api/editor/proj/events/project';
  public eventDisablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/events/statuschange/disable';
  public eventEnablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/events/statuschange/enable';

  constructor(protected http: HttpClient) {}

  create(event: IEvent, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IEvent>(`${this.resourceUrl}/${uuid}`, event, { observe: 'response' });
  }

  update(event: IEvent, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IEvent>(`${this.resourceUrl}/${uuid}`, event, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IEvent>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IEvent[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IEvent[]>(`${this.projectresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IEvent>(`${this.eventDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }

  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IEvent>(`${this.eventEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }
}
