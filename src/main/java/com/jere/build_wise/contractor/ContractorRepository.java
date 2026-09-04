package com.jere.build_wise.contractor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractorRepository extends JpaRepository<Contractor, Long> {

    List<Contractor> findByUserIdOrderByIdAsc(Long userId);
}
