import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
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
export class GsapCounterComponent implements OnInit, OnDestroy, OnChanges {
  @Input() target = 100;
  @Input() duration = 2; // seconds
  displayNumber = 0;
  private tween?: gsap.core.Tween;

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.startAnimation();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['target']) {
      this.startAnimation();
    }
  }

  private startAnimation() {
    this.tween?.kill();
    this.displayNumber = 0;
    this.tween = gsap.to(this, {
      displayNumber: this.target,
      duration: this.duration,
      ease: 'power3.out',
      onUpdate: () => {
        this.displayNumber = Math.floor(this.displayNumber);
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy() {
    this.tween?.kill();
  }
}


