package com.prediction.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionResponseDTO {

    private String productName;
    private String sku;
    private String storeId;
    private Integer currentStock;
    private Integer minStockThreshold;
    private Integer maxStockCapacity;
    private String stockStatus;
    private String riskLevel;           // LOW, MEDIUM, HIGH, CRITICAL
    private String prediction;          // Human readable prediction
    private Integer recommendedOrderQty;
    private String reasoning;           // Why AI made this recommendation
    private String estimatedStockoutIn; // e.g. "2 days", "1 week"
    private String timestamp;
}
