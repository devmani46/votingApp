import {Component,Input,Output,EventEmitter,ElementRef,OnDestroy,HostListener,ViewChildren,QueryList,AfterViewInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-combobox',
  imports: [CommonModule, FormsModule],
  templateUrl: './combobox.html',
  styleUrls: ['./combobox.scss']
})
export class Combobox implements OnDestroy, AfterViewInit {
  @Input() options: string[] = [];
  @Input() placeholder: string = 'Select options';
  @Input() searchable: boolean = true;
  @Input() disabledOptions: string[] = [];
  @Input() multiple: boolean = true;
  @Input() disabled: boolean = false;


  @Output() valueChange = new EventEmitter<string[] | string>();

  searchText: string = '';
  isOpen: boolean = false;

  selected: string[] = [];
  highlightedIndex: number = -1;

  @ViewChildren('optionItem') optionItems!: QueryList<ElementRef>;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.optionItems.changes.subscribe(() => {
      this.scrollHighlightedIntoView();
    });
  }

  get filteredOptions(): string[] {
    if (!this.searchable || !this.searchText.trim()) return this.options;
    return this.options.filter(o =>
      o.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  get displayPlaceholder(): string {
    if (this.selected.length === 0) return this.placeholder;

    if (!this.multiple) {
      return this.selected[0];
    }

    const max = 30;
    let result = '';
    for (let i = 0; i < this.selected.length; i++) {
      const next = (result ? ', ' : '') + this.selected[i];
      if ((result + next).length > max) {
        result += '...';
        break;
      }
      result += next;
    }
    return result;
  }

  openDropdown(): void {
    if (this.disabled) return;
    this.isOpen = true;
    this.highlightedIndex = -1;
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.highlightedIndex = -1;
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.highlightedIndex = -1;
  }

  selectOption(option: string): void {
    if (this.disabled || this.disabledOptions.includes(option)) return;

    if (this.multiple) {
      const index = this.selected.indexOf(option);
      if (index === -1) {
        this.selected.push(option);
      } else {
        this.selected.splice(index, 1);
      }
      this.valueChange.emit([...this.selected]);
    } else {
      if (this.selected[0] === option) {
        this.selected = [];
        this.valueChange.emit('');
      } else {
        this.selected = [option];
        this.valueChange.emit(option);
      }
      this.closeDropdown();
    }
  }

  onInputChange(value: string) {
    this.searchText = value;
    if (!this.isOpen) {
      this.openDropdown();
    }
  }

  isDisabled(option: string): boolean {
    return this.disabledOptions.includes(option);
  }

  isSelected(option: string): boolean {
    return this.selected.includes(option);
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: EventTarget | null) {
    if (
      this.isOpen &&
      target instanceof HTMLElement &&
      !this.elementRef.nativeElement.contains(target)
    ) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) return;

    const options = this.filteredOptions;

    switch (event.key) {
      case 'ArrowDown':
        this.highlightedIndex = (this.highlightedIndex + 1) % options.length;
        this.scrollHighlightedIntoView();
        break;

      case 'ArrowUp':
        this.highlightedIndex =
          this.highlightedIndex > 0
            ? this.highlightedIndex - 1
            : options.length - 1;
        this.scrollHighlightedIntoView();
        break;

      case 'Enter':
        if (this.highlightedIndex >= 0 && this.highlightedIndex < options.length) {
          this.selectOption(options[this.highlightedIndex]);
        }
        break;

      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  scrollHighlightedIntoView() {
      const items = this.optionItems.toArray();
      if (items[this.highlightedIndex]) {
        items[this.highlightedIndex].nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
  }

  ngOnDestroy(): void {
    this.closeDropdown();
  }
}
