import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector : 'app-root',
  standalone : true,
  imports : [RouterOutlet],
  templateUrl : './app.component.html',
  styleUrls : ['/src/styles.css','./app.component.css'] // To enable global styles in all standalone components
})
export class AppComponent {
  title = 'WebAtrio';
}
