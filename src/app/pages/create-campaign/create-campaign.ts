import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';
import { CampaignService } from '../../services/campaign';
import { Router } from '@angular/router';
import { CampaignCard } from '../../components/campaign-card/campaign-card';

interface Candidate {
  name: string;
  bio: string;
  photo: string;
  properties: string[];
}

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FuiInput,
    Button,
    BurgerMenu,
    CampaignCard,
  ],
  templateUrl: './create-campaign.html',
  styleUrls: ['./create-campaign.scss'],
})
export class CreateCampaign {
  private fb = inject(FormBuilder);
  private campaignService = inject(CampaignService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    logo: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  logoPreview: string | null = null;

  candidates: Candidate[] = [];
  showDialog = false;

  candidatePhotoPreview: string | null = null;
  nameControl = new FormControl('', Validators.required);
  bioControl = new FormControl('');
  propertyControl = new FormControl('');
  candidateProperties: string[] = [];

  editIndex: number | null = null;

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.logoPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  openDialog(candidateIndex: number | null = null) {
  this.showDialog = true;
  if (candidateIndex !== null) {
    this.editIndex = candidateIndex;
    const c = this.candidates[candidateIndex];
    this.nameControl.setValue(c.name);
    this.bioControl.setValue(c.bio);
    this.candidatePhotoPreview = c.photo;
    this.candidateProperties = [...c.properties];
  } else {
    this.editIndex = null;
    this.resetCandidateForm();
  }
}

deleteCandidate(index: number) {
  this.candidates.splice(index, 1);
}


  closeDialog() {
    this.showDialog = false;
    this.resetCandidateForm();
  }

  onCandidatePhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        (this.candidatePhotoPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  addProperty() {
    const prop = this.propertyControl.value?.trim();
    if (prop) {
      this.candidateProperties.push(prop);
      this.propertyControl.reset();
    }
  }

  removeProperty(index: number) {
    this.candidateProperties.splice(index, 1);
  }

  saveCandidate() {
    if (this.nameControl.invalid) return;

    const candidate: Candidate = {
      name: this.nameControl.value!,
      bio: this.bioControl.value || '',
      photo: this.candidatePhotoPreview || '/assets/default-user.png',
      properties: [...this.candidateProperties],
    };

    if (this.editIndex !== null) {
      this.candidates[this.editIndex] = candidate;
    } else {
      this.candidates.push(candidate);
    }

    this.closeDialog();
  }


  resetCandidateForm() {
    this.nameControl.reset();
    this.bioControl.reset();
    this.propertyControl.reset();
    this.candidateProperties = [];
    this.candidatePhotoPreview = null;
  }

  submitForm() {
    if (this.form.valid) {
      this.campaignService.addCampaign({
        title: this.form.value.title,
        description: this.form.value.description,
        logo: this.logoPreview,
        startDate: this.form.value.startDate,
        endDate: this.form.value.endDate,
        candidates: this.candidates,
      } as any);

      console.log('Campaigns after add:', this.campaignService.campaigns());
      this.router.navigate(['/campaign-status']);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
// --- IGNORE ---
