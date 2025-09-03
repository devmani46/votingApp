import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FuiInput, Button, BurgerMenu],
  templateUrl: './create-campaign.html',
  styleUrls: ['./create-campaign.scss'],
})
export class CreateCampaign {
  form: FormGroup;

  candidateForm: FormGroup;
  propertyControl = new FormControl<string>('', { nonNullable: true });

  candidates: any[] = [];
  candidateProperties: string[] = [];

  showDialog = false;

  logoPreview: string | null = null;
  candidatePhotoPreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      logo: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });

    this.candidateForm = this.fb.group({
      name: ['', Validators.required],
      bio: [''],
      photo: [''],
    });
  }

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({ logo: file.name });

      const reader = new FileReader();
      reader.onload = () => (this.logoPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  openDialog() {
    this.showDialog = true;
    this.candidateForm.reset();
    this.candidatePhotoPreview = null;
    this.candidateProperties = [];
  }

  closeDialog() {
    this.showDialog = false;
  }

  onCandidatePhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.candidateForm.patchValue({ photo: file.name });

      const reader = new FileReader();
      reader.onload = () => (this.candidatePhotoPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  addProperty() {
    if (this.propertyControl.value?.trim()) {
      this.candidateProperties.push(this.propertyControl.value.trim());
      this.propertyControl.reset();
    }
  }

  saveCandidate() {
    if (this.candidateForm.valid) {
      this.candidates.push({
        ...this.candidateForm.value,
        photo: this.candidatePhotoPreview,
        properties: [...this.candidateProperties],
      });
      this.closeDialog();
    }
  }

  submitForm() {
    if (this.form.valid) {
      console.log('Campaign Data:', {
        ...this.form.value,
        candidates: this.candidates,
      });
      alert('Campaign submitted!');
    } else {
      this.form.markAllAsTouched();
    }
  }

  get nameControl(): FormControl<string> {
    return this.candidateForm.get('name') as FormControl<string>;
  }

  get bioControl(): FormControl<string> {
    return this.candidateForm.get('bio') as FormControl<string>;
  }
}
