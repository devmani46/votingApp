import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import gsap from 'gsap';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-gsap-counter-component',
  imports: [DecimalPipe],
  templateUrl: './gsap-counter-component.html',
  styleUrl: './gsap-counter-component.scss',
})
export class GsapCounterComponent implements OnInit, OnDestroy {
  @Input() target = 100;
  @Input() duration = 2; // seconds
  displayNumber = 0;
  private tween?: gsap.core.Tween;

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.displayNumber = 0;
    this.tween = gsap.to(this, {
      displayNumber: this.target,
      duration: this.duration,
      ease: 'power3.out',
      onUpdate: () => {
        this.displayNumber = Math.floor(this.displayNumber);
        this.cdr.detectChanges(); // <-- This triggers Angular to update the view
      },
    });
  }

  ngOnDestroy() {
    this.tween?.kill();
  }
}
