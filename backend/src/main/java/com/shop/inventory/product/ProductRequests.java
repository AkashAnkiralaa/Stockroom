package com.shop.inventory.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public final class ProductRequests {
    private ProductRequests() {
    }

    public record Create(
            @NotBlank @Size(max = 50) String productId,
            @NotBlank @Size(max = 120) String name,
            @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal price,
            @Min(0) int quantity,
            @Size(max = 60) String category
    ) {
    }

    public record Update(
            @DecimalMin(value = "0.00", inclusive = true) BigDecimal price,
            @Min(0) Integer quantity,
            @Size(max = 60) String category
    ) {
        public boolean hasChanges() {
            return price != null || quantity != null || category != null;
        }
    }
}
