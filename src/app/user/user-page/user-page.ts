import {
  Component,
  OnInit,
  inject,
  HostListener,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';
import { Button } from '../../components/button/button';
import { FuiInput } from '../../components/fui-input/fui-input';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { CampaignService } from '../../services/campaign';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { StorageService } from '../../services/storage';
import { NotificationBlock } from '../../components/notification-block/notification-block';
import { NotificationService, Notification } from '../../services/notification';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavBar,
    Button,
    FuiInput,
    CampaignCard,
    NotificationBlock,
  ],
  templateUrl: './user-page.html',
  styleUrls: ['./user-page.scss'],
})
export class UserPage implements OnInit {
  private fb = inject(FormBuilder);
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private storageService = inject(StorageService);

  user: any = {
    photo_url: '',
    first_name: '',
    last_name: '',
    username: '',
    age: '',
    dob: '',
    email: '',
    bio: '',
  };
  form!: FormGroup;
  showDialog = false;
  photoPreview: string | null = null;
  selectedCampaign: any = null;
  winner: any = null;
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.getNotifications().subscribe({
      next: (data) => (this.notifications = data),
      error: (err) => console.error('[Notifications Error]', err),
    });
    this.refreshUserData();
  }

  refreshUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.userService.getCurrentUser().subscribe({
        next: (freshUserData) => {
          this.user = {
            ...this.user,
            ...freshUserData,
            firstName: freshUserData.first_name || '',
            lastName: freshUserData.last_name || '',
            photo: freshUserData.photo_url || '/assets/admin.png',
          };
          if (this.user.dob) this.user.age = this.calculateAge(this.user.dob);
          this.authService.updateUser(this.user);
          this.initForm();
          this.photoPreview = this.user.photo;
        },
        error: () => {
          this.user = {
            ...this.user,
            ...currentUser,
            firstName: currentUser.first_name || currentUser.firstName || '',
            lastName: currentUser.last_name || currentUser.lastName || '',
            photo:
              currentUser.photo_url || currentUser.photo || '/assets/admin.png',
          };
          if (this.user.dob) this.user.age = this.calculateAge(this.user.dob);
          this.initForm();
          this.photoPreview = this.user.photo;
        },
      });
    } else if (currentUser) {
      this.user = {
        ...this.user,
        ...currentUser,
        firstName: currentUser.first_name || currentUser.firstName || '',
        lastName: currentUser.last_name || currentUser.lastName || '',
        photo:
          currentUser.photo_url || currentUser.photo || '/assets/admin.png',
      };
      if (this.user.dob) this.user.age = this.calculateAge(this.user.dob);
      this.initForm();
      this.photoPreview = this.user.photo;
    }
  }

  initForm() {
    this.form = this.fb.group({
      firstName: [this.user.firstName || '', Validators.required],
      lastName: [this.user.lastName || '', Validators.required],
      username: [this.user.username || '', Validators.required],
      dob: [this.formatDateForInput(this.user.dob) || '', Validators.required],
      email: [this.user.email || '', [Validators.required, Validators.email]],
      bio: [this.user.bio || ''],
      password: [''],
      confirmPassword: [''],
    });
  }

  pastCampaigns = computed(() => {
    const campaigns = this.campaignService.campaigns();
    const today = new Date();
    const currentUser = this.authService.getCurrentUser();
    const userEmail = currentUser?.email;
    if (!userEmail) return [];
    return campaigns
      .filter((c) => {
        const endDate = new Date(c.end_date);
        const hasEnded = endDate < today;
        const hasParticipated = this.storageService.hasVotedForCampaign(
          userEmail,
          c.id
        );
        return hasEnded && hasParticipated;
      })
      .map((c) => ({
        ...c,
        winner: this.campaignService.getWinner(c),
      }));
  });

  openCampaignDetails(campaign: any) {
    this.selectedCampaign = campaign;
    this.winner = campaign.winner || this.campaignService.getWinner(campaign);
  }

  closeCampaignDialog(event?: MouseEvent) {
    if (event && event.target !== event.currentTarget) return;
    this.selectedCampaign = null;
    this.winner = null;
  }

  getWinnerPhotoUrl(candidate: any): string {
    if (!candidate || !candidate.photo_url) return '/assets/admin.png';
    const url = candidate.photo_url.trim();
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/assets/${url}`;
  }

  getDrawNames(campaign: any): string {
    const winner = this.campaignService.getWinner(campaign);
    return winner && winner.draw
      ? winner.candidates.map((c: any) => c.name).join(', ')
      : '';
  }

  openDialog() {
    this.showDialog = true;
  }
  closeDialog() {
    this.showDialog = false;
  }
  closeDialogOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) this.closeDialog();
  }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.photoPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  updateAge() {
    const dob = this.form.value.dob;
    if (dob) {
      this.user.age = this.calculateAge(dob);
      this.form.patchValue({ dob });
    }
  }

  calculateAge(dob: string): number {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return Math.max(0, age);
  }

  formatDateForInput(isoDate: string | null | undefined): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  }

  formatDateForBackend(dateString: string | null | undefined): string | null {
    if (!dateString) return null;
    const date = new Date(dateString + 'T00:00:00.000Z');
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  saveProfile(event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (this.form.invalid) {
      alert('Please fill in all required fields correctly');
      return;
    }
    if (this.form.value.password && this.form.value.confirmPassword) {
      if (this.form.value.password !== this.form.value.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    const userData: any = {
      first_name: this.form.value.firstName,
      last_name: this.form.value.lastName,
      username: this.form.value.username,
      dob: this.formatDateForBackend(this.form.value.dob),
      email: this.form.value.email,
      bio: this.form.value.bio,
      photo_url: this.photoPreview || this.user.photo_url,
    };
    if (this.form.value.password) userData.password = this.form.value.password;

    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.userService.updateCurrentUser(userData).subscribe({
        next: (updatedUser) => {
          this.userService.updateUserInBothServices({
            ...userData,
            firstName: userData.first_name,
            lastName: userData.last_name,
            photo: userData.photo_url,
          });
          this.user = {
            ...this.user,
            ...updatedUser,
            firstName: updatedUser.first_name || '',
            lastName: updatedUser.last_name || '',
            photo: updatedUser.photo_url || '/assets/admin.png',
          };
          this.initForm();
          window.dispatchEvent(
            new CustomEvent('userProfileUpdated', {
              detail: { user: updatedUser },
            })
          );
          this.closeDialog();
        },
        error: () => {
          this.userService.updateUserInBothServices({
            ...userData,
            firstName: userData.first_name,
            lastName: userData.last_name,
            photo: userData.photo_url,
          });
          this.user = {
            ...this.user,
            ...userData,
            firstName: userData.first_name,
            lastName: userData.last_name,
            photo: userData.photo_url,
          };
          this.initForm();
          this.closeDialog();
        },
      });
    } else {
      this.user = {
        ...this.user,
        ...this.form.value,
        photo_url: this.photoPreview || this.user.photo_url,
        age: this.user.age,
        password: this.form.value.password || this.user.password,
      };
      this.authService.updateUser(this.user);
      this.initForm();
      this.closeDialog();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.showDialog && event.key === 'Escape') this.closeDialog();
    if (this.selectedCampaign && event.key === 'Escape')
      this.closeCampaignDialog();
    if (this.showDialog && event.key === 'Enter') {
      event.preventDefault();
      this.saveProfile();
    }
  }
}
