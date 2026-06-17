const API_URL = "/api/categories";

export const categoryService = {
  getAllCategories: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  getCategoryBySlug: async (slug: string) => {
    try {
      const response = await fetch(`${API_URL}/${slug}`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error(`Error fetching category ${slug}:`, error);
      return null;
    }
  }
};
