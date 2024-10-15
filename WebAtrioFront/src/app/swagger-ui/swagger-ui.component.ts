import { Component, OnInit } from '@angular/core';
import { SwaggerUiService } from './swagger-ui.service';

@Component({
  selector : 'app-swagger-ui',
  standalone : true,
  imports : [],
  templateUrl : './swagger-ui.component.html',
  styleUrl: './swagger-ui.component.css'
})
export class SwaggerUiComponent implements OnInit {
  constructor(private swaggerUiService : SwaggerUiService) { }

  ngOnInit() {
    this.swaggerUiService.getConfigValue('FLASK_RUN_PORT').subscribe(port => {
      if (port) {
        window.open(`http://localhost:${port}/swagger`, "_self");
      }
    });
    
  }
}
