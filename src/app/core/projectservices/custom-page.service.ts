import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {IPage} from '@shared/models/model/page.model';
import {createRequestOption} from '@shared/util/request-util';



type EntityResponseType = HttpResponse<IPage>;
type EntityArrayResponseType = HttpResponse<IPage[]>;

@Injectable({ providedIn: 'root' })
export class CustomPageService {
  public resourceUrl =  '/api/editor/pages';
  public customResourceUrl =  '/api/editor/pages/custom';
  public customPagesForProjectResourceUrl =  '/api/editor/pages/custom/project';

  constructor(protected http: HttpClient) {}

  create(customPage: IPage, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IPage>(`${this.resourceUrl}/${uuid}`, customPage, { observe: 'response' });
  }

  update(customPage: IPage, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.resourceUrl}/${uuid}`, customPage, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IPage>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findCustomPagesForProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IPage[]>(`${this.customPagesForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPage[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  queryCustomPages(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPage[]>(`${this.customResourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }
}
