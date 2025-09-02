import { Component } from '@angular/core';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [BurgerMenu],
  templateUrl: './create-campaign.html',
  styleUrl: './create-campaign.scss'
})
export class CreateCampaign {

}
