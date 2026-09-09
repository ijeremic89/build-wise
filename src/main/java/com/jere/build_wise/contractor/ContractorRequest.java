package com.jere.build_wise.contractor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContractorRequest(
        @NotBlank String name,
        String companyName,
        String phone,
        @Email String email,
        String oib,
        String address,
        String note
) {}
