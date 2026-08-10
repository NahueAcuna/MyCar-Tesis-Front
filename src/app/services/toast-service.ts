import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private counter = 0;
  private toastSubject = new Subject<Toast>();

  toast$ = this.toastSubject.asObservable();

  show(message: string, type: Toast['type'] = 'info', duration: number = 3500) {
    this.toastSubject.next({
      id: ++this.counter,
      message,
      type,
      duration
    });
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration ?? 5000);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }
}
