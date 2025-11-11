# Proposal: Redesign UI with Vercel-Style Design and Mobile Responsiveness

## Why
The current chat UI has several usability issues:
- **Poor color choices**: Emerald/teal gradient is visually overwhelming and unprofessional
- **Not mobile responsive**: Images overflow on small screens, text doesn't adapt
- **Brand inconsistency**: Prominently displays "ShizhenGPT" branding which should be removed
- **Poor visual hierarchy**: Lacks the clean, minimal aesthetic of modern interfaces like Vercel

Users expect a clean, professional interface that works seamlessly across devices. The current design feels dated and doesn't meet modern UX standards.

## What Changes
- Adopt Vercel-inspired design system: neutral grays, subtle borders, clean typography
- Remove all "ShizhenGPT" / "神针GPT" branding from UI (keep only "TCM Consultation" or generic title)
- Implement responsive layout with proper image constraints and mobile breakpoints
- Update color palette to neutral blacks/grays with subtle accent colors
- Improve spacing, typography scale, and visual hierarchy
- Ensure images never overflow containers on any screen size
- Add proper mobile-first CSS with breakpoints for tablet/desktop

## Impact
- **Affected specs**: `chat-ui` (modify visual design and responsive behavior)
- **Affected code**:
  - `frontend/app/page.tsx` - all styling classes and layout structure
  - `frontend/components/CameraCapture.tsx` - responsive camera modal
  - `frontend/app/globals.css` - base styles and custom utilities
  - `frontend/app/layout.tsx` - root layout and metadata
- **Dependencies**: Tailwind CSS (already installed)
- **Breaking changes**: None - purely visual/CSS changes, no API or data model changes
- **User impact**: Significantly improved visual design and mobile usability
