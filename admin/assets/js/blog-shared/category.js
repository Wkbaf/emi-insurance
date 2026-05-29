function getCategoryName(category) {
  return category.name || category.title || category.categoryName || "";
}

function getCategorySlug(category) {
  return category.slug || createSlug(getCategoryName(category));
}

function getCategoryStatus(category) {
  return category.status || "active";
}

function isCategoryDeleted(category) {
  return category.isDeleted === true || category.deleted === true;
}

function getItemCategory(item, categories) {
  const categoryId = item.categoryId || "";

  let matchedCategory = categories.find((category) => {
    return category.id === categoryId;
  });

  if (!matchedCategory) {
    matchedCategory = categories.find((category) => {
      const slug = getCategorySlug(category);
      const name = getCategoryName(category);

      return (
        slug === item.categorySlug ||
        slug === item.category ||
        name === item.category
      );
    });
  }

  if (matchedCategory) {
    return {
      id: matchedCategory.id,
      name: getCategoryName(matchedCategory),
      slug: getCategorySlug(matchedCategory),
      isDeleted: isCategoryDeleted(matchedCategory),
      status: getCategoryStatus(matchedCategory),
    };
  }

  return {
    id: categoryId,
    name: item.category || "",
    slug: item.categorySlug || item.category || "",
    isDeleted: item.categoryIsDeleted === true,
    status: item.categoryStatus || "active",
  };
}
