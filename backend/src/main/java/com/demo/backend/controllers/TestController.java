package com.demo.backend.controllers;

import com.demo.backend.models.DTO.LocationToVisitDTO;
import com.demo.backend.models.DTO.LocationsDTO;
import com.demo.backend.models.DTO.WeatherData;
import com.demo.backend.models.entity.User;
import com.demo.backend.services.LocationDetailService;
import com.demo.backend.services.WeatherService;
import com.demo.backend.services.recommendation.ContentBasedRecommedationService;
import com.demo.backend.services.recommendation.DataPreparationService;
import com.demo.backend.services.recommendation.RecommendationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.maps.errors.ApiException;
import com.google.maps.model.PlaceType;
import com.google.maps.model.PlacesSearchResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/test")
public class TestController {

    @Autowired
    DataPreparationService dataPreparationService;

    @Autowired
    RecommendationService recommendationService;

    @Autowired
    ContentBasedRecommedationService contentBasedRecommedationService;

    @Autowired
    LocationDetailService locationDetailService;

    @Autowired
    WeatherService weatherService;

    @RequestMapping("/textClean")
    public String textClean(@RequestBody String text) throws IOException {
        return  dataPreparationService.textClean(text);
    }

    @RequestMapping("/recommed")
    public LocationsDTO recommendPlaces(@RequestBody Long idUser) throws Exception {
        return contentBasedRecommedationService.recommendPlaces(dataPreparationService.fetchVisitedLocationsFromGooglePlaces(idUser),-33.8670522,151.1957362,10000, PlaceType.TOURIST_ATTRACTION);
    }

    @RequestMapping("/weather")
    public List<WeatherData> getWeather() throws IOException, InterruptedException {
        return weatherService.getWeatherData(-33.8670522,151.1957362);
    }

}
