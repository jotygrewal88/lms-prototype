// Epic 1G.5: AI Inline Transform Functions for Rich Text Editor

// Simulate processing delay
const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * AI Rewrite: Rewrites the selected text with improved clarity
 */
export async function aiRewrite(htmlOrText: string): Promise<string> {
  await simulateDelay();
  
  // Simple mock: wrap in emphasis and add clarifying phrase
  const stripped = htmlOrText.replace(/<[^>]*>/g, '');
  return `<p><strong>Revised:</strong> ${stripped} This version provides clearer guidance and improved readability for field application.</p>`;
}

/**
 * AI Expand: Expands text with additional detail and examples
 */
export async function aiExpand(htmlOrText: string): Promise<string> {
  await simulateDelay(900);
  
  const stripped = htmlOrText.replace(/<[^>]*>/g, '');
  return `<p>${stripped}</p>
<p><strong>Additional Details:</strong></p>
<ul>
  <li>Step-by-step breakdown of procedures</li>
  <li>Required personal protective equipment (PPE)</li>
  <li>Common hazards and mitigation strategies</li>
  <li>Verification checklist and sign-off requirements</li>
</ul>
<p><em>Note: Always consult site-specific safety protocols.</em></p>`;
}

/**
 * AI Simplify: Simplifies text into plain language
 */
export async function aiSimplify(htmlOrText: string): Promise<string> {
  await simulateDelay(700);
  
  const stripped = htmlOrText.replace(/<[^>]*>/g, '');
  const sentences = stripped.split('.').filter(s => s.trim().length > 0);
  const simplified = sentences.slice(0, 3).map(s => `<li>${s.trim()}</li>`).join('');
  
  return `<p><strong>In simple terms:</strong></p>
<ul>
${simplified || '<li>Key safety information presented clearly</li>'}
</ul>`;
}








