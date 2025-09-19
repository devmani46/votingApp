import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormArray,
  FormControl
} from '@angular/forms';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';
import { CampaignService } from '../../services/campaign';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignCard } from '../../components/campaign-card/campaign-card';

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FuiInput,
    Button,
    BurgerMenu,
    CampaignCard
  ],
  templateUrl: './create-campaign.html',
  styleUrls: ['./create-campaign.scss']
})
export class CreateCampaign implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private campaignService = inject(CampaignService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form!: FormGroup;
  editMode = false;
  campaignId: string | null = null;

  logoPreview: string | null = null;

  showDialog = false;
  editIndex: number | null = null;
  candidatePhotoPreview: string | null = null;

  nameControl = new FormControl('', Validators.required);
  bioControl = new FormControl('');
  propertyControl = new FormControl('');
  candidateProperties: string[] = [];

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      logo: [''],
          startDate: ['', Validators.required],
          endDate: ['', Validators.required],
      candidates: this.fb.array([])
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editMode = true;
        this.campaignId = id;
        const existing = this.campaignService.getCampaignById(id);

        if (existing) {
          this.form.patchValue({
            title: existing.title,
            description: existing.description,
            logo: existing.banner_url,
            startDate: existing.start_date,
            endDate: existing.end_date
          });
          this.logoPreview = existing.banner_url;

          existing.candidates.forEach(c => {
            this.candidates.push(
              this.fb.group({
                name: [c.name, Validators.required],
                bio: [c.bio],
                photo: [c.photo_url],
                properties: [[]]
              })
            );
          });
        }
      }
    });

    document.addEventListener('keydown', this.handleEsc);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEsc);
  }

  get candidates() {
    return this.form.get('candidates') as FormArray;
  }

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
        this.form.patchValue({ logo: this.logoPreview });
      };
      reader.readAsDataURL(file);
    }
  }

  openDialog(index: number | null = null) {
    this.showDialog = true;
    this.editIndex = index;

    if (index !== null) {
      const candidate = this.candidates.at(index).value;
      this.nameControl.setValue(candidate.name);
      this.bioControl.setValue(candidate.bio);
      this.candidatePhotoPreview = candidate.photo;
      this.candidateProperties = Array.isArray(candidate.properties)
        ? [...candidate.properties]
        : [];
    } else {
      this.nameControl.reset();
      this.bioControl.reset();
      this.propertyControl.reset();
      this.candidatePhotoPreview = null;
      this.candidateProperties = [];
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.editIndex = null;
      this.nameControl.reset();
      this.bioControl.reset();
      this.propertyControl.reset();
      this.candidatePhotoPreview = null;
      this.candidateProperties = [];
  }

  handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.showDialog) {
      this.closeDialog();
    }
  };

  closeDialogOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  onCandidatePhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.candidatePhotoPreview = reader.result as string;

        if (this.editIndex !== null) {
          this.candidates.at(this.editIndex).patchValue({
            photo: this.candidatePhotoPreview
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  addProperty() {
    if (this.propertyControl.value?.trim()) {
      this.candidateProperties.push(this.propertyControl.value.trim());
      this.propertyControl.reset('');
    }
  }

  removeProperty(index: number) {
    this.candidateProperties.splice(index, 1);
  }

  saveCandidate() {
    const candidate = {
      name: this.nameControl.value ?? '',
      bio: this.bioControl.value ?? '',
      photo: this.candidatePhotoPreview ?? '',
      properties: [...this.candidateProperties]
    };

    if (this.editIndex !== null) {
      this.candidates.at(this.editIndex).patchValue(candidate);
    } else {
      this.candidates.push(this.fb.group(candidate));
    }

    this.closeDialog();
  }

  deleteCandidate(index: number) {
    if (index !== null && index >= 0 && index < this.candidates.length) {
      this.candidates.removeAt(index);
    }
  }

async submitForm() {
  if (this.form.invalid) {
    console.error('Form is invalid:', this.form.errors);
    return;
  }

  console.log('Submitting form...');
  const formValue = this.form.value;
  const campaignData = {
    title: formValue.title,
    description: formValue.description,
    banner_url: formValue.logo || null,
    start_date: formValue.startDate,
    end_date: formValue.endDate
  };

  console.log('Campaign data:', campaignData);

  try {
    if (this.editMode && this.campaignId !== null) {
      console.log('Updating campaign:', this.campaignId);
      await this.campaignService.updateCampaign(this.campaignId, campaignData).toPromise();
      console.log('Update successful, navigating to campaign-status');
      this.router.navigate(['/campaign-status']);
    } else {
      console.log('Creating new campaign');
      const createdCampaign = await this.campaignService.addCampaign(campaignData).toPromise();
      console.log('Campaign created:', createdCampaign);

      // Add candidates after creating campaign
      if (!createdCampaign || !createdCampaign.id) {
        throw new Error('Created campaign is undefined or missing id');
      }
      for (const c of formValue.candidates) {
        await this.campaignService.addCandidate(createdCampaign.id, {
          name: c.name,
          bio: c.bio || null,
          photo_url: c.photo || null
        }).toPromise();
      }

      console.log('All candidates added, navigating to campaign-status');
      this.router.navigate(['/campaign-status']);
    }
  } catch (err) {
    console.error('Error during campaign create/update:', err);
  }
}
}
