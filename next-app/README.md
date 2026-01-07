# Next.js Design System Template

A production-ready design system template built with **Next.js 16**, **shadcn/ui**, **Tailwind CSS v4**, and **Storybook 10**.

Dark mode first, glassmorphism styling, fully documented with Storybook.

## Features

- **Next.js 16** with App Router and TypeScript
- **shadcn/ui** (Radix-based) components
- **Tailwind CSS v4** with OKLCH color space
- **Storybook 10** for component documentation
- **AG Grid Community** for data tables
- **Recharts** for data visualization
- Dark mode first design
- Japanese language support (Noto Sans JP)

## Quick Start

### Use as Template

Click **"Use this template"** button on GitHub to create a new repository.

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Storybook
npm run storybook
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix) |
| Data Table | AG Grid Community |
| Charts | Recharts |
| Documentation | Storybook 10 |
| Font | Inter, Noto Sans JP, JetBrains Mono |

## Components (38)

### Form Components
| Component | Description |
|-----------|-------------|
| Button | Primary, secondary, outline, ghost, destructive variants |
| Input | Text input with various states |
| Textarea | Multi-line text input |
| Checkbox | Single and group checkboxes |
| Switch | Toggle switches |
| Radio Group | Radio button groups |
| Select | Dropdown select with groups |
| Slider | Range slider |
| Label | Form labels |

### Layout Components
| Component | Description |
|-----------|-------------|
| Card | Container with header, content, footer |
| Dialog | Modal dialogs |
| Sheet | Side panels (drawers) |
| Accordion | Collapsible sections |
| Tabs | Tab navigation |
| Separator | Visual dividers |
| Scroll Area | Custom scrollbars |

### Navigation Components
| Component | Description |
|-----------|-------------|
| Dropdown Menu | Action menus with submenus |
| Command Menu | Command palette (cmdk) |
| Breadcrumb | Navigation breadcrumbs |
| Pagination | Page navigation |
| Sidebar | App sidebar navigation |
| Header | App header with actions |

### Data Display
| Component | Description |
|-----------|-------------|
| Data Table | AG Grid integration with dark theme |
| Chart | Area, bar, line, pie charts |
| KPI Card | Metric display cards |
| Badge | Status badges |
| Avatar | User avatars with fallback |
| Progress | Progress bars |
| Skeleton | Loading placeholders |
| Empty State | No data states |

### Feedback
| Component | Description |
|-----------|-------------|
| Alert | Info, success, warning, error alerts |
| Tooltip | Hover tooltips |
| Sonner | Toast notifications |
| Spinner | Loading spinners |

### Utilities
| Component | Description |
|-----------|-------------|
| Calendar | Date picker calendar |
| Date Range Picker | Date range selection |
| Popover | Floating content |

## Storybook Stories (31)

All components have comprehensive Storybook stories with:
- Multiple variants and states
- Interactive examples
- Real-world usage patterns
- Japanese language examples

### Design Tokens

The `DesignTokens.stories.tsx` documents:
- Color palette (OKLCH)
- Typography scale
- Spacing system
- Component variants

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with fonts
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles & design tokens
├── components/
│   └── ui/             # 38 UI components
├── lib/
│   └── utils.ts        # Utility functions (cn)
└── stories/            # 31 Storybook stories
```

## Design System

### Colors (OKLCH)

```css
--background: oklch(0.1 0 0);      /* #0d0d0d */
--foreground: oklch(0.98 0 0);     /* #fafafa */
--card: oklch(0.13 0 0);           /* #1a1a1a */
--primary: oklch(0.59 0.2 277);    /* #8b5cf6 */
--muted: oklch(0.27 0 0);          /* #3f3f3f */
```

### Typography

```css
--font-sans: Inter, Noto Sans JP, system-ui;
--font-mono: JetBrains Mono, monospace;
```

### Glassmorphism

Cards and panels use subtle glass effects:
```css
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.08);
backdrop-filter: blur(12px);
```

## Customization

### Change Colors

Edit `src/app/globals.css`:

```css
@theme inline {
  --color-primary: oklch(0.59 0.2 277);  /* Purple */
  --color-accent: oklch(0.67 0.2 220);   /* Blue */
}
```

### Change Fonts

Edit `src/app/layout.tsx`:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

### Add Components

Use shadcn/ui CLI:

```bash
npx shadcn@latest add [component-name]
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run storybook` | Start Storybook |
| `npm run build-storybook` | Build Storybook |
| `npm run lint` | Run ESLint |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Credits

- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Storybook](https://storybook.js.org/)
- [AG Grid](https://www.ag-grid.com/)
- [Recharts](https://recharts.org/)
