import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messageSubject: Subject<string>;

  get onToastMessage$(): Observable<string> {
    return this.messageSubject.asObservable();
  }

  constructor() {
    this.messageSubject = new Subject<string>();
  }

  toastMessage(message: string) {
    this.messageSubject.next(<string>message);
  }
}
