import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {IServiceDesign} from '@shared/models/model/service-design.model';
import {createRequestOption} from '@shared/util/request-util';
import {TreeNode} from 'primeng/api';
import {IPlugArray} from '@shared/models/model/connector.model';
import {IEnvironment} from '@shared/models/model/environment.model';



type EntityResponseType = HttpResponse<IServiceDesign>;
type EntityArrayResponseType = HttpResponse<IServiceDesign[]>;

@Injectable({ providedIn: 'root' })
export class ServiceDesignService {
  public resourceUrl = '/api/editor/service-designs';
  public depresourceUrl = '/api/editor';
  public servicedesignresourceUrl = '/api/editor/service-designs/design';
  public epicresourceUrl = '/api/editor/epics';
  public selectConnectorsUrl = '/api/editor/projects/plugins/search';
  public installPlugForResourceUrl = '/api/editor/plugins/retrieve-designdata';

  constructor(protected http: HttpClient) {}

  create(serviceDesigns: IServiceDesign, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IServiceDesign>(`${this.resourceUrl}/${uuid}`, serviceDesigns, { observe: 'response' });
  }

  update(serviceDesigns: IServiceDesign, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IServiceDesign>(`${this.resourceUrl}/${uuid}`, serviceDesigns, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IServiceDesign>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(uuid: string, req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IServiceDesign[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  saveServiceDesign(design: any, uuid: string): Observable<HttpResponse<any>> {
    return this.http.put<any>(`${this.servicedesignresourceUrl}/${uuid}`, design, { observe: 'response' });
  }
  //
  //   findServiceDesignById(id: string, uuid: string): Observable<HttpResponse<TreeNode>> {
  //     return this.http.get<TreeNode>(`${this.servicedesignresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  //   }
  findServiceDesignById(uuid: string): Observable<HttpResponse<TreeNode>> {
    return this.http.get<TreeNode>(`${this.epicresourceUrl}/project/service-design/${uuid}`, { observe: 'response' });
  }

  selectConnector(req?: any): Observable<HttpResponse<IPlugArray>> {
    return this.http.get<IPlugArray>(this.selectConnectorsUrl, { params: req, observe: 'response' });
  }

  installPluginsForConnector(pluginsData, projecId, designId): Observable<EntityResponseType> {
    return this.http.post<any>(`${this.installPlugForResourceUrl}/${projecId}`, pluginsData, {
      params: { designuuid: designId },
      observe: 'response',
    });
  }

  getAllEnvs(req?: any): Observable<HttpResponse<IEnvironment[]>> {
    const options = createRequestOption(req);
    return this.http.get<IEnvironment[]>(`${this.depresourceUrl}/deployerapi/getall/env`, {
      params: options,
      observe: 'response',
    });
  }
}
