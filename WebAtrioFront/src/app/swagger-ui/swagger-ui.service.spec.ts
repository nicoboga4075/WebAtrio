import { TestBed } from '@angular/core/testing';

import { SwaggerUiService } from './swagger-ui.service';

describe('SwaggerUiService', () => {
  let service : SwaggerUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwaggerUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
