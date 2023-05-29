package com.demo.backend.services.recommendation;
import com.demo.backend.models.DTO.LocationDetailsDTO;
import com.demo.backend.models.DTO.LocationToVisitDTO;
import com.demo.backend.models.entity.Objective;
import com.demo.backend.services.LocationDetailService;
import com.demo.backend.services.UserService;
import com.google.maps.errors.ApiException;
import com.google.maps.model.PlaceDetails;
import org.apache.lucene.analysis.CharArraySet;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.StopFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.Tokenizer;
import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.analysis.en.PorterStemFilter;
import org.apache.lucene.analysis.standard.StandardTokenizer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;


@Service
public class DataPreparationService {
    @Autowired
    UserService userService;

    @Autowired
    LocationDetailService locationDetailService;

    public List<LocationToVisitDTO> fetchVisitedLocationsFromGooglePlaces(Long userId) throws IOException, InterruptedException, ApiException {
        List<Objective> visitedObjectives = userService.getVisitedPlaces(userId);
        List<LocationToVisitDTO> visitedPlaces = new ArrayList<>();
        for(Objective o: visitedObjectives){
            LocationToVisitDTO ltv = new LocationToVisitDTO();
            LocationDetailsDTO ld = locationDetailService.getPlaceDetailsWithWiki(o.getIdLocaction());
            ltv.setPlace(ld.getPlace());
            ltv.setWikiDescription(ld.getWikiDescription());
            visitedPlaces.add(ltv);
        }
        return visitedPlaces;
    }

    public List<LocationToVisitDTO> cleanData(List<LocationToVisitDTO> places) throws IOException {
        for (LocationToVisitDTO place : places) {
            if(!place.getWikiDescription().isEmpty())
                place.setWikiDescription(textClean(place.getWikiDescription()));
            for(PlaceDetails.Review review: place.getPlace().reviews){
                review.text = textClean(review.text);
            }
        }
        return places;
    }

    public static String textClean(String text) throws IOException {
        // Create a new StandardTokenizer (which is Lucene's basic tokenizer)
        Tokenizer tokenizer = new StandardTokenizer();
        tokenizer.setReader(new StringReader(text));

        // Perform stemming using the Porter stemming algorithm
        TokenStream tokenStream = new PorterStemFilter(tokenizer);
        tokenStream.reset();

        // Convert all tokens to lower case
        tokenStream = new LowerCaseFilter(tokenStream);

        // Remove stop words
        CharArraySet stopWords = CharArraySet.copy(EnglishAnalyzer.getDefaultStopSet());
        tokenStream = new StopFilter(tokenStream, stopWords);

        // Iterate over the tokens and add them to a StringBuilder
        CharTermAttribute charTermAttribute = tokenizer.addAttribute(CharTermAttribute.class);
        StringBuilder stringBuilder = new StringBuilder();
        while (tokenStream.incrementToken()) {
            String token = charTermAttribute.toString();
            stringBuilder.append(token).append(' ');
        }
        tokenStream.end();
        tokenStream.close();

        // Remove the trailing space and convert to a string
        String processedText = stringBuilder.toString().trim();
        return processedText;
    }


}
