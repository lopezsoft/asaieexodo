import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';

// --- Servicios Modernos Inyectados ---
import { ApiService } from '../api.service';
import {LoadMaskService} from "../common/load-mask.service";
import {MessagesService} from "../messages.service";
import {SchoolContract, SchoolModuleContract, Schools} from "../../models/school-contract";
import {StorageService} from "../storage.service";
import {Users, UserTypes} from "../../models/users-model";
import {AuthService} from "../auth.service";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private hasRolListId = new Set<number>([4, 5, 7]); // IDs de roles permitidos
  // --- Inyección de Dependencias ---
  private api = inject(ApiService);
  private mask = inject(LoadMaskService);
  private msg = inject(MessagesService);
  private storage = inject(StorageService);
  private authService = inject(AuthService);

  // --- Fuentes de Estado Reactivo (State) ---
  private schoolsSource = new BehaviorSubject<Schools[]>([]);
  public schools$ = this.schoolsSource.asObservable();

  private schoolModulesSource = new BehaviorSubject<SchoolModuleContract[]>([]);
  public schoolModules$ = this.schoolModulesSource.asObservable();

  // --- Selectores (Observables derivados del Estado) ---
  /**
   * Emite `true` si el usuario tiene un rol con ID 2.
   */
  public isRolAccess$: Observable<boolean> = this.schools$.pipe(
    map(schools => schools.some(school => school.roles.some(role => this.hasRolListId.has(role.profile.id))))
  );

  /**
   * Emite la lista de escuelas filtradas donde el usuario tiene el rol con ID 2.
   */
  public schoolList$: Observable<SchoolContract[]> = this.schools$.pipe(
    map(schools =>
      schools
        .filter(school => school.roles.some(role => this.hasRolListId.has(role.profile.id)))
        .map(school => school.school)
    )
  );

  constructor() {
    // Carga el estado inicial de los módulos desde el storage si existe
    const storedModules = this.storage.getItem<SchoolModuleContract[]>('schoolModules');
    if (storedModules) {
      this.schoolModulesSource.next(storedModules);
    }
  }

  // --- Métodos para Obtener Datos (Commands) ---

  /**
   * Obtiene las escuelas del usuario y actualiza el estado.
   * Utiliza cache simple para no volver a hacer la petición si ya hay datos.
   */
  fetchUserSchools(): Observable<Schools[]> {
    if (this.schoolsSource.getValue().length > 0) {
      return of(this.schoolsSource.getValue());
    }

    return this.api.get('/user').pipe(
      map((resp : any ) => {
        let schools: Schools[] = resp.records.schools;
        schools = schools.filter(school => school.school.active);
        schools.forEach(school => {
          school.roles = school.roles.filter(role => this.hasRolListId.has(role.profile.id));
        });
        return schools;
      }),
      tap(schools => this.schoolsSource.next(schools)),
      catchError(err => {
        // El interceptor ya muestra el error. Aquí solo prevenimos que el error rompa el flujo.
        console.error('Error fetching user schools:', err);
        return of([]); // Devuelve un array vacío para que la app no se rompa.
      })
    );
  }

  /**
   * Obtiene los módulos de una escuela y actualiza el estado.
   */
  fetchSchoolModules(schoolId: number): Observable<SchoolModuleContract[]> {
    if (this.schoolModulesSource.getValue().length > 0) {
      return of(this.schoolModulesSource.getValue());
    }

    return this.api.get('/school/system-modules', { schoolId }).pipe(
      map((resp: any) => resp.records.data),
      tap(modules => {
        this.schoolModulesSource.next(modules);
        this.storage.setItem('schoolModules', modules);
      }),
      catchError(err => {
        console.error('Error fetching school modules:', err);
        return of([]);
      })
    );
  }

  /**
   * Reenvía el email de verificación. Encapsula la lógica de UI.
   */
  resendEmail(id: number): Observable<any> {
    this.mask.show();
    return this.api.get(`/email/resend/${id}`).pipe(
      tap(resp => this.msg.showSuccess(resp.message)),
      // El interceptor se encarga de mostrar el toast en caso de error
      finalize(() => this.mask.hide())
    );
  }

  updateProfile(userId: number, formData: any): Observable<any> {
    const data = {
      records: JSON.stringify(formData),
    };
    return this.api.put(`/user/update/${userId}`, data).pipe(
      tap(response => {
        // Actualiza el estado del usuario en AuthService después de guardar
        const user = response.user;
        this.authService.updateCurrentUserState({
          avatar: user.avatar,
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        });
      })
    );
  }

  // --- Métodos de API Directos (devuelven observables sin afectar el estado del servicio) ---

  getUserTypes(): Observable<UserTypes[]> {
    const params = {
      pdbTable: 'user_profiles',
      where: '{"active": 1}'
    };
    return this.api.get('/index', params).pipe(
      map((resp: any) => resp.records.data)
    );
  }

  getProfile(): Observable<Users[]> {
    return this.api.get('/user').pipe(
      map(resp => resp.records)
    );
  }

  getUserById(id: number, schoolId: number): Observable<Users[]> {
    return this.api.get(`/school/user/${id}?schoolId=${schoolId}`).pipe(
      map(resp => resp.dataRecords.data)
    );
  }
}
