package com.example.CSD.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    public SecurityConfig(CustomAuthenticationEntryPoint customAuthenticationEntryPoint) {
        this.customAuthenticationEntryPoint = customAuthenticationEntryPoint;
    }

    // to get roles
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        
        // Set the custom claim name where roles are stored
        grantedAuthoritiesConverter.setAuthoritiesClaimName("role");
        
        // Add the ROLE_ prefix to roles from token
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        
        return jwtAuthenticationConverter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // CONFIGURE THE EXCEPTION HANDLER HERE
            .oauth2ResourceServer(oauth2 -> oauth2
            //     .jwt(withDefaults())
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                .authenticationEntryPoint(customAuthenticationEntryPoint) // This handles invalid tokens
            )

            // REMOVE THE OLD .exceptionHandling() CONFIGURATION
            // .exceptionHandling(ex -> ex.authenticationEntryPoint(customAuthenticationEntryPoint))

            .authorizeHttpRequests(auth -> auth
                // .requestMatchers("/api/v1/**").permitAll()
                // TEST ENDPOINTS  JUST FOR ADMIN TO CHECK
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()

                .requestMatchers(HttpMethod.GET, 
                    "/api/v1/blocs/test",
                    "/api/v1/countries/test",
                    "/api/v1/hscodes/test",
                    "/api/v1/tariffs/test",
                    "/api/v1/products/test",
                    "/api/v1/ftas/test"
                ).hasRole("admin")

                // GET ENDPOINTS (EVERYONE)
                .requestMatchers(HttpMethod.GET, 
                    "/api/v1/blocs", 
                    "/api/v1/blocs/all",
                    "/api/v1/countries", 
                    "/api/v1/countries/all",
                    "/api/v1/hscodes", 
                    "/api/v1/hscodes/all",
                    "/api/v1/tariffs",
                    "/api/v1/tariffs/*",    // by id or all
                    "/api/v1/products",
                    "/api/v1/products/user/*",
                    "/api/v1/products/all",  
                    "/api/v1/ftas",
                    "/api/v1/ftas/*",       // by id or all
                    "/api/v1/calculator"
                ).permitAll()

                // ADMIN ONLY ENDPOINTS
                .requestMatchers(HttpMethod.POST, 
                    "/api/v1/blocs",
                    "/api/v1/countries",
                    "/api/v1/hscodes",
                    "/api/v1/tariffs",
                    "/api/v1/ftas"
                ).hasRole("admin")

                .requestMatchers(HttpMethod.PUT, 
                    "/api/v1/blocs",
                    "/api/v1/countries",
                    "/api/v1/hscodes",
                    "/api/v1/tariffs",
                    "/api/v1/tariffs/*",
                    "/api/v1/ftas/*"
                ).hasRole("admin")

                .requestMatchers(HttpMethod.DELETE, 
                    "/api/v1/blocs",
                    "/api/v1/countries",
                    "/api/v1/hscodes",
                    "/api/v1/tariffs",
                    "/api/v1/tariffs/*",
                    "/api/v1/ftas/*"
                ).hasRole("admin")

                // SUPPLIER ACCESSSIBLE ENDPOINT FOR PRODUCT
                .requestMatchers(HttpMethod.POST, 
                    "/api/v1/products"
                ).hasAnyRole("admin", "supplier")

                .requestMatchers(HttpMethod.PUT, 
                    "/api/v1/products",
                    "/api/v1/products/*"
                ).hasAnyRole("admin", "supplier")

                .requestMatchers(HttpMethod.DELETE, 
                    "/api/v1/products",
                    "/api/v1/products/*"
                ).hasAnyRole("admin", "supplier")

                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        // ... (your existing CORS configuration)
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://127.0.0.1:3000", "https://duty-not-free.vercel.app"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}