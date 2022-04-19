import { Injectable } from '@angular/core';
import { Subject, Subscription, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap, filter } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { defaultHttpOptions } from '../http/http-utils';


@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private http: HttpClient
  ) {
  }

  findAllProjectComponents(): Observable<any[]> {
    return this.http.get<any[]>(`/api/editor/projects/components`, defaultHttpOptions());
  }

}
