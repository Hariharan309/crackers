'use client';

import AdminPageTemplate from '../template-page';

export default function CategoriesPage() {
  return (
    <AdminPageTemplate
      title="Categories Management"
      description="Manage product categories and organize your catalog"
      addButtonText="Add Category"
      addButtonHref="/admin/categories/add"
    />
  );
}