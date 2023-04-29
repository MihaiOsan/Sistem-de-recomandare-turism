package com.demo.backend.models.DTO;

import com.google.maps.model.PlaceDetails;
import com.google.maps.model.PlacesSearchResult;
import lombok.Data;

@Data
public class LocationDetailsDTO {
    PlaceDetails place;
    String wikiDescription;

}
