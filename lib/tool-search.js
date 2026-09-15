export function filterToolItems(items, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...items];

  return items.filter((item) =>
    [item.title, item.summary, item.category, item.kind, ...(item.tags ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
}
