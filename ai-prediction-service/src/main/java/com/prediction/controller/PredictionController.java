package com.prediction.controller;

import com.prediction.dto.*;
import com.prediction.service.AIPredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PredictionController {

    private final AIPredictionService predictionService;

    // Predict stockout for a single product
    @PostMapping("/predict")
    public ResponseEntity<PredictionResponseDTO> predict(
            @Valid @RequestBody PredictionRequestDTO request) {
        return ResponseEntity.ok(predictionService.predictStockout(request));
    }

    // Predict stockout for multiple products at once
    @PostMapping("/predict/batch")
    public ResponseEntity<List<PredictionResponseDTO>> predictBatch(
            @RequestBody List<PredictionRequestDTO> requests) {
        List<PredictionResponseDTO> responses = requests.stream()
                .map(predictionService::predictStockout)
                .toList();
        return ResponseEntity.ok(responses);
    }
}
