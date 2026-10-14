package com.gramseva;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class GramSevaApplication {
    public static void main(String[] args) {
        SpringApplication.run(GramSevaApplication.class, args);
    }
}
