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
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            // CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // CSRF (REST API using JWT)
            .csrf(csrf -> csrf.disable())

            // Authorization
            .authorizeHttpRequests(auth -> auth

                // Allow browser preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Login and signup
                .requestMatchers("/api/auth/**").permitAll()

                // Public product viewing
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/products",
                    "/api/products/**"
                ).permitAll()

                // Admin-only product management
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/products",
                    "/api/products/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/products",
                    "/api/products/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/products",
                    "/api/products/**"
                ).hasRole("ADMIN")

                // Orders require authentication
                .requestMatchers("/api/orders/**").authenticated()

                // Public Razorpay webhook
                .requestMatchers("/api/payment/webhook").permitAll()

                // Payment operations require authentication
                .requestMatchers("/api/payment/create/**").authenticated()
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/payment/verify"
                ).authenticated()

                // Admin-only background jobs
                .requestMatchers("/api/jobs/**").hasRole("ADMIN")

                // Protect all other endpoints
                .anyRequest().authenticated()
            )

            // Stateless JWT sessions
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // JWT filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // CORS configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:5173",
            "https://m-tech-e-commerce-deployment-*.vercel.app",
            "https://m-tech-e-commerce-deployment.vercel.app"
        ));

        configuration.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}