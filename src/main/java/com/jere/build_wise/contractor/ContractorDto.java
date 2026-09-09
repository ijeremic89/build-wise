package com.jere.build_wise.contractor;

public record ContractorDto(
        Long id,
        String name,
        String companyName,
        String phone,
        String email,
        String oib,
        String address,
        String note
) {
    public static ContractorDto from(Contractor c) {
        return new ContractorDto(
                c.getId(),
                c.getName(),
                c.getCompanyName(),
                c.getPhone(),
                c.getEmail(),
                c.getOib(),
                c.getAddress(),
                c.getNote()
        );
    }
}
