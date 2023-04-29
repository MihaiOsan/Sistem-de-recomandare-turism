import { TestBed } from '@angular/core/testing';

import { MapCenterServiceService } from './map-center-service.service';

describe('MapCenterServiceService', () => {
  let service: MapCenterServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapCenterServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
