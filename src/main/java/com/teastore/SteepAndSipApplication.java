package com.teastore;

import com.teastore.entity.Category;
import com.teastore.entity.Product;
import com.teastore.repository.CategoryRepository;
import com.teastore.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;

@SpringBootApplication
public class SteepAndSipApplication {

    public static void main(String[] args) {
        SpringApplication.run(SteepAndSipApplication.class, args);
    }

    @Bean
    public CommandLineRunner dataLoader(CategoryRepository categoryRepo, ProductRepository productRepo) {
        return args -> {
            System.out.println("✅ Categories count: " + categoryRepo.count());
            System.out.println("✅ Products count: " + productRepo.count());
            productRepo.findAll().forEach(p -> {
                System.out.println("✅ Found Product: " + p.getName() + " isActive: " + p.getIsActive());
            });
        };
    }
}
