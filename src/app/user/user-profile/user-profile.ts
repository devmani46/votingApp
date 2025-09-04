import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfile {
  user: any = {};
  editMode = false;
  previewImage: string | ArrayBuffer | null = null;

  constructor(private router: Router) {
    const stored = localStorage.getItem('userData');
    this.user = stored
      ? JSON.parse(stored)
      : {
          firstName: 'Guest',
          lastName: '',
          username: '',
          email: '',
          image: 'https://i.pravatar.cc/150'
        };

    this.previewImage = this.user.image;
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  saveChanges() {
    localStorage.setItem('userData', JSON.stringify(this.user));
    this.editMode = false;
    alert('Profile updated successfully');
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
        this.user.image = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goBack() {
    this.router.navigate(['/user-page']);
  }
}
