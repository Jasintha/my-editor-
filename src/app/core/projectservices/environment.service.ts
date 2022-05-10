import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IApplicationReq,
  IEnvironment,
  IEnvironmentItem,
  IEnvironmentReq,
  IEnvironmentRuntime
} from '@shared/models/model/environment.model';
import {IConfigMap} from '@shared/models/model/configmap.model';
import {ISecret} from '@shared/models/model/secret.model';
import {createRequestOption} from '@shared/util/request-util';



type EntityResponseType = HttpResponse<IEnvironment>;
type ConfigMapResponseType = HttpResponse<IConfigMap>;
type ConfigMapArrayResponseType = HttpResponse<IConfigMap[]>;
type SecretResponseType = HttpResponse<ISecret>;
type SecretArrayResponseType = HttpResponse<ISecret[]>;
type EnvItemArrayResponseType = HttpResponse<IEnvironmentItem[]>;
type EnvRuntimeArrayResponseType = HttpResponse<IEnvironmentRuntime[]>;
type EntityArrayResponseType = HttpResponse<IEnvironment[]>;
type StringArrayResponseType = HttpResponse<string[]>;

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  public resourceUrl = '/api/editor/environments';
  public envresourceUrl = '/api/editor/environments/create';
  public depresourceUrl = '/api/editor';
  public zoneresourceUrl = '/api/editor/environments/zones';
  public pubkeyresourceUrl = '/api/editor/environments/pubkey';
  public machineTypesresourceUrl = '/api/editor/environments/machine-types';
  public solutionresourceUrl = '/api/editor/environments/solution';
  public environmentkeysResourceUrl = '/api/editor/environments/keys';
  public environmentsFileUploadResourceUrl = '/api/editor/environments/file-upload';

  environmentId: boolean;
  constructor(protected http: HttpClient) {}

  create(environment): Observable<EntityResponseType> {
    return this.http.post<IEnvironment>(this.resourceUrl, environment, { observe: 'response' });
  }

  createenv(environment): Observable<EntityResponseType> {
    return this.http.post<IEnvironment>(this.envresourceUrl, environment, { observe: 'response' });
  }

  createEnvFromReq(environment): Observable<EntityResponseType> {
    return this.http.post<IEnvironmentReq>(`${this.depresourceUrl}/deployerapi/create/env`, environment, { observe: 'response' });
  }

  update(environment: IEnvironment): Observable<EntityResponseType> {
    return this.http.put<IEnvironment>(this.resourceUrl, environment, { observe: 'response' });
  }

  updateEnvFromReq(environment: IEnvironmentReq): Observable<EntityResponseType> {
    return this.http.put<IEnvironmentReq>(this.resourceUrl, environment, { observe: 'response' });
  }

  createAppFromReq(environment): Observable<EntityResponseType> {
    return this.http.post<IApplicationReq>(`${this.depresourceUrl}/deployerapi/create/application`, environment, { observe: 'response' });
  }

  addEnvVariables(environment): Observable<EntityResponseType> {
    return this.http.post<IApplicationReq>(`${this.depresourceUrl}/deployerapi/create/envproperties`, environment, { observe: 'response' });
  }

  updateEnvVariables(environment): Observable<EntityResponseType> {
    const options = { envprop_uuid: environment.envuuid };
    return this.http.put<IApplicationReq>(`${this.depresourceUrl}/deployerapi/update/envproperties`, environment, {
      params: options,
      observe: 'response',
    });
  }

  updateAppFromReq(environment: IApplicationReq): Observable<EntityResponseType> {
    return this.http.put<IApplicationReq>(this.resourceUrl, environment, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IEnvironment>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<HttpResponse<IEnvironment[]>> {
    const options = createRequestOption(req);
    return this.http.get<IEnvironment[]>(`${this.depresourceUrl}/deployerapi/getall/env`, { params: options, observe: 'response' });
  }

  findAppsForEnv(id: string): Observable<HttpResponse<IApplicationReq[]>> {
    return this.http.get<IApplicationReq[]>(`${this.depresourceUrl}/deployerapi/getall/envapplications/${id}`, { observe: 'response' });
  }

  findForSolution(id: number): Observable<EntityArrayResponseType> {
    return this.http.get<IEnvironment[]>(`${this.solutionresourceUrl}/${id}`, { observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.depresourceUrl}/deployerapi/delete/env/${id}`, { observe: 'response' });
  }

  deleteApp(uuid: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.depresourceUrl}/deployerapi/delete/application/${uuid}`, { observe: 'response' });
  }

  setEnvironmentId(value: boolean) {
    this.environmentId = value;
  }
  getEnvironmentId(): boolean {
    return this.environmentId;
  }

  uploadEnvironmentsFile(data): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.environmentsFileUploadResourceUrl}`, data, { observe: 'response' });
  }

  findForProject(id: string): Observable<EntityArrayResponseType> {
    return this.http.get<IEnvironment[]>(`${this.resourceUrl}/project/${id}`, { observe: 'response' });
  }

  findZones(): Observable<EnvItemArrayResponseType> {
    return this.http.get<IEnvironmentItem[]>(this.zoneresourceUrl, { observe: 'response' });
  }

  findRuntimes(): Observable<EnvRuntimeArrayResponseType> {
    return this.http.get<IEnvironmentRuntime[]>(`${this.resourceUrl}/runtimes`, { observe: 'response' });
  }

  findDefaultRuntimes(): Observable<EnvRuntimeArrayResponseType> {
    return this.http.get<IEnvironmentRuntime[]>(`${this.resourceUrl}/default-runtimes`, { observe: 'response' });
  }

  findMachineTypes(): Observable<EnvItemArrayResponseType> {
    return this.http.get<IEnvironmentItem[]>(this.machineTypesresourceUrl, { observe: 'response' });
  }

  saveEnvForProject(env, id): Observable<EntityResponseType> {
    return this.http.put<IEnvironment>(`${this.resourceUrl}/project/${id}`, env, { observe: 'response' });
  }

  getPubKey(): Observable<HttpResponse<string>> {
    return this.http.get<string>(this.pubkeyresourceUrl, { observe: 'response' });
  }

  // Config Map
  addConfigMap(configMap): Observable<ConfigMapResponseType> {
    return this.http.post<IConfigMap>(`${this.depresourceUrl}/deployerapi/create/configmap`, configMap, { observe: 'response' });
  }

  getConfigMap(id: string): Observable<ConfigMapResponseType> {
    return this.http.get<IConfigMap>(`${this.depresourceUrl}/deployerapi/get/configmap/${id}`, { observe: 'response' });
  }

  getAllConfigMapsForNamespace(namespace: string): Observable<ConfigMapArrayResponseType> {
    return this.http.get<IConfigMap[]>(`${this.depresourceUrl}/deployerapi/getall/namespace/configmap/${namespace}`, {
      observe: 'response',
    });
  }

  getAllConfigMaps(): Observable<ConfigMapArrayResponseType> {
    return this.http.get<IConfigMap[]>(`${this.depresourceUrl}/deployerapi/getall/namespace/configmap`, {
      observe: 'response',
    });
  }

  geAllEnvs(envId): Observable<HttpResponse<string[]>> {
    const options = { envprop_uuid: envId };
    return this.http.get<string[]>(`${this.depresourceUrl}/deployerapi/get/envproperties`, {
      params: options,
      observe: 'response',
    });
  }

  // Secret
  addSecret(secret): Observable<SecretResponseType> {
    return this.http.post<ISecret>(`${this.depresourceUrl}/deployerapi/create/secret`, secret, { observe: 'response' });
  }

  getSecret(id: string): Observable<SecretResponseType> {
    return this.http.get<ISecret>(`${this.depresourceUrl}/deployerapi/get/secret/${id}`, { observe: 'response' });
  }

  getAllSecretsForNamespace(namespace: string): Observable<SecretArrayResponseType> {
    return this.http.get<ISecret[]>(`${this.depresourceUrl}/deployerapi/getall/namespace/secret/${namespace}`, { observe: 'response' });
  }

  getAllSecrets(): Observable<SecretArrayResponseType> {
    return this.http.get<ISecret[]>(`${this.depresourceUrl}/deployerapi/getall/namespace/secret`, { observe: 'response' });
  }
}
