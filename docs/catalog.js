/* Shared catalog logic. No build step or dependencies. */
window.IconCatalog = (() => {
  const names = { react: 'React', vuejs: 'Vue.js', nodejs: 'Node.js', nextjs: 'Next.js', javascript: 'JavaScript', typescript: 'TypeScript', postgresql: 'PostgreSQL', github: 'GitHub', aws: 'AWS', openai: 'OpenAI', css: 'CSS', html: 'HTML', tailwindcss: 'Tailwind CSS', mongodb: 'MongoDB', vscode: 'VS Code' };
  Object.assign(names, { axm: 'Axiom (CAS)', ur: 'UR Browser', ai: 'Adobe Illustrator', ps: 'Adobe Photoshop', id: 'Adobe InDesign', js: 'JavaScript', 'c++': 'C++', csharp: 'C#', tRPC: 'tRPC', inkspace: 'Inkscape' });
  const displayName = name => names[name] || name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const filterIcons = (icons, query, category) => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return icons.filter(icon => (category === 'all' || icon.category === category) &&
      terms.every(term => `${icon.name} ${displayName(icon.name)} ${icon.category}`.toLowerCase().includes(term)));
  };
  const escape = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const variantAsset = (icon, variant = 'light') => icon.variants?.[variant] || icon;
  function snippet(icon, format, size, variant = 'light') {
    const asset = variantAsset(icon, variant);
    const url = `https://cdn.jsdelivr.net/gh/YeThura-424/tech_stack_icon@main/${asset.filename.split('/').map(encodeURIComponent).join('/')}`;
    const name = displayName(icon.name);
    if (format === 'url') return url;
    if (format === 'markdown') return `![${name.replace(/[\[\]\\]/g, '\\$&')}](${url})`;
    return `<img src="${url}" alt="${escape(name)}" width="${size}" height="${size}" />`;
  }
  return { displayName, filterIcons, snippet, variantAsset };
})();
