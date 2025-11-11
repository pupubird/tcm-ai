# Spec Delta: chat-ui

## MODIFIED Requirements

### Requirement: Message Distinction
The system SHALL visually distinguish user and assistant messages using a clean, neutral color palette.

#### Scenario: User message display
- **WHEN** user sends message
- **THEN** message appears right-aligned with black background and white text in a rounded box with max-width constraints

#### Scenario: Assistant message display
- **WHEN** assistant responds
- **THEN** message appears left-aligned with white background, black text, and subtle gray border in a rounded box with max-width constraints

#### Scenario: Message width responsive behavior
- **WHEN** viewed on mobile (<640px)
- **THEN** messages are max 85% of container width
- **WHEN** viewed on tablet (640px-1024px)
- **THEN** messages are max 75% of container width
- **WHEN** viewed on desktop (>1024px)
- **THEN** messages are max 65% of container width

## ADDED Requirements

### Requirement: Visual Design System
The system SHALL use a neutral, professional design system inspired by modern web applications.

#### Scenario: Color palette
- **WHEN** UI is rendered
- **THEN** use neutral blacks/grays/whites for all UI elements
- **AND** no bright colors (emerald, teal, etc.) except for error states (red)
- **AND** use subtle borders (gray-200/gray-300) instead of heavy shadows

#### Scenario: Typography consistency
- **WHEN** displaying text content
- **THEN** use consistent font sizes: text-lg for headers, text-base for body, text-sm for labels
- **AND** use font-semibold for headings, font-medium for labels, font-normal for body text

#### Scenario: Spacing and layout
- **WHEN** rendering UI components
- **THEN** use consistent spacing scale and proper whitespace
- **AND** center content with max-width container (max-w-3xl or similar)

### Requirement: Mobile Responsive Images
The system SHALL ensure images never overflow their containers on any screen size.

#### Scenario: Tongue image display in message
- **WHEN** message contains an image
- **THEN** image is constrained with `max-w-full h-auto` classes
- **AND** image has maximum height constraint (e.g., 300px) to prevent vertical overflow
- **AND** image has rounded corners and subtle border matching design system

#### Scenario: Image preview in input area
- **WHEN** user captures image before sending
- **THEN** preview image is constrained with `max-h-40` or similar
- **AND** preview never causes horizontal scroll on mobile

### Requirement: Mobile-First Responsive Layout
The system SHALL adapt layout and spacing based on screen size.

#### Scenario: Mobile layout (<640px)
- **WHEN** viewed on mobile device
- **THEN** use reduced padding (px-4 instead of px-6)
- **AND** use smaller font sizes where appropriate (text-sm instead of text-base)
- **AND** ensure touch targets are at least 44x44px
- **AND** no horizontal scrolling occurs

#### Scenario: Tablet layout (640px-1024px)
- **WHEN** viewed on tablet device
- **THEN** use medium padding (px-6)
- **AND** use base font sizes
- **AND** adjust message max-widths appropriately

#### Scenario: Desktop layout (>1024px)
- **WHEN** viewed on desktop
- **THEN** use spacious padding (px-8)
- **AND** messages use narrower max-width (65%) for better readability
- **AND** content container is centered with reasonable max-width

### Requirement: Generic Branding
The system SHALL not display specific AI model names or branding.

#### Scenario: Header display
- **WHEN** application loads
- **THEN** header shows generic title like "TCM Consultation" or "Traditional Chinese Medicine AI"
- **AND** no references to "ShizhenGPT" or "神针GPT" appear

#### Scenario: Message labels
- **WHEN** displaying assistant messages
- **THEN** use generic label like "Assistant" or no label at all
- **AND** no specific model name is shown

#### Scenario: Welcome message
- **WHEN** user first opens application with empty conversation
- **THEN** welcome message does not mention specific model names
- **AND** provides clear instructions in generic terms

#### Scenario: Page metadata
- **WHEN** page loads
- **THEN** document title and metadata describe generic "TCM Consultation" functionality
- **AND** no ShizhenGPT branding in meta tags or page title

