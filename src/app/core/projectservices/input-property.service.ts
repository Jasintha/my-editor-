import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { createRequestOption } from '@shared/util/request-util';
import {IInputProperty} from '@shared/models/model/input-property.model';

type EntityResponseType = HttpResponse<IInputProperty>;
type EntityArrayResponseType = HttpResponse<IInputProperty[]>;

@Injectable({ providedIn: 'root' })
export class InputPropertyService {
  public resourceUrl =  '/api/editor/input-properties';
  public inputPropertiesForProjectResourceUrl =  '/api/editor/input-properties/project';
  public errorObjectInputPropertiesForProjectResourceUrl =  '/api/editor/error-object-input-properties/project';

  constructor(protected http: HttpClient) {}

  create(inputProperty: IInputProperty, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IInputProperty>(`${this.resourceUrl}/${uuid}`, inputProperty, { observe: 'response' });
  }

  update(inputProperty: IInputProperty, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IInputProperty>(`${this.resourceUrl}/${uuid}`, inputProperty, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IInputProperty>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findInputPropertiesNotBelongsToCustomObjectForProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IInputProperty[]>(`${this.inputPropertiesForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findErrorObjectInputPropertiesForProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IInputProperty[]>(`${this.errorObjectInputPropertiesForProjectResourceUrl}/${uuid}/${id}`, {
      observe: 'response'
    });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IInputProperty[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }
}
