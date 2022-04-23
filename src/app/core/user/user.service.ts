// import { Injectable } from '@angular/core';
// import { HttpClient, HttpResponse } from '@angular/common/http';
// import { Observable } from 'rxjs';
//
// import { SERVER_API_URL } from 'app/app.constants';
// import { createRequestOption } from 'app/shared/util/request-util';
// import { IUser, IUserDetails } from './user.model';
//
// @Injectable({ providedIn: 'root' })
// export class UserService {
//   public resourceUrl = SERVER_API_URL + 'api/users';
//
//   constructor(private http: HttpClient) {}
//
//   create(user: IUser): Observable<HttpResponse<IUser>> {
//     return this.http.post<IUser>(this.resourceUrl, user, { observe: 'response' });
//   }
//
//   update(user: IUser): Observable<HttpResponse<IUser>> {
//     return this.http.put<IUser>(this.resourceUrl, user, { observe: 'response' });
//   }
//
//   find(login: string): Observable<HttpResponse<IUser>> {
//     return this.http.get<IUser>(`${this.resourceUrl}/${login}`, { observe: 'response' });
//   }
//
//   query(req?: any): Observable<HttpResponse<IUser[]>> {
//     const options = createRequestOption(req);
//     return this.http.get<IUser[]>(this.resourceUrl, { params: options, observe: 'response' });
//   }
//
//   delete(login: string): Observable<HttpResponse<any>> {
//     return this.http.delete(`${this.resourceUrl}/${login}`, { observe: 'response' });
//   }
//
//   authorities(): Observable<string[]> {
//     return this.http.get<string[]>(SERVER_API_URL + 'api/users/authorities');
//   }
//
//   findById(id: number): Observable<HttpResponse<IUser>> {
//     return this.http.get<IUser>(`${this.resourceUrl}/${id}`, { observe: 'response' });
//   }
//
//   deleteById(id: number): Observable<HttpResponse<any>> {
//     return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
//   }
//
//   resetpassword(user: any): Observable<HttpResponse<any>> {
//     return this.http.put<any>(`${this.resourceUrl}/reset-pw`, user, { observe: 'response' });
//   }
//
//   getUserDetails(req?: any): Observable<HttpResponse<IUserDetails[]>> {
//     const options = createRequestOption(req);
//     return this.http.get<IUserDetails[]>(this.resourceUrl + '/details', { params: options, observe: 'response' });
//   }
//
//   updateUserStatus(id: number, status: boolean): Observable<HttpResponse<any>> {
//     return this.http.put<any>(`${this.resourceUrl}/${id}/${status}`, ``, { observe: 'response' });
//   }
// }
