package com.shop.inventory.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @Column(name = "product_id", nullable = false, updatable = false, length = 50)
    private String productId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private int quantity;

    @Column(length = 60)
    private String category;

    protected Product() {
    }

    public Product(String productId, String name, BigDecimal price, int quantity, String category) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.category = category;
    }

    public String getProductId() {
        return productId;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public int getQuantity() {
        return quantity;
    }

    public String getCategory() {
        return category == null || category.isBlank() ? "Uncategorized" : category;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setCategory(String category) {
        this.category = category == null || category.isBlank() ? "Uncategorized" : category;
    }
}
