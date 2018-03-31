import { Component } from '@angular/core';

/**
 * Custom clock widget to display the current date and time
 */
@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css'],
})
export class ClockComponent {
  date = '';
  time = '';

  constructor() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  private updateClock(): void {
    const days: string[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Monday',
      'Monday',
      'Monday',
    ];
    const months: string[] = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const date: Date = new Date();
    const hourString = this.getString(date.getHours());
    const minuteString = this.getString(date.getMinutes());
    const secondString = this.getString(date.getSeconds());
    this.date = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
    this.time = hourString + ':' + minuteString + ':' + secondString;
  }

  /**
   * Converts a number into a string, zero padding if necessary/
   * @param num Number to be converted into string.
   */
  private getString(num: number): string {
    if (num < 10) {
      return '0' + num.toString();
    }
    return num.toString();
  }
}
