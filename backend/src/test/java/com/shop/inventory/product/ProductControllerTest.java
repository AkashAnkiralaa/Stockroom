package com.shop.inventory.product;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createsSearchesAndUpdatesProductsAndRejectsInvalidValues() throws Exception {
        String id = "TEST-" + System.nanoTime();
        String product = """
                {"productId":"%s","name":"Green Tea","price":3.50,"quantity":4,"category":"Beverages"}
                """.formatted(id);

        mvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content(product))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantity").value(4))
                .andExpect(jsonPath("$.category").value("Beverages"));
        mvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content(product))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/products").param("search", "green"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productId").value(id));
        mvc.perform(get("/api/products").param("search", "Beverages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productId").value(id));
        mvc.perform(patch("/api/products/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ProductRequests.Update(null, 9, "Pantry"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(9))
                .andExpect(jsonPath("$.category").value("Pantry"));
        mvc.perform(patch("/api/products/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"price\":-1}"))
                .andExpect(status().isBadRequest());
    }
}
