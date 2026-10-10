package com.klu.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // ==============================
            // CORS
            // ==============================
            .cors(cors -> cors
                .configurationSource(corsConfigurationSource())
            )

            // ==============================
            // CSRF
            // ==============================
            .csrf(csrf -> csrf.disable())

            // ==============================
            // AUTHORIZATION
            // ==============================
            .authorizeHttpRequests(auth -> auth

                // OPTIONS requests
                .requestMatchers(HttpMethod.OPTIONS, "/**")
                .permitAll()

                // Authentication APIs
                .requestMatchers("/api/auth/**")
                .permitAll()

                // ==============================
                // PRODUCTS
                // ==============================

                // Anyone can view products
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/products/**"
                )
                .permitAll()

                // Only ADMIN can create products
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/products/**"
                )
                .hasRole("ADMIN")

                // Only ADMIN can update products
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/products/**"
                )
                .hasRole("ADMIN")

                // Only ADMIN can delete products
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/products/**"
                )
                .hasRole("ADMIN")

                // ==============================
                // ORDERS
                // ==============================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/orders"
                )
                .authenticated()

                .requestMatchers(
                    "/api/orders/**"
                )
                .authenticated()

                // ==============================
                // PAYMENT
                // ==============================

                // Razorpay webhook must be public
                .requestMatchers(
                    "/api/payment/webhook"
                )
                .permitAll()

                // Create payment requires login
                .requestMatchers(
                    "/api/payment/create/**"
                )
                .authenticated()

                // Verify payment requires login
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/payment/verify"
                )
                .authenticated()

                // ==============================
                // EVERYTHING ELSE
                // ==============================

                // MUST ALWAYS BE LAST
                .requestMatchers("/api/jobs/**").hasRole("ADMIN")
                .anyRequest()
                .authenticated()
            )

            // ==============================
            // SESSION MANAGEMENT
            // ==============================
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // ==============================
            // JWT FILTER
            // ==============================
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // =====================================================
    // CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
            new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:5173",
            "https://m-tech-e-commerce-deployment.vercel.app")
        );


        configuration.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ));

        configuration.setAllowedHeaders(
            List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }
}