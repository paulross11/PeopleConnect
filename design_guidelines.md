# CRM Database System Design Guidelines

## Design Approach
**System Approach**: Using a clean, utility-focused design system inspired by Linear and Notion for optimal data management and productivity workflows.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 237 13% 20% (deep charcoal for headers, primary text)
- Secondary: 220 9% 46% (medium gray for secondary text)
- Background: 0 0% 98% (clean white background)
- Accent: 217 91% 60% (professional blue for actions, links)
- Success: 142 76% 36% (green for positive states)
- Warning: 38 92% 50% (amber for alerts)

**Dark Mode:**
- Primary: 210 40% 96% (light text)
- Secondary: 215 20% 65% (muted text)
- Background: 222 84% 5% (dark background)
- Surface: 217 33% 9% (card backgrounds)
- Accent: 217 91% 60% (same blue, works in both modes)

### B. Typography
- **Primary Font**: Inter (Google Fonts) for excellent readability in data-dense interfaces
- **Hierarchy**: 
  - Headers: 600 weight, 24px-32px
  - Body: 400 weight, 16px
  - Labels: 500 weight, 14px
  - Captions: 400 weight, 12px

### C. Layout System
**Spacing Units**: Consistent use of Tailwind units 2, 4, 6, 8, 12, 16
- Small gaps: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px) 
- Section spacing: p-8, m-8 (32px)
- Large separations: p-12, m-12 (48px)

### D. Component Library

**Navigation:**
- Clean sidebar with minimal icons and clear labels
- Breadcrumb navigation for deep data views
- Tab navigation for switching between People/Jobs/Clients

**Forms:**
- Clean input fields with subtle borders
- Clear field labels positioned above inputs
- Grouped sections with subtle background differentiation
- Inline validation with helpful error messages

**Data Displays:**
- Card-based layout for people records
- Clean table views with zebra striping
- Expandable sections for related data (jobs history)
- Search bar with filtering capabilities

**Actions:**
- Primary buttons for main actions (Add Person, Save, etc.)
- Secondary outline buttons for secondary actions
- Icon buttons for quick actions (edit, delete)
- Floating action button for quick record creation

**Database Relationship Indicators:**
- Visual connection badges showing linked records
- Expandable job history sections within people cards
- Quick preview modals for related records

### E. Specific Interface Elements

**People Database Interface:**
- Master-detail layout: list view on left, detailed form on right
- Contact information form with logical field grouping
- Jobs history section displayed as expandable cards below main form
- Quick actions toolbar for common operations

**Search & Filter:**
- Prominent search bar at top of interface
- Filter dropdowns for common criteria
- Real-time search results with highlighting

**Mobile Considerations:**
- Stack layout for smaller screens
- Touch-friendly button sizes (minimum 44px)
- Swipe gestures for quick actions

This design prioritizes data clarity, efficient workflows, and professional aesthetics suitable for a business CRM system while maintaining modern web application standards.