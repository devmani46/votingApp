import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';
import { CampaignService } from '../../services/campaign';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FuiInput, Button, BurgerMenu],
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

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.logoPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

    submitForm() {
      if (this.form.valid) {
        this.campaignService.addCampaign({
          title: this.form.value.title,
          description: this.form.value.description,
          logo: this.logoPreview,
          startDate: this.form.value.startDate,
          endDate: this.form.value.endDate,
        });

        console.log('Campaigns after add:', this.campaignService.campaigns());

        this.router.navigate(['/campaign-status']);
      } else {
        this.form.markAllAsTouched();
      }
    }
}
