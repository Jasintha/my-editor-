import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {IPageConfig} from '@shared/models/model/page-config.model';
import {createRequestOption} from '@shared/util/request-util';



type EntityResponseType = HttpResponse<IPageConfig>;
type EntityArrayResponseType = HttpResponse<IPageConfig[]>;

@Injectable({ providedIn: 'root' })
export class PageConfigService {
  public resourceUrl =  '/api/editor/page-configs';
  public pageConfigsForProjectResourceUrl =  '/api/editor/page-configs/project';
  public pageConfigsForPageResourceUrl =  '/api/editor/page-configs/page';
  public solutionImageUrl =  '/api/editor/solutions/multipart';

  constructor(protected http: HttpClient) {}

  create(pageConfig: IPageConfig, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IPageConfig>(`${this.resourceUrl}/${uuid}`, pageConfig, { observe: 'response' });
  }

  update(pageConfig: IPageConfig, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPageConfig>(`${this.resourceUrl}/${uuid}`, pageConfig, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IPageConfig>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findPageConfigsForProjectId(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IPageConfig>(`${this.pageConfigsForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findPageConfigsForPageId(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IPageConfig>(`${this.pageConfigsForPageResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPageConfig[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  imageUpload(data): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.solutionImageUrl, data, { observe: 'response' });
  }
}
