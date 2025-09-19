import { Component, OnInit, inject, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';
import { Button } from '../../components/button/button';
import { FuiInput } from '../../components/fui-input/fui-input';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { CampaignService } from '../../services/campaign';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavBar, Button, FuiInput, CampaignCard],
  templateUrl: './user-page.html',
  styleUrls: ['./user-page.scss']
})
export class UserPage implements OnInit {
  private fb = inject(FormBuilder);
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);

  user: any = { photo: '', firstName: '', lastName: '', username: '', age: '', dob: '', email: '', bio: '' };
  form!: FormGroup;
  showDialog = false;
  photoPreview: string | null = null;
  selectedCampaign: any = null;
  winner: any = null;

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Map backend field names to frontend expectations
      this.user = {
        ...this.user,
        ...currentUser,
        firstName: currentUser.first_name || currentUser.firstName || '',
        lastName: currentUser.last_name || currentUser.lastName || '',
        photo: currentUser.photo_url || currentUser.photo || '/assets/admin.png'
      };
    }

    this.form = this.fb.group({
      firstName: [this.user.firstName || '', Validators.required],
      lastName: [this.user.lastName || '', Validators.required],
      username: [this.user.username || '', Validators.required],
      dob: [this.user.dob || '', Validators.required],
      email: [this.user.email || '', [Validators.required, Validators.email]],
      bio: [this.user.bio || ''],
      password: [''],
      confirmPassword: [''],
    });

    this.photoPreview = this.user.photo;
  }

  pastCampaigns = computed(() => {
    const campaigns = this.campaignService.campaigns();
    const today = new Date();
    return campaigns
      .filter(c => new Date(c.end_date) < today)
      .map(c => ({
        ...c,
        winner: this.campaignService.getWinner(c)
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

  getDrawNames(campaign: any): string {
    const winner = this.campaignService.getWinner(campaign);
    if (winner && winner.draw) {
      return winner.candidates.map((c: any) => c.name).join(', ');
    }
    return '';
  }

  openDialog() { this.showDialog = true; }
  closeDialog() { this.showDialog = false; }
  closeDialogOnBackdrop(event: MouseEvent) { if (event.target === event.currentTarget) this.closeDialog(); }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { this.photoPreview = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  updateAge() {
    const dob = this.form.value.dob;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      this.user.age = age;
    }
  }

  saveProfile() {
    if (this.form.invalid) return;
    if (this.form.value.password || this.form.value.confirmPassword) {
      if (this.form.value.password !== this.form.value.confirmPassword) {
        alert('Passwords do not match'); return;
      }
    }
    this.user = {
      ...this.user,
      ...this.form.value,
      photo: this.photoPreview || this.user.photo,
      age: this.user.age,
      password: this.form.value.password ? this.form.value.password : this.user.password,
    };
    this.authService.updateUser(this.user);
    this.form.patchValue({
      firstName: this.user.firstName, lastName: this.user.lastName,
      username: this.user.username, dob: this.user.dob,
      email: this.user.email, bio: this.user.bio,
      password: '', confirmPassword: ''
    });
    this.closeDialog();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.showDialog && event.key === 'Escape') this.closeDialog();
    if (this.selectedCampaign && event.key === 'Escape') this.closeCampaignDialog();
    if (this.showDialog && event.key === 'Enter') { event.preventDefault(); this.saveProfile(); }
  }
}
