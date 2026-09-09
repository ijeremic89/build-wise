package com.jere.build_wise.contractor;

import com.jere.build_wise.user.CurrentUser;
import com.jere.build_wise.user.User;
import com.jere.build_wise.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ContractorService {

    private final ContractorRepository contractorRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public List<ContractorDto> findAll() {
        return contractorRepository.findByUserIdOrderByIdAsc(currentUser.id())
                .stream().map(ContractorDto::from).toList();
    }

    public ContractorDto create(ContractorRequest request) {
        User user = userRepository.getReferenceById(currentUser.id());

        Contractor contractor = new Contractor();
        contractor.setUser(user);
        contractor.setName(request.name());
        contractor.setCompanyName(request.companyName());
        contractor.setPhone(request.phone());
        contractor.setEmail(request.email());
        contractor.setOib(request.oib());
        contractor.setAddress(request.address());
        contractor.setNote(request.note());

        return ContractorDto.from(contractorRepository.save(contractor));
    }

    public ContractorDto update(Long id, ContractorRequest request) {
        Contractor contractor = findOwnedOrThrow(id);
        contractor.setName(request.name());
        contractor.setCompanyName(request.companyName());
        contractor.setPhone(request.phone());
        contractor.setEmail(request.email());
        contractor.setOib(request.oib());
        contractor.setAddress(request.address());
        contractor.setNote(request.note());
        return ContractorDto.from(contractor);
    }

    public void delete(Long id) {
        Contractor contractor = findOwnedOrThrow(id);
        contractorRepository.delete(contractor);
    }

    private Contractor findOwnedOrThrow(Long id) {
        Contractor contractor = contractorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contractor not found: " + id));

        if (!contractor.getUser().getId().equals(currentUser.id())) {
            throw new EntityNotFoundException("Contractor not found: " + id);
        }
        return contractor;
    }
}
