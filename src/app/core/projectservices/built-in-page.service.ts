import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {IPage} from '@shared/models/model/page.model';
import {FormControllers, IFormControllers} from '@shared/models/model/form-controllers.model';
import { IPageParam } from '@app/shared/models/model/page-navigation.model';
import {IEvent} from '@shared/models/model/microservice-event.model';
import {ISourceTargetFieldsRequest} from '@shared/models/model/form-field.model';
import {IAggregate} from '@shared/models/model/aggregate.model';
import {TreeNode} from 'primeng/api';
import {createRequestOption} from '@shared/util/request-util';
import {IWidget} from '@shared/models/model/widget.model';
import {ITabbedPage} from '@shared/models/model/tab.page.model';



type EntityResponseType = HttpResponse<IPage>;
type FormControllersResponseType = HttpResponse<IFormControllers>;
type EntityArrayResponseType = HttpResponse<IPage[]>;
type EventArrayResponseType = HttpResponse<IEvent[]>;
type NavigationParamArrayResponseType = HttpResponse<IPageParam[]>;
type ActionTypeArrayResponseType = HttpResponse<string[]>;
type SourceTargetFormFieldRequestResponseType = HttpResponse<ISourceTargetFieldsRequest>;
type StringArrayResponseType = HttpResponse<string[]>;

@Injectable({ providedIn: 'root' })
export class BuiltInPageService {
  public resourceUrl =  '/api/editor/proj/pages';
  public builtInResourceUrl =  '/api/editor/proj/pages/built-in';
  public builtInPagesForProjectResourceUrl =  '/api/editor/proj/uws/pages/built-in/project';
  public builtInPageEventsResourceUrl =  '/api/editor/proj/pages/built-in/page-template/events';
  public builtInPageActionTypesResourceUrl =  '/api/editor/proj/pages/built-in/page-template/action-types';
  public builtInPageNavigationParamsResourceUrl =  '/api/editor/proj/pages/built-in/page-navigation-params';
  public builtInPageSourceTargetFormFieldsResourceUrl =  '/api/editor/proj/pages/built-in/page-source-target-fields';
  public builtInPageUpdateFormFieldsResourceUrl =  '/api/editor/proj/pages/built-in/page-form-configs';
  public builtInPagestatusChangeCheckResourceUrl =  '/api/editor/proj/pages/built-in/statuschange/check';
  public builtInPageDisablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/pages/built-in/statusdisabled/confirmed';
  public builtInPageEnablestatusChangeConfirmedResourceUrl =  '/api/editor/proj/pages/built-in/statusenabled/confirmed';
  public checkPageNameAvailabilityURL =  '/api/editor/proj/pages/names';
  public checkEntityNameAvailabilityURL =  '/api/editor/proj/aggregates/names';
  public widgetForProjectResourceUrl =  '/api/editor/proj/uws/pages/page/project';
  public aggregateModelKeysResourceUrl =  '/api/editor/proj/aggregates/keys';
  public resourceAgrUrl =  '/api/editor/proj/aggregates';
  public designresourceUrl =  '/api/editor/proj/aggregates/design';
  public updateResourcepathUrl =  '/api/editor/proj/pages/built-in/page-resource-path';
  public updateBasicDataUrl =  '/api/editor/proj/pages/built-in/page-basic-data';
  public updatePageActionsUrl =  '/api/editor/proj/pages/built-in/page-actions';
  public updatePageFieldMappings =  '/api/editor/proj/pages/built-in/page-field-mappings';
  public updatePageLoginInputsUrl =  '/api/editor/proj/pages/built-in/page-login-inputs';
  public updateAIOPageResourceDataUrl =  '/api/editor/proj/pages/built-in/aio-page-resource';
  public pageStyleUrl =  '/api/editor/proj/pages/pagestyle';

  constructor(protected http: HttpClient) {}

  create(builtInPage: IPage, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IPage>(`${this.resourceUrl}/${uuid}`, builtInPage, { observe: 'response' });
  }

  addFormControllers(formFields: any, uuid: string): Observable<FormControllersResponseType> {
    return this.http.post<FormControllers>(`${this.resourceUrl}/${uuid}`, formFields, { observe: 'response' });
  }

