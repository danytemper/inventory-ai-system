package com.prediction.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionRequestDTO {

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull @Min(0)
    private Integer currentStock;

    @NotNull
    private Integer minStockThreshold;

    @NotNull
    private Integer maxStockCapacity;

    @NotBlank
    private String storeId;

    // Optional: recent sales data as context
    private String salesContext;
}
