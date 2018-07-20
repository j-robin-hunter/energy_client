import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'soc'
})
export class SocPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value < 10) {
      return 'outline';
    } else {
      return Math.floor(value / 10) * 10;
    }
  }
}
