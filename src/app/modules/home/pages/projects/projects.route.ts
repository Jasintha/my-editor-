import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from '@core/auth/user-route-access-service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Project } from '@shared/models/model/project.model';
import { ProjectsComponent } from './projects.component';
import { IProject } from '@shared/models/model/project.model';
import {ProjectService} from '@core/projectservices/project.service';

@Injectable({ providedIn: 'root' })
export class ArtifactsResolve implements Resolve<IProject> {
  constructor(private service: ProjectService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IProject> {
    const id = route.params.id;
    if (id) {
      return null;
    }
    return of(new Project());
  }
}

export const projectsRoute: Routes = [
  {
    path: 'projects',
    component: ProjectsComponent,
    data: {
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      pageTitle: 'Projects',
      breadcrumb: 'Projects',
    },
    canActivate: [UserRouteAccessService],
  },
];
