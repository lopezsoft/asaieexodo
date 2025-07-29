import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {isControlInvalid, markAllAsTouched} from '../../utils/form-validators';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import {ImageUploaderComponent} from "../../common/components/image-uploader/image-uploader.component";
import {UsersService} from "../../services/users/users.service";
import {AuthService} from "../../services/auth.service";
import {LoadMaskService} from "../../services/common/load-mask.service";
import {MessagesService} from "../../services/messages.service";
import {NgOptimizedImage, UpperCasePipe} from "@angular/common";
import {fallbackAvatarUrl} from "../../utils/utils";
import {FooterFormComponent} from "../../common/components/footer-form/footer-form.component";
import {UserActionsService} from "../../services/common/user-actions.service";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    ImageUploaderComponent,
    NgOptimizedImage,
    UpperCasePipe,
    FooterFormComponent,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  protected readonly fallbackAvatarUrl = fallbackAvatarUrl;
  protected readonly isControlInvalid = isControlInvalid;
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private maskService = inject(LoadMaskService);
  private msgService = inject(MessagesService);
  private userActionsService = inject(UserActionsService);

  profileForm: FormGroup;
  imgData: string | null = null;
  currentUser = this.authService.currentUser;

  constructor() {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(3)]],
      last_name: ['', [Validators.required, Validators.minLength(3)]],
      email: [''],
      imgdata: [''], // Campo para la imagen en base64
      imgname: ['']
    });
  }

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.setValue({
        first_name  : user.firstName,
        last_name   : user.lastName,
        email       : user.email,
        imgdata     : user.avatar || '', // Asignar avatar si existe
        imgname     : user.avatar ? user.avatar.split('/').pop() || '' : '' // Extraer el nombre del archivo
      });
      this.imgData = user.avatar;
    }
    this.usersService.getProfile()
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(userData => {
        const resp = userData[0];
        this.profileForm.setValue({
          first_name  : resp.first_name,
          last_name   : resp.last_name,
          email       : resp.email,
          imgdata     : resp.avatar || '', // Asignar avatar si existe
          imgname     : resp.avatar ? resp.avatar.split('/').pop() || '' : '' // Extraer el nombre del archivo
        });
        this.imgData = resp.avatar;
      });
  }

  onImageSelected(imageData: { base64: string, name: string }): void {
    this.imgData = imageData.base64;
    this.profileForm.patchValue({
      imgdata: imageData.base64,
      imgname: imageData.name
    });
    this.profileForm.markAsDirty(); // Marca el formulario como modificado
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.currentUser()) {
      markAllAsTouched(this.profileForm);
      return;
    }

    this.maskService.show('messages.saving');
    const userId = this.currentUser()!.id;

    this.usersService.updateProfile(userId, this.profileForm.value).pipe(
      finalize(() => this.maskService.hide())
    ).subscribe(() => {
      this.msgService.showSuccess('Perfil actualizado con éxito.');
      this.profileForm.markAsPristine(); // Resetea el estado "dirty"
    });
  }

  protected onCancel() {
    // Aquí puedes implementar la lógica para cancelar la edición del perfil
    // Por ejemplo, podrías recargar los datos del usuario actual
    this.profileForm.reset();
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue(user);
      this.imgData = user.avatar;
      this.userActionsService.goRoute('dashboard/profile');
    }
  }
}
