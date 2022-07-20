import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from '@app/app.constants';
import { createRequestOption } from '@shared/util/request-util';
import { ITheme, Theme } from '@shared/models/model/theme.model';

type EntityResponseType = HttpResponse<ITheme>;
type EntityArrayResponseType = HttpResponse<ITheme[]>;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  public resourceUrl =  '/api/editor/proj/themes';
  public themesForProjectResourceUrl =  '/api/editor/proj/themes/project';
  public logoUploadForThemeResourceUrl = '/api/editor/proj/themes/logo';

  constructor(protected http: HttpClient) {}

  create(theme: ITheme, uuid: string): Observable<EntityResponseType> {
    return this.http.post<ITheme>(`${this.resourceUrl}/${uuid}`, theme, { observe: 'response' });
  }

  update(theme: ITheme, uuid: string): Observable<EntityResponseType> {
    return this.http.put<ITheme>(`${this.resourceUrl}/${uuid}`, theme, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<ITheme>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findThemesForProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<ITheme[]>(`${this.themesForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITheme[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  imageUpload(data, id, uuid: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.logoUploadForThemeResourceUrl}/${uuid}/${id}`, data, { observe: 'response' });
  }
}
