import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {IPageNavigation} from '@shared/models/model/page-navigation.model';
import {createRequestOption} from '@shared/util/request-util';


type EntityResponseType = HttpResponse<IPageNavigation>;
type EntityArrayResponseType = HttpResponse<IPageNavigation[]>;

@Injectable({ providedIn: 'root' })
export class PageNavigationService {
  public resourceUrl ='/api/editor/page-navigations';
  public naviagationsForProjectresourceUrl ='/api/editor/page-navigations/project';

  constructor(protected http: HttpClient) {}

  create(pageNavigation: IPageNavigation, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IPageNavigation>(`${this.resourceUrl}/${uuid}`, pageNavigation, { observe: 'response' });
  }

  update(pageNavigation: IPageNavigation, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPageNavigation>(`${this.resourceUrl}/${uuid}`, pageNavigation, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IPageNavigation>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPageNavigation[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findPageNavigationsForProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IPageNavigation[]>(`${this.naviagationsForProjectresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }
}
