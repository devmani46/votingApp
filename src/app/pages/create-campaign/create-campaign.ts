import { Component, HostListener, inject, signal, computed, effect } from '@angular/core';
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
export class CreateCampaign {
  private fb = inject(FormBuilder);
  private campaignService = inject(CampaignService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    logo: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    candidates: this.fb.array([])
  });

  editMode = signal(false);
  campaignId = signal<string | null>(null);

  logoPreview = signal<string | null>(null);
  showDialog = signal(false);
  editIndex = signal<number | null>(null);
  candidatePhotoPreview = signal<string | null>(null);

  nameControl = new FormControl('', Validators.required);
  bioControl = new FormControl('');

  readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  candidates = computed(() => this.form.get('candidates') as FormArray);

  headerTitle = computed(() => (this.editMode() ? 'Edit Campaign' : 'Create Campaign'));
  submitButtonLabel = computed(() => (this.editMode() ? 'Update Campaign' : 'Create Campaign'));
  dialogTitle = computed(() =>
    this.editIndex() !== null ? 'Edit Candidate' : 'Add Candidate'
  );

  constructor() {
    effect(() => {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.editMode.set(true);
          this.campaignId.set(id);
          const existing = this.campaignService.getCampaignById(id);

          if (existing) {
            this.form.patchValue({
              title: existing.title,
              description: existing.description,
              logo: existing.banner_url,
              startDate: this.formatDateForInput(existing.start_date),
              endDate: this.formatDateForInput(existing.end_date)
            });
            this.logoPreview.set(existing.banner_url);

            existing.candidates.forEach(c => {
              this.candidates().push(
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
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleEsc(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.showDialog()) {
      this.closeDialog();
    }
  }

  private formatDateForInput(isoDate: string): string {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  private validateFileSize(file: File): boolean {
    if (file.size > this.MAX_FILE_SIZE) {
      alert(`File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return false;
    }
    return true;
  }

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.validateFileSize(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.logoPreview.set(result);
        this.form.patchValue({ logo: result });
      };
      reader.readAsDataURL(file);
    }
  }

  openDialog(index: number | null = null) {
    this.showDialog.set(true);
    this.editIndex.set(index);

    if (index !== null) {
      const candidate = this.candidates().at(index).value;
      this.nameControl.setValue(candidate.name);
      this.bioControl.setValue(candidate.bio);
      this.candidatePhotoPreview.set(candidate.photo);
    } else {
      this.nameControl.reset();
      this.bioControl.reset();
      this.candidatePhotoPreview.set(null);
    }
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editIndex.set(null);
    this.nameControl.reset();
    this.bioControl.reset();
    this.candidatePhotoPreview.set(null);
  }

  closeDialogOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  onCandidatePhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.validateFileSize(file)) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.candidatePhotoPreview.set(result);
        if (this.editIndex() !== null) {
          this.candidates().at(this.editIndex()!).patchValue({ photo: result });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  saveCandidate() {
    const candidate = {
      name: this.nameControl.value ?? '',
      bio: this.bioControl.value ?? '',
      photo: this.candidatePhotoPreview() ?? ''
    };

    if (this.editIndex() !== null) {
      this.candidates().at(this.editIndex()!).patchValue(candidate);
    } else {
      this.candidates().push(this.fb.group(candidate));
    }

    this.closeDialog();
  }

  async deleteCandidate(index: number) {
    if (this.editMode() && this.campaignId() && index >= 0 && index < this.candidates().length) {
      const candidate = this.candidates().at(index).value;
      if (candidate.id) {
        try {
          await this.campaignService.deleteCandidate(this.campaignId()!, candidate.id).toPromise();
          this.candidates().removeAt(index);
        } catch {}
      } else {
        this.candidates().removeAt(index);
      }
    } else {
      this.candidates().removeAt(index);
    }
  }

  onCandidateDelete(candidateId: string) {
    const index = parseInt(candidateId);
    this.deleteCandidate(index);
  }

  async submitForm() {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const campaignData = {
      title: formValue.title as string,
      description: formValue.description as string,
      banner_url: formValue.logo as string | null,
      start_date: formValue.startDate as string,
      end_date: formValue.endDate as string
    };

    try {
      if (this.editMode() && this.campaignId() !== null) {
        await this.campaignService.updateCampaign(this.campaignId()!, campaignData).toPromise();

        const existingCampaign = this.campaignService.getCampaignById(this.campaignId()!);
        if (existingCampaign) {
          const existingCandidates = existingCampaign.candidates || [];
          const formCandidates = (formValue.candidates || []) as { id?: string; name: string; bio?: string; photo?: string }[];

          for (const existingCandidate of existingCandidates) {
            if (!formCandidates.find((c) => c.id === existingCandidate.id)) {
              await this.campaignService.deleteCandidate(this.campaignId()!, existingCandidate.id).toPromise();
            }
          }

          for (const c of formCandidates) {
            if (c.id) {
              await this.campaignService.updateCandidate(this.campaignId()!, c.id, {
                name: c.name,
                bio: c.bio || '',
                photo_url: c.photo || ''
              }).toPromise();
            } else {
              await this.campaignService.addCandidate(this.campaignId()!, {
                name: c.name,
                bio: c.bio || '',
                photo_url: c.photo || ''
              }).toPromise();
            }
          }
        }

        this.campaignService.refreshCampaigns();
        this.router.navigate(['/campaign-status']);
      } else {
        const createdCampaign = await this.campaignService.addCampaign(campaignData).toPromise();
        if (!createdCampaign || !createdCampaign.id) throw new Error('Missing ID');
        for (const c of (formValue.candidates || []) as { id?: string; name: string; bio?: string; photo?: string }[]) {
          await this.campaignService.addCandidate(createdCampaign.id, {
            name: c.name,
            bio: c.bio || '',
            photo_url: c.photo || ''
          }).toPromise();
        }
        this.campaignService['loadCampaigns']();
        this.router.navigate(['/campaign-status']);
      }
    } catch {}
  }
}