  update(builtInPage: IPage, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.resourceUrl}/${uuid}`, builtInPage, { observe: 'response' });
  }

  updateResourcePath(builtInPage: IPage, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.updateResourcepathUrl}/${uuid}`, builtInPage, { observe: 'response' });
  }

  updatePageBasicData(builtInPage: IPage, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.updateBasicDataUrl}/${uuid}`, builtInPage, { observe: 'response' });
  }

  updatePageFieldHeaderMappings(builtInPage: IPage, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.updatePageFieldMappings}/${uuid}`, builtInPage, { observe: 'response' });
  }

  updatePageLoginInputs(builtInPage: IPage, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.updatePageLoginInputsUrl}/${uuid}`, builtInPage, { observe: 'response' });
  }

  updateAIOPageResourceData(builtInPage: IPage, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.updateAIOPageResourceDataUrl}/${uuid}`, builtInPage, { observe: 'response' });
  }

  updatePageActions(builtInPage: IPage, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.updatePageActionsUrl}/${uuid}`, builtInPage, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IPage>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findPageNameAvailability(name: string, pageId: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.get(`${this.checkPageNameAvailabilityURL}/${uuid}/${pageId}/${name}`, { observe: 'response' });
  }

  findBuiltInPagesForProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {//
    return this.http.get<IPage[]>(`${this.builtInPagesForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findBuiltInWidgetsForProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IWidget[]>(`${this.widgetForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPage[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  queryBuiltInPages(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPage[]>(`${this.builtInResourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findEventsForPageTemplate(pagetemplate: string, uuid: string): Observable<EventArrayResponseType> {
    return this.http.get<IEvent[]>(`${this.builtInPageEventsResourceUrl}/${uuid}/${pagetemplate}`, { observe: 'response' });
  }

  findActionTypesForPageTemplate(pagetemplate: string, uuid: string): Observable<ActionTypeArrayResponseType> {
    return this.http.get<string[]>(`${this.builtInPageActionTypesResourceUrl}/${uuid}/${pagetemplate}`, { observe: 'response' });
  }

  findNavigationParamsForPage(id: string, uuid: string): Observable<NavigationParamArrayResponseType> {
    return this.http.get<IPageParam[]>(`${this.builtInPageNavigationParamsResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findAllSourceTargetFormFieldsForPage(id: string, uuid: string): Observable<SourceTargetFormFieldRequestResponseType> {
    return this.http.get<ISourceTargetFieldsRequest>(`${this.builtInPageSourceTargetFormFieldsResourceUrl}/${uuid}/${id}`, {
      observe: 'response',
    });
  }

  savePageFormOrder(formFields, id, uuid: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.builtInPageUpdateFormFieldsResourceUrl}/${uuid}/${id}`, formFields, { observe: 'response' });
  }

  checkStatusChange(id: string, uuid: string): Observable<HttpResponse<boolean>> {
    return this.http.get<boolean>(`${this.builtInPagestatusChangeCheckResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.builtInPageDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }
  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.builtInPageEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
  }

  createAggregate(aggregate: IAggregate, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IAggregate>(`${this.resourceAgrUrl}/${uuid}`, aggregate, { observe: 'response' });
  }

  saveModelDesign(aggregate: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.designresourceUrl}/${uuid}`, aggregate, { observe: 'response' });
  }

  findDesignById(id: string, uuid: string): Observable<HttpResponse<TreeNode>> {
    return this.http.get<TreeNode>(`${this.designresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findAggregateModelMapKeys(req?: any, uuid?: string): Observable<StringArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<string[]>(`${this.aggregateModelKeysResourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  findNameAvailability(name: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.get(`${this.checkEntityNameAvailabilityURL}/${uuid}/${name}`, { observe: 'response' });
  }

  createTabPage(tabbedPage: ITabbedPage, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IPage>(`${this.resourceUrl}/${uuid}`, tabbedPage, { observe: 'response' });
  }

  updateTabPage(tabbedPage: ITabbedPage, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IPage>(`${this.resourceUrl}/${uuid}`, tabbedPage, {observe: 'response'});
  }

    // updatePageStyle(builtInPage: IPageStyle, pageid: string): Observable<EntityResponseType> {
  //   return this.http.put<IPageStyle>(`${this.pageStyleUrl}/${pageid}`, builtInPage, { observe: 'response' });
  // }
  // createPageStyle(builtInPage: IPageStyle, pageid: string): Observable<EntityResponseType> {
  //   return this.http.post<IPageStyle>(`${this.pageStyleUrl}/${pageid}`, builtInPage, { observe: 'response' });
  // }
}
