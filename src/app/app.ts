import { AfterViewInit, Component, NgZone, OnDestroy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Lenis from 'lenis';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy{
  protected readonly title = signal('tesis-Front');
  private lenis: any;
  private reqId: any;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        duration: 1.3, 
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      const raf = (time: number) => {
        this.lenis.raf(time);
        this.reqId = requestAnimationFrame(raf);
      };

      this.reqId = requestAnimationFrame(raf);
    });
  }

  ngOnDestroy(): void {
    if (this.lenis) {
      this.lenis.destroy();
    }
    if (this.reqId) {
      cancelAnimationFrame(this.reqId);
    }
  }
}
