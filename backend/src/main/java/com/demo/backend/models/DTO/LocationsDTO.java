package com.demo.backend.models.DTO;

import com.google.maps.model.PlacesSearchResult;
import lombok.Data;

@Data
public class LocationsDTO {
    PlacesSearchResult[] places;
    String pageToken;
}
