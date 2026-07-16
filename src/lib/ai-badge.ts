import aiBadge from "../assets/madewithclaudecode.svg?raw";

/*
 * The raw badge SVG ships with a baked-in 160x30 viewBox and explicit
 * width/height attributes. We swap in a clean opening tag (so CSS can size
 * it via `.made-with-card svg`), recolor the text to `currentColor` so it
 * adapts to the paper/ink theme, and namespace the clip-path ids per
 * instance so multiple copies on one page never collide.
 */
export function buildAiBadgeMarkup(idSuffix: string): string {
  return aiBadge
    .replace(/<svg[^>]*>/, '<svg viewBox="0 0 160 30" xmlns="http://www.w3.org/2000/svg">')
    .replaceAll('id="a"', `id="ai-badge-a-${idSuffix}"`)
    .replaceAll("url(#a)", `url(#ai-badge-a-${idSuffix})`)
    .replaceAll('id="b"', `id="ai-badge-b-${idSuffix}"`)
    .replaceAll("url(#b)", `url(#ai-badge-b-${idSuffix})`)
    .replaceAll('id="c"', `id="ai-badge-c-${idSuffix}"`)
    .replaceAll("url(#c)", `url(#ai-badge-c-${idSuffix})`)
    .replace(/fill="#1F1915"/g, 'fill="currentColor"')
    .replace(/fill="#000"/g, 'fill="currentColor"');
}
