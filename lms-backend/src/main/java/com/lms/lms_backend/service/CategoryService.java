package com.lms.lms_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.lms_backend.dto.category.CategoryRequest;
import com.lms.lms_backend.entity.Category;
import com.lms.lms_backend.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
    }

    @Transactional
    public Category createCategory(CategoryRequest req) {
        if (categoryRepository.existsBySlug(req.getSlug())) {
            throw new RuntimeException("Category slug đã tồn tại: " + req.getSlug());
        }

        Category category = Category.builder()
                .name(req.getName())
                .slug(req.getSlug())
                .description(req.getDescription())
                .build();

        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, CategoryRequest req) {
        Category category = getCategoryById(id);

        if (!category.getSlug().equals(req.getSlug()) && categoryRepository.existsBySlug(req.getSlug())) {
            throw new RuntimeException("Category slug đã tồn tại: " + req.getSlug());
        }

        category.setName(req.getName());
        category.setSlug(req.getSlug());
        category.setDescription(req.getDescription());

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
