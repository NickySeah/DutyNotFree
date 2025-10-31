package com.example.CSD.user;

// Using Lombok (like your other classes)
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDTO {
    private String userId;
    private String email;
}