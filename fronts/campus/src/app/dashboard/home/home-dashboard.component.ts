import {Component, inject} from '@angular/core';
import {SHARED_IMPORTS} from "../../shared/shared-imports";
import {UsersService} from "../../services/users/users.service";
import {AuthService} from "../../services/auth.service";
import {LoadMaskService} from "../../services/common/load-mask.service";
import {SchoolContract} from "../../models/school-contract";
import {RolContract} from "../../models/users-model";
import {finalize} from "rxjs";

@Component({
  selector: 'app-home',
  imports: [
    ...SHARED_IMPORTS,
    // Assuming SHARED_IMPORTS is defined elsewhere
  ],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.scss'
})
export class HomeDashboardComponent {
// Inyección de dependencias limpia
  public userService = inject(UsersService);
  protected authService = inject(AuthService);
  private maskService = inject(LoadMaskService);

  ngOnInit(): void {
    this.userService.fetchUserSchools().subscribe();
  }

  clickOnModule(school: SchoolContract, role: RolContract): void {
    this.maskService.show('messages.loadingModule'); // Muestra el bloqueo

    this.authService.setActiveSchool(school, role).pipe(
      finalize(() => this.maskService.hide()) // Oculta el bloqueo al finalizar
    ).subscribe({
      next: () => {
        // Redirige a la URL del módulo activo
      }
    });
  }
}
