import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
// import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ThemeService } from './theme.service';
import { ThemeComponent } from './theme.component';
import { ThemeDetailComponent } from './theme-detail.component';
import { ThemeUpdateComponent } from './theme-update.component';
import { ThemeDeletePopupComponent } from './theme-delete-dialog.component';
import { ITheme, Theme } from '@shared/models/model/theme.model';

@Injectable({ providedIn: 'root' })
export class ThemeResolve implements Resolve<ITheme> {
  constructor(private service: ThemeService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ITheme> {
    const id = route.params['id'];
    const projectUid = route.params['projectUid'];
    if (id) {
      return this.service.find(id, projectUid).pipe(
        filter((response: HttpResponse<Theme>) => response.ok),
        map((theme: HttpResponse<Theme>) => theme.body)
      );
    }
    return of(new Theme());
  }
}

export const themeRoute: Routes = [
  {
    path: '',
    component: ThemeComponent,
    data: {
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      pageTitle: 'Theme',
      breadcrumb: 'Theme',
    },
   // canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/theme',
    component: ThemeDetailComponent,
    resolve: {
      theme: ThemeResolve,
    },
    data: {
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      pageTitle: 'Theme Details',
      breadcrumb: 'Theme > Theme Details',
    },
   // canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ThemeUpdateComponent,
    resolve: {
      theme: ThemeResolve,
    },
    data: {
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      pageTitle: 'Create Theme',
      breadcrumb: 'Theme > Create Theme',
    },
  //  canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ThemeUpdateComponent,
    resolve: {
      theme: ThemeResolve,
    },
    data: {
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      pageTitle: 'Edit Theme',
      breadcrumb: 'Theme > Edit Theme',
    },
    // canActivate: [UserRouteAccessService],
  },
  {
    path: 'proj/:projectUid',
    component: ThemeComponent,
    data: {
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      pageTitle: 'Theme',
      breadcrumb: 'Theme ',
    },
   // canActivate: [UserRouteAccessService],
  },
  {
    path: 'proj/:projectUid/:id/theme',
    component: ThemeDetailComponent,
    resolve: {
      theme: ThemeResolve,
    },
    data: {
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      pageTitle: 'Theme',
      breadcrumb: 'Theme',
    },
   // canActivate: [UserRouteAccessService],
  },
  {
    path: 'proj/:projectUid/new',
    component: ThemeUpdateComponent,
    resolve: {
      theme: ThemeResolve,
    },
    data: {
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      pageTitle: 'Create Theme',
      breadcrumb: 'Theme > Create Theme',
    },
  //  canActivate: [UserRouteAccessService],
  },
  {
    path: 'proj/:projectUid/:id/edit',
    component: ThemeUpdateComponent,
    resolve: {
      theme: ThemeResolve,
    },
    data: {
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      pageTitle: 'Edit Theme',
      breadcrumb: 'Theme > Edit Theme',
    },
   // canActivate: [UserRouteAccessService],
  },
];

export const themePopupRoute: Routes = [
  {
    path: ':id/delete',
    component: ThemeDeletePopupComponent,
    resolve: {
      theme: ThemeResolve,
    },
    data: {
      authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      pageTitle: 'Delete Theme',
      breadcrumb: 'Theme > Delete Theme',
    },
  //  canActivate: [UserRouteAccessService],
    outlet: 'popup',
  },
];
