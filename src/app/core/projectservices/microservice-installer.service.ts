import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {IInstalledMicroservice, IMicroservice} from '@app/shared/models/model/installed-microservice.model';
import {createRequestOption} from '@shared/util/request-util';



type EntityResponseType = HttpResponse<IInstalledMicroservice>;
type EntityArrayResponseType = HttpResponse<IInstalledMicroservice[]>;
type StringArrayResponseType = HttpResponse<string[]>;

@Injectable({ providedIn: 'root' })
export class MicroserviceInstallerService {
  public resourceUrl =  '/api/editor/microservice-installer';
  public projectresourceUrl =  '/api/editor/microservice-installer/project';
  public microserviceDisablestatusChangeConfirmedResourceUrl =  '/api/editor/microservice-installer/statuschange/disable';
  public microserviceEnablestatusChangeConfirmedResourceUrl =  '/api/editor/microservice-installer/statuschange/enable';

  constructor(protected http: HttpClient) {}

  create(microservice: IInstalledMicroservice, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IInstalledMicroservice>(`${this.resourceUrl}/${uuid}`, microservice, { observe: 'response' });
  }

  update(microservice: IInstalledMicroservice, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IInstalledMicroservice>(`${this.resourceUrl}/${uuid}`, microservice, { observe: 'response' });
  }

  find(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.get<IInstalledMicroservice>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  query(req?: any, uuid?: string): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IInstalledMicroservice[]>(`${this.resourceUrl}/${uuid}`, { params: options, observe: 'response' });
  }

  findByProjectId(id: string, uuid: string): Observable<EntityArrayResponseType> {
    return this.http.get<IInstalledMicroservice[]>(`${this.projectresourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  delete(id: string, uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${uuid}/${id}`, { observe: 'response' });
  }

  disable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IInstalledMicroservice>(`${this.microserviceDisablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response'
    });
  }

  enable(id: string, uuid: string): Observable<EntityResponseType> {
    return this.http.put<IInstalledMicroservice>(`${this.microserviceEnablestatusChangeConfirmedResourceUrl}/${uuid}/${id}`, id, {
      observe: 'response'
    });
  }

  findMicroservices(uuid: string): Observable<HttpResponse<IMicroservice[]>> {
    return this.http.get<IMicroservice[]>(`${this.resourceUrl}/microservices/${uuid}`, { observe: 'response' });
  }

  install(microservice: IMicroservice, projectId: string, uuid: string): Observable<EntityResponseType> {
    return this.http.post<IMicroservice>(`${this.resourceUrl}/install/${uuid}/${projectId}`, microservice, { observe: 'response' });
  }

  loadwithApis(projectId: number, uuid: string): Observable<HttpResponse<IMicroservice[]>> {
    return this.http.get<IMicroservice[]>(`${this.resourceUrl}/api/project/${uuid}/${projectId}`, { observe: 'response' });
  }

  findApis(id: string, uuid: string): Observable<HttpResponse<string[]>> {
    return this.http.get<string[]>(`${this.resourceUrl}/apis/${uuid}/${id}`, { observe: 'response' });
  }
}
