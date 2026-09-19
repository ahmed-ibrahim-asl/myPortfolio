// Human-readable local reference labels; source PDFs are not redistributed.
export function formatSource(source) {
  if (!source) return '';
  const pages = source.pages || (source.page ? [source.page] : []);
  const label = `${source.file}${pages.length ? ` · PDF ${pages.length === 1 ? 'page' : 'pages'} ${pages.join(', ')}` : ''}`;
  return [label, ...(source.additional || []).map(formatSource)].join('; ');
}
