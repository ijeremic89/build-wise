package com.jere.build_wise.contractor;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contractors")
@RequiredArgsConstructor
public class ContractorController {

    private final ContractorService contractorService;

    @GetMapping
    public List<ContractorDto> findAll() {
        return contractorService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContractorDto create(@Valid @RequestBody ContractorRequest request) {
        return contractorService.create(request);
    }

    @PutMapping("/{id}")
    public ContractorDto update(@PathVariable Long id, @Valid @RequestBody ContractorRequest request) {
        return contractorService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        contractorService.delete(id);
    }
}
