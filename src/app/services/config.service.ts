import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';

@Injectable()
export class ConfigService {
  apollo: Apollo;

  constructor(apollo: Apollo) {
    this.apollo = apollo;
  }

  load(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`inside promise`);

      setTimeout(() => {
        console.log(`inside setTimeout`);
        // doing something
        // ...

        resolve();
      }, 50);
    });
  }
}
