export function filterToolItems(items, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...items];

  return items.filter((item) =>
    [
      item.title,
      item.summary,
      item.category,
      item.kind,
      item.group,
      ...(item.tags ?? []),
      ...(item.symbols ?? []),
      ...(item.aliases ?? [])
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
}

export function groupToolItems(items, query, groupOrder = []) {
  const visible = filterToolItems(items, query);
  const discovered = [...new Set(items.map(({ group }) => group).filter(Boolean))];
  const order = [...groupOrder, ...discovered.filter((group) => !groupOrder.includes(group))];

  return order
    .map((name) => ({ name, items: visible.filter(({ group }) => group === name) }))
    .filter((group) => group.items.length > 0);
}
