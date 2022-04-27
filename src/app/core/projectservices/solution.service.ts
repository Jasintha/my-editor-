import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ISolution } from '@app/shared/models/model/solution.model';
import {createRequestOption} from '@shared/util/request-util';



type EntityResponseType = HttpResponse<ISolution>;
type EntityArrayResponseType = HttpResponse<ISolution[]>;
type StringArrayResponseType = HttpResponse<string[]>;

@Injectable({ providedIn: 'root' })
export class SolutionService {
  public resourceUrl = 'api/editor/solutions';
  public solutionkeysResourceUrl = 'api/editor/solutions/keys';
  public solutionsFileUploadResourceUrl = 'api/editor/solutions/file-upload';

  solutionId: boolean;
  constructor(protected http: HttpClient) {}

  create(solution: ISolution): Observable<EntityResponseType> {
    return this.http.post<ISolution>(this.resourceUrl, solution, { observe: 'response' });
  }

  update(solution: ISolution): Observable<EntityResponseType> {
    return this.http.put<ISolution>(this.resourceUrl, solution, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ISolution>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISolution[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  setSolutionId(value: boolean) {
    this.solutionId = value;
  }
  getSolutionId(): boolean {
    return this.solutionId;
  }

  findSolutionMapKeys(req?: any): Observable<StringArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<string[]>(this.solutionkeysResourceUrl, { params: options, observe: 'response' });
  }

  uploadSolutionsFile(data): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.solutionsFileUploadResourceUrl}`, data, { observe: 'response' });
  }
}
