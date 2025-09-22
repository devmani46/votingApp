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

  // File size limit in bytes (5MB)
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Utility function to convert ISO date to YYYY-MM-DD format for HTML date inputs
  private formatDateForInput(isoDate: string): string {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      // Check if date is valid
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  // Utility function to validate file size
  private validateFileSize(file: File): boolean {
    if (file.size > this.MAX_FILE_SIZE) {
      alert(`File size exceeds the maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB. Please choose a smaller file.`);
      return false;
    }
    return true;
  }

  // Utility function to format file size for display
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

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
            startDate: this.formatDateForInput(existing.start_date),
            endDate: this.formatDateForInput(existing.end_date)
          });
          this.logoPreview = existing.banner_url;

          existing.candidates.forEach(c => {
            this.candidates.push(
              this.fb.group({
                id: [c.id],
                name: [c.name, Validators.required],
                bio: [c.bio],
                photo: [c.photo_url]
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
      if (!this.validateFileSize(file)) {
        // Clear the file input
        (event.target as HTMLInputElement).value = '';
        return;
      }

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
    } else {
      this.nameControl.reset();
      this.bioControl.reset();
      this.candidatePhotoPreview = null;
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.editIndex = null;
      this.nameControl.reset();
      this.bioControl.reset();
      this.candidatePhotoPreview = null;
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
      if (!this.validateFileSize(file)) {
        // Clear the file input
        (event.target as HTMLInputElement).value = '';
        return;
      }

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



  saveCandidate() {
    const candidate = {
      name: this.nameControl.value ?? '',
      bio: this.bioControl.value ?? '',
      photo: this.candidatePhotoPreview ?? ''
    };

    if (this.editIndex !== null) {
      this.candidates.at(this.editIndex).patchValue(candidate);
      console.log('Updated candidate at index', this.editIndex, ':', this.candidates.at(this.editIndex).value);
    } else {
      this.candidates.push(this.fb.group(candidate));
      console.log('Added new candidate:', candidate);
    }

    this.closeDialog();
  }

  async deleteCandidate(index: number) {
    if (this.editMode && this.campaignId && index >= 0 && index < this.candidates.length) {
      const candidate = this.candidates.at(index).value;
      if (candidate.id) {
        try {
          await this.campaignService.deleteCandidate(this.campaignId, candidate.id).toPromise();
          this.candidates.removeAt(index);
        } catch (error) {
          console.error('Failed to delete candidate:', error);
        }
      } else {
        this.candidates.removeAt(index);
      }
    } else {
      this.candidates.removeAt(index);
    }
  }

  onCandidateDelete(candidateId: string) {
    const index = parseInt(candidateId);
    this.deleteCandidate(index);
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

        // Update candidates
        const existingCampaign = this.campaignService.getCampaignById(this.campaignId);
        if (existingCampaign) {
          const existingCandidates = existingCampaign.candidates || [];
          const formCandidates = formValue.candidates || [];

          // Delete removed candidates
          for (const existingCandidate of existingCandidates) {
            if (!formCandidates.find((c: any) => c.id === existingCandidate.id)) {
              await this.campaignService.deleteCandidate(this.campaignId, existingCandidate.id).toPromise();
            }
          }

          // Add or update candidates
          for (const c of formCandidates) {
            if (c.id) {
              // Update existing candidate
              await this.campaignService.updateCandidate(this.campaignId, c.id, {
                name: c.name,
                bio: c.bio || null,
                photo_url: c.photo || null
              }).toPromise();
            } else {
              // Add new candidate
              await this.campaignService.addCandidate(this.campaignId, {
                name: c.name,
                bio: c.bio || null,
                photo_url: c.photo || null
              }).toPromise();
            }
          }
        }

        console.log('Update successful, refreshing campaigns and navigating to campaign-status');
        this.campaignService.refreshCampaigns(); // refresh campaigns list
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

        console.log('All candidates added, refreshing campaigns and navigating to campaign-status');
        this.campaignService['loadCampaigns'](); // refresh campaigns list
        this.router.navigate(['/campaign-status']);
      }
    } catch (err) {
      console.error('Error during campaign create/update:', err);
    }
  }
}
