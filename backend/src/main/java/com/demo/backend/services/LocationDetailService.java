package com.demo.backend.services;

import com.demo.backend.models.DTO.LocationDetailsDTO;
import com.demo.backend.models.DTO.LocationsDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.Response;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Iterator;

@Service
public class LocationDetailService {


    @Autowired
    private WikiService wikipediaService;

    public String searchForPlaceDetails(String query) throws IOException {
        String info;
        try{
            info = wikipediaService.searchForPlace(query);
        }catch (Exception e){
            info = "No content found";
        }
        if (info == "No content found")
            info = wikipediaService.getWikipediaDescription(query);
        if (info == null)
            info = wikipediaService.getShortWikipediaDescription(query);
        if (info == null)
            info = "No content found";
        return info;
    }



}
