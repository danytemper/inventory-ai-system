package com.prediction.service;

import com.prediction.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIPredictionService {

    private final RestTemplate restTemplate;

    @Value("${openai.api.key}")
    private String openAiApiKey;

    @Value("${openai.api.url}")
    private String openAiApiUrl;

    @Value("${openai.model}")
    private String openAiModel;

    public PredictionResponseDTO predictStockout(PredictionRequestDTO request) {
        log.info("Generating AI prediction for product: {} in store: {}",
                request.getProductName(), request.getStoreId());

        // Build the prompt for OpenAI
        String prompt = buildPrompt(request);

        // Call OpenAI API
        String aiResponse = callOpenAI(prompt);

        // Parse AI response into structured DTO
        return parseAIResponse(aiResponse, request);
    }

    private String buildPrompt(PredictionRequestDTO request) {
        double stockPercentage = ((double) request.getCurrentStock() / request.getMaxStockCapacity()) * 100;

        return String.format("""
            You are an expert inventory management AI for a grocery retail chain.
            Analyze this product inventory data and provide a stockout prediction.

            Product Details:
            - Product Name: %s
            - SKU: %s
            - Category: %s
            - Store ID: %s
            - Current Stock: %d units
            - Minimum Stock Threshold: %d units
            - Maximum Stock Capacity: %d units
            - Current Stock Level: %.1f%% of capacity
            - Additional Context: %s

            Provide your analysis in EXACTLY this format (no extra text):
            RISK_LEVEL: [LOW/MEDIUM/HIGH/CRITICAL]
            PREDICTION: [one sentence prediction]
            RECOMMENDED_ORDER_QTY: [number only]
            ESTIMATED_STOCKOUT_IN: [e.g. "3 days" or "2 weeks" or "Already out of stock"]
            REASONING: [2-3 sentence explanation]
            """,
                request.getProductName(),
                request.getSku(),
                request.getCategory(),
                request.getStoreId(),
                request.getCurrentStock(),
                request.getMinStockThreshold(),
                request.getMaxStockCapacity(),
                stockPercentage,
                request.getSalesContext() != null ? request.getSalesContext() : "No additional context"
        );
    }

    private String callOpenAI(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            OpenAIRequestDTO requestBody = OpenAIRequestDTO.builder()
                    .model(openAiModel)
                    .temperature(0.3)
                    .messages(List.of(
                            new OpenAIRequestDTO.Message("system",
                                    "You are an expert inventory management AI. Always respond in the exact format requested."),
                            new OpenAIRequestDTO.Message("user", prompt)
                    ))
                    .build();

            HttpEntity<OpenAIRequestDTO> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<OpenAIResponseDTO> response = restTemplate.exchange(
                    openAiApiUrl,
                    HttpMethod.POST,
                    entity,
                    OpenAIResponseDTO.class
            );

            if (response.getBody() != null && !response.getBody().getChoices().isEmpty()) {
                return response.getBody().getChoices().get(0).getMessage().getContent();
            }

            return "RISK_LEVEL: MEDIUM\nPREDICTION: Unable to get AI prediction\nRECOMMENDED_ORDER_QTY: 50\nESTIMATED_STOCKOUT_IN: Unknown\nREASONING: AI service unavailable";

        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage());
            return "RISK_LEVEL: MEDIUM\nPREDICTION: AI service error - manual review needed\nRECOMMENDED_ORDER_QTY: 50\nESTIMATED_STOCKOUT_IN: Unknown\nREASONING: " + e.getMessage();
        }
    }

    private PredictionResponseDTO parseAIResponse(String aiResponse, PredictionRequestDTO request) {
        String riskLevel = "MEDIUM";
        String prediction = "Review stock levels";
        Integer recommendedOrderQty = 50;
        String estimatedStockoutIn = "Unknown";
        String reasoning = "Manual review recommended";

        try {
            String[] lines = aiResponse.split("\n");
            for (String line : lines) {
                if (line.startsWith("RISK_LEVEL:")) {
                    riskLevel = line.replace("RISK_LEVEL:", "").trim();
                } else if (line.startsWith("PREDICTION:")) {
                    prediction = line.replace("PREDICTION:", "").trim();
                } else if (line.startsWith("RECOMMENDED_ORDER_QTY:")) {
                    String qty = line.replace("RECOMMENDED_ORDER_QTY:", "").trim();
                    recommendedOrderQty = Integer.parseInt(qty.replaceAll("[^0-9]", ""));
                } else if (line.startsWith("ESTIMATED_STOCKOUT_IN:")) {
                    estimatedStockoutIn = line.replace("ESTIMATED_STOCKOUT_IN:", "").trim();
                } else if (line.startsWith("REASONING:")) {
                    reasoning = line.replace("REASONING:", "").trim();
                }
            }
        } catch (Exception e) {
            log.error("Error parsing AI response: {}", e.getMessage());
        }

        String stockStatus = request.getCurrentStock() <= 0 ? "OUT_OF_STOCK"
                : request.getCurrentStock() <= request.getMinStockThreshold() ? "LOW_STOCK" : "IN_STOCK";

        return PredictionResponseDTO.builder()
                .productName(request.getProductName())
                .sku(request.getSku())
                .storeId(request.getStoreId())
                .currentStock(request.getCurrentStock())
                .minStockThreshold(request.getMinStockThreshold())
                .maxStockCapacity(request.getMaxStockCapacity())
                .stockStatus(stockStatus)
                .riskLevel(riskLevel)
                .prediction(prediction)
                .recommendedOrderQty(recommendedOrderQty)
                .estimatedStockoutIn(estimatedStockoutIn)
                .reasoning(reasoning)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
}
