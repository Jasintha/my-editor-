import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {IWidget} from '@shared/models/model/widget.model';
import {IEvent} from '@shared/models/model/microservice-event.model';
import {IPageParam} from '@shared/models/model/page-navigation.model';
import {FormControllers, IFormControllers} from '@shared/models/model/form-controllers.model';
import {ISourceTargetFieldsRequest} from '@shared/models/model/form-field.model';
import {createRequestOption} from '@shared/util/request-util';
import {IAggregate} from '@shared/models/model/aggregate.model';
import {TreeNode} from 'primeng/api';


type EntityResponseType = HttpResponse<IWidget>;
type FormControllersResponseType = HttpResponse<IFormControllers>;
type EntityArrayResponseType = HttpResponse<IWidget[]>;
type EventArrayResponseType = HttpResponse<IEvent[]>;
type NavigationParamArrayResponseType = HttpResponse<IPageParam[]>;
type ActionTypeArrayResponseType = HttpResponse<string[]>;
type SourceTargetFormFieldRequestResponseType = HttpResponse<ISourceTargetFieldsRequest>;
type StringArrayResponseType = HttpResponse<string[]>;

@Injectable({ providedIn: 'root' })
export class BuiltInWidgetService {
  public resourceUrl = '/api/editor/widget';

  public widgetResourceUrl = '/api/editor/widget';
  public widgetForProjectResourceUrl = '/api/editor/uws/widget/project';

  public builtInResourceUrl = '/api/editor/pages/built-in';
  public builtInWidgetsForProjectResourceUrl = '/api/editor/uws/pages/built-in/project';
  public builtInWidgetEventsResourceUrl = '/api/editor/pages/built-in/page-template/events';
  public builtInWidgetActionTypesResourceUrl = '/api/editor/pages/built-in/page-template/action-types';
  public builtInWidgetNavigationParamsResourceUrl = '/api/editor/pages/built-in/page-navigation-params';
  public builtInWidgetSourceTargetFormFieldsResourceUrl = '/api/editor/widgets/built-in/page-source-target-fields';
  public builtInWidgetUpdateFormFieldsResourceUrl = '/api/editor/widgets/built-in/widget-form-configs';
  public builtInWidgetstatusChangeCheckResourceUrl = '/api/editor/pages/built-in/statuschange/check';
  public builtInWidgetDisablestatusChangeConfirmedResourceUrl = '/api/editor/pages/built-in/statusdisabled/confirmed';
  public builtInWidgetEnablestatusChangeConfirmedResourceUrl = '/api/editor/pages/built-in/statusenabled/confirmed';
  public checkEntityNameAvailabilityURL = '/api/editor/aggregates/names';
  public checkWidgetNameAvailabilityURL = '/api/editor/widgets/names';
  public aggregateModelKeysResourceUrl = '/api/editor/aggregates/keys';
  public resourceAgrUrl = '/api/editor/aggregates';
  public designresourceUrl = '/api/editor/aggregates/design';
  public pageStyleUrl = '/api/editor/pages/pagestyle';
  public widgetsInPageResourceURL = '/api/editor/page/widget';

  constructor(protected http: HttpClient) {}

  create(builtInWidget: IWidget, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IWidget>(`${this.widgetResourceUrl}/${uuid}`, builtInWidget, { observe: 'response' });
  }

  addFormControllers(formFields: any, uuid: string): Observable<FormControllersResponseType> {
    return this.http.post<FormControllers>(`${this.resourceUrl}/${uuid}`, formFields, { observe: 'response' });
  }

  update(builtInWidget: IWidget, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IWidget>(`${this.resourceUrl}/${uuid}`, builtInWidget, { observe: 'response' });
  }

  find(uuid: string, id: string): Observable<EntityResponseType> {
    return this.http.get<IWidget>(`${this.widgetResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findAllWidgetsForaPage(uuid: string, pageId: string): Observable<EntityArrayResponseType> {
    return this.http.get<IWidget[]>(`${this.widgetsInPageResourceURL}/${uuid}/${pageId}`, { observe: 'response' });
  }

  findbuiltInWidgetsForProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IWidget[]>(`${this.widgetForProjectResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IWidget[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  findWidgetNameAvailability(name: string, widgetId: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.get(`${this.checkWidgetNameAvailabilityURL}/${uuid}/${widgetId}/${name}`, { observe: 'response' });
  }

  querybuiltInWidgets(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IWidget[]>(`${this.builtInResourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.widgetResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findEventsForPageTemplate(pagetemplate: string, uuid: string): Observable<EventArrayResponseType> {
    return this.http.get<IEvent[]>(`${this.builtInWidgetEventsResourceUrl}/${uuid}/${pagetemplate}`, { observe: 'response' });
  }

  findActionTypesForPageTemplate(pagetemplate: string, uuid: string): Observable<ActionTypeArrayResponseType> {
    return this.http.get<string[]>(`${this.builtInWidgetActionTypesResourceUrl}/${uuid}/${pagetemplate}`, { observe: 'response' });
  }

  findNavigationParamsForPage(id: string, uuid: string): Observable<NavigationParamArrayResponseType> {
    return this.http.get<IPageParam[]>(`${this.builtInWidgetNavigationParamsResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  findAllSourceTargetFormFieldsForWidget(id: string, uuid: string): Observable<SourceTargetFormFieldRequestResponseType> {
    return this.http.get<ISourceTargetFieldsRequest>(`${this.builtInWidgetSourceTargetFormFieldsResourceUrl}/${uuid}/${id}`, {
      observe: 'response',
    });
  }

  saveWidgetFormOrder(formFields, id, uuid: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.builtInWidgetUpdateFormFieldsResourceUrl}/${uuid}/${id}`, formFields, { observe: 'response' });
  }

  checkStatusChange(id: string, uuid: string): Observable<HttpResponse<boolean>> {
    return this.http.get<boolean>(`${this.builtInWidgetstatusChangeCheckResourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IWidget>(`${this.builtInWidgetDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response',
    });
  }
  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IWidget>(`${this.builtInWidgetEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, { observe: 'response' });
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

  // updatePageStyle(builtInWidget: IPageStyle, pageid: string): Observable<EntityResponseType> {
  //   return this.http.put<IPageStyle>(`${this.pageStyleUrl}/${pageid}`, builtInWidget, { observe: 'response' });
  // }
  // createPageStyle(builtInWidget: IPageStyle, pageid: string): Observable<EntityResponseType> {
  //   return this.http.post<IPageStyle>(`${this.pageStyleUrl}/${pageid}`, builtInWidget, { observe: 'response' });
  // }
}
