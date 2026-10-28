package com.shop.inventory.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByNameContainingIgnoreCaseOrProductIdContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrderByNameAsc(
            String name, String productId, String category);
}
