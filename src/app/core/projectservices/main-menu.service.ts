import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IMainMenu } from '@app/shared/models/model/main-menu.model';
import {createRequestOption} from '@shared/util/request-util';
import {IMoveMainMenu} from '@shared/models/model/move-menu.model';



type EntityResponseType = HttpResponse<IMainMenu>;
type EntityArrayResponseType = HttpResponse<IMainMenu[]>;

@Injectable({ providedIn: 'root' })
export class MainMenuService {
  public resourceUrl =  '/api/editor/proj/main-menus';
  public mainMenuMoveresourceUrl =  '/api/editor/proj/main-menus/move-menu';
  public mainMenusForProjectResourceUrl =  '/api/editor/proj/main-menus/project';
  public mainMenusNotBelongsToLinkForProjectResourceUrl =  '/api/editor/proj/main-menus/project/not-belongs-to-link';
  public mainmenustatusChangeCheckResourceUrl =  '/api/editor/proj/main-menus/statuschange/check';
  public mainmenuDisablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/main-menus/statusdisabled/confirmed';
  public mainmenuEnablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/main-menus/statusenabled/confirmed';

  constructor(protected http: HttpClient) {}

  create(mainMenu: IMainMenu, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IMainMenu>(`${this.resourceUrl}/${uuid}`, mainMenu, { observe: 'response' });
  }

  update(mainMenu: IMainMenu, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IMainMenu>(`${this.resourceUrl}/${uuid}`, mainMenu, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IMainMenu>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findMainMenusForProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IMainMenu[]>(`${this.mainMenusForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IMainMenu[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  checkStatusChange(id: string, uuid: string): Observable<HttpResponse<boolean>> {
    return this.http.get<boolean>(`${this.mainmenustatusChangeCheckResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IMainMenu>(`${this.mainmenuDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }
  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IMainMenu>(`${this.mainmenuEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }

  findmenusnotbelongstolink(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IMainMenu[]>(`${this.mainMenusNotBelongsToLinkForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  moveMenu(moveMenuRequest: IMoveMainMenu, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IMainMenu>(`${this.mainMenuMoveresourceUrl}/${uuid}/${uuid}`, moveMenuRequest, { observe: 'response' });
  }
}
