import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';

interface FileItem {
  file: { label: string; icon: string };
  author: { label: string; status: 'available' | 'busy' | 'away' | 'offline' };
  lastUpdated: { label: string; timestamp: number };
  lastUpdate: { label: string; icon: string };
}

@Component({
  selector: 'app-cdk-table',
  standalone: true,
  imports: [CommonModule, CdkTableModule],
  templateUrl: './cdk-table.html',
  styleUrls: ['./cdk-table.scss']
})

export class CdkTable {
  displayedColumns: string[] = ['file', 'author', 'lastUpdated', 'lastUpdate'];

  items: FileItem[] = [
    {
      file: { label: 'Meeting notes', icon: '📄' },
      author: { label: 'Max Mustermann', status: 'available' },
      lastUpdated: { label: '7h ago', timestamp: 1 },
      lastUpdate: { label: 'You edited this', icon: '✏️' }
    },
    {
      file: { label: 'Thursday presentation', icon: '📁' },
      author: { label: 'Erika Mustermann', status: 'busy' },
      lastUpdated: { label: 'Yesterday at 1:45 PM', timestamp: 2 },
      lastUpdate: { label: 'You recently opened this', icon: '📂' }
    },
    {
      file: { label: 'Training recording', icon: '🎥' },
      author: { label: 'John Doe', status: 'away' },
      lastUpdated: { label: 'Yesterday at 1:45 PM', timestamp: 2 },
      lastUpdate: { label: 'You recently opened this', icon: '📂' }
    },
    {
      file: { label: 'Purchase order', icon: '📑' },
      author: { label: 'Jane Doe', status: 'offline' },
      lastUpdated: { label: 'Tue at 9:30 AM', timestamp: 3 },
      lastUpdate: { label: 'You shared this in a Teams chat', icon: '👥' }
    }
  ];

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  getFileIcon(label: string): string {
    return this.items.find(i => i.file.label === label)?.file.icon || '📄';
  }

  getUpdateIcon(label: string): string {
    return this.items.find(i => i.lastUpdate.label === label)?.lastUpdate.icon || 'ℹ️';
  }
}
