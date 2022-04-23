import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from '@app/app.constants';
import { createRequestOption } from './request-util';
import { IProject } from '@shared/models/model/project.model';

type EntityArrayResponseType = HttpResponse<IProject[]>;

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  public loadArtifactsUrl = SERVER_API_URL + 'upapi/epics/project/artifacts';

  constructor(protected http: HttpClient) {}

  loadAllArtifacts(uuid: string, req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProject[]>(`${this.loadArtifactsUrl}/${uuid}`, { params: options, observe: 'response' });
  }
}
