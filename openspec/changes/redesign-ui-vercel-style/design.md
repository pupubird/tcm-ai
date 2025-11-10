# Design: Vercel-Style UI Redesign

## Context
Current UI uses bright emerald/teal colors with heavy gradients, prominently displays "ShizhenGPT" branding, and lacks mobile responsiveness. Images overflow containers on small screens, creating a poor user experience.

**Design goals:**
- Clean, minimal aesthetic inspired by Vercel's design system
- Neutral color palette (blacks, grays, whites) with subtle accents
- Mobile-first responsive design
- Remove all specific model branding
- Professional, modern look suitable for a medical consultation app

## Decisions

### Decision 1: Vercel-Inspired Color Palette
**Rationale:** Vercel's design uses neutral blacks/grays with high contrast and subtle borders. This creates a professional, timeless look that doesn't distract from content.

**Color scheme:**
```css
Background: white (#ffffff) / off-white (#fafafa)
Text: near-black (#171717), gray-600 (#525252)
Borders: gray-200 (#e5e5e5), gray-300 (#d4d4d4)
Accents: black hover states, subtle gray-100 (#f5f5f5) backgrounds
User messages: black (#000000) with white text
Assistant messages: white with black text and subtle border
```

**Alternative considered:** Keep teal/emerald theme → Rejected, too visually loud and medical-feeling

### Decision 2: Remove ShizhenGPT Branding
**Rationale:** User specifically requested removal of model name references. The UI should be model-agnostic.

**Changes:**
- Header: "神针GPT 中医咨询" → "TCM Consultation" or "Traditional Chinese Medicine AI"
- Message labels: "神针GPT" → "Assistant" or just remove label
- Welcome message: Remove specific model references
- Metadata: Update page title to generic description

**Alternative considered:** Keep branding → Rejected per user requirements

### Decision 3: Mobile-First Responsive Design
**Rationale:** Images currently overflow, text doesn't adapt, and layout breaks on mobile. Need proper responsive constraints.

**Implementation:**
```tsx
// Image constraints
<img className="max-w-full h-auto rounded-lg" /> // Never overflow

// Responsive message widths
<div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%]"> // Narrower on desktop

// Responsive padding/spacing
className="px-4 sm:px-6 md:px-8" // Progressive spacing

// Typography
className="text-sm sm:text-base" // Smaller on mobile
```

**Breakpoints:**
- `sm`: 640px (phone landscape / small tablet)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)

### Decision 4: Simplified Visual Hierarchy
**Rationale:** Current design has too many visual elements competing for attention. Vercel-style focuses on content with minimal chrome.

**Changes:**
- Remove gradient backgrounds → solid white/gray
- Simplify header → single-line title, subtle border
- Reduce rounded corners → from `rounded-2xl` to `rounded-lg`
- Subtle shadows → from `shadow-lg` to `shadow-sm` or remove entirely
- Cleaner typography → system font stack, consistent sizing

## Implementation Pattern

**New header:**
```tsx
<header className="border-b border-gray-200 px-4 py-3 bg-white">
  <div className="max-w-3xl mx-auto">
    <h1 className="text-lg font-semibold text-gray-900">TCM Consultation</h1>
  </div>
</header>
```

**New message bubbles:**
```tsx
// User message
<div className="bg-black text-white px-4 py-2 rounded-lg">

// Assistant message
<div className="bg-white text-gray-900 px-4 py-2 rounded-lg border border-gray-200">
```

**Responsive images:**
```tsx
<img
  src={imageUrl}
  className="max-w-full h-auto rounded-lg border border-gray-200"
  style={{ maxHeight: '300px' }} // Prevent vertical overflow too
/>
```

## Risks / Trade-offs

**Risk 1: Too minimal / boring**
- **Mitigation:** Use subtle hover states, smooth transitions, proper spacing to add life
- **Fallback:** Can add subtle accent color (e.g., blue-600) if needed

**Risk 2: Breaking existing user expectations**
- **Mitigation:** This is MVP, likely no existing users with strong expectations
- **Monitor:** Get user feedback after deployment

**Risk 3: Branding removal may confuse users about which AI they're using**
- **Mitigation:** Add subtle footer text "Powered by Traditional Chinese Medicine AI"
- **Alternative:** Add "About" modal explaining the system

## Responsive Behavior

**Mobile (<640px):**
- Single column layout
- Full-width messages (85%)
- Smaller font sizes (text-sm)
- Reduced padding (px-4)
- Touch-friendly button sizes (min-h-12)

**Tablet (640px-1024px):**
- Messages max 75% width
- Base font sizes
- Standard padding (px-6)

**Desktop (>1024px):**
- Messages max 65% width
- Max content width 900px
- Spacious padding (px-8)
- Larger input area

## Typography Scale

```
Headings: font-semibold
Body: font-normal
Labels: text-xs font-medium text-gray-500
Primary: text-base (16px)
Small: text-sm (14px)
Tiny: text-xs (12px)
```

## Open Questions

1. Should we add a light/dark mode toggle?
   - **Answer:** Not for MVP, but design should support it (use semantic color variables)
2. What generic branding should replace "ShizhenGPT"?
   - **Proposed:** "TCM Consultation" in header, "Assistant" for message labels
3. Should camera capture modal also follow Vercel design?
   - **Answer:** Yes, update to match main UI (white bg, subtle borders)
