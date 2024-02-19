import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JsonResponse } from '../../interfaces';
import {HttpServerService, MessagesService} from '../../utils';

import {RolContract, Users, UserTypes} from '../../models/users-model';
import {SchoolContract, SchoolModuleContract, Schools} from "../../models/school-contract";
import {LoadMaskService} from "../../core/common/load-mask.service";
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public hasRolListId = new Set<number>([4]);
  public schools        : Schools[] = [];
  public schoolModules  : SchoolModuleContract[] = [];
  constructor(
    private _http: HttpServerService,
    public mask: LoadMaskService,
    public msg: MessagesService,
  ){}
  
  resendEmail(id: number) {
    this.mask.showBlockUI();
    this._http.get(`/email/resend/${id}`)
      .subscribe({
        next: (resp: JsonResponse) => {
          this.mask.hideBlockUI();
          this.msg.toastMessage('', resp.message);
        },
        error: (err) => {
          this.mask.hideBlockUI();
          console.error(err);
          this.msg.toastMessage('', err, 3);
        }
      })
  }
    getSchoolModules(schoolId: number): void {
        if(this.schoolModules.length === 0) {
            this._http.get(`/school/system-modules`, {schoolId})
                .subscribe({
                    next: (resp: any) => {
                        this.schoolModules  = resp.records.data;
                        localStorage.setItem('schoolModules', JSON.stringify(this.schoolModules));
                    },
                    error: (err: any) => {
                        console.log(err);
                    }
                });
        }
    }
  getUserSchools(): void {
    if(this.schools.length === 0) {
        this._http.get('/user')
            .subscribe({
              next: (resp: any) => {
                this.schools  = resp.records.schools;
                this.schools  = this.schools.filter((school: Schools) => school.school.active);
                this.schools.forEach((school: Schools) => {
                  school.roles = school.roles.filter((role: RolContract) => this.hasRolListId.has(role.profile.id));
                });
              },
              error: (err: any) => {
                console.log(err);
              }
            });
    }
  }
  getUserTypes(): Observable<UserTypes[]> {
    const params  = {
      pdbTable: 'user_profiles',
      where: '{"active": 1}'
    }
    const ts  = this;
    return ts._http.get(`/index`, params)
      .pipe( map ( (resp: any ) => {
        return resp.records.data;
      }));
  }

  getProfile(): Observable<Users[]> {
    const ts  = this;
    return ts._http.get(`/user`)
      .pipe( map ( (resp: JsonResponse ) => {
        return resp.records;
      }));
  }

  getUserById(id: number, schoolId: number): Observable<Users[]> {
    const ts  = this;
    return ts._http.get(`/school/user/${id}?schoolId=${schoolId}`)
      .pipe( map ( (resp: JsonResponse ) => {
        return resp.dataRecords.data;
      }));
  }
    isRolAccess(): boolean {
        let visible = false;
        this.schools.forEach((school) => {
            school.roles.forEach((role) => {
                if(role.profile.id === 2) {
                    visible = true;
                }
            });
        });
        return visible;
    }

    get schoolList(): SchoolContract[] {
      let schools: SchoolContract[] = [];
        this.schools.forEach((school) => {
            school.roles.forEach((role) => {
                if(role.profile.id === 2) {
                    schools.push(school.school);
                }
            });
        });
      return schools;
    }
}
