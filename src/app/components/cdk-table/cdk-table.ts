import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';

interface UserItem {
  username: string;
  email: string;
  joinDate: string;
  session: string;
}

@Component({
  selector: 'app-cdk-table',
  standalone: true,
  imports: [CommonModule, CdkTableModule],
  templateUrl: './cdk-table.html',
  styleUrls: ['./cdk-table.scss']
})

export class CdkTable {
  @Input() items: UserItem[] = [];
  displayedColumns: string[] = ['username', 'email', 'joinDate', 'session', 'actions'];
}
