# New Minimal Design System

## 🎨 Design Philosophy
- **Minimalist**: Clean, simple, no clutter
- **Professional**: Business-like, trustworthy
- **Readable**: Clear hierarchy, good contrast
- **Fast**: No heavy animations, quick load

## Color Palette

### Primary Colors
- **White**: #FFFFFF (backgrounds)
- **Gray-50**: #F9FAFB (subtle backgrounds)
- **Gray-900**: #111827 (text, accents)
- **Gray-600**: #4B5563 (secondary text)
- **Gray-200**: #E5E7EB (borders)

### Accent Colors (minimal use)
- **Blue-600**: #2563EB (links, info)
- **Green-600**: #16A34A (success)
- **Red-600**: #DC2626 (danger)

## Typography
- **Headings**: font-bold, text-2xl to text-4xl
- **Body**: font-normal, text-base
- **Small**: text-sm, text-xs

## Spacing
- **Cards**: p-6, gap-6
- **Sections**: py-8, py-12
- **Elements**: gap-4, space-y-4

## Components

### Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  {/* Content */}
</div>
```

### Button Primary
```tsx
<button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
  Action
</button>
```

### Button Secondary
```tsx
<button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
  Action
</button>
```

### Input
```tsx
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
```

## Layout Principles
1. **Max width**: max-w-7xl for content
2. **Padding**: px-4 sm:px-6 lg:px-8
3. **Grid**: Simple 2-3 column grids
4. **No gradients**: Solid colors only
5. **No animations**: Only transition-colors
6. **No shadows**: Only border or subtle shadow-sm

## What to Avoid
- ❌ Gradients
- ❌ Animated blobs
- ❌ Scale effects
- ❌ Heavy shadows
- ❌ Emojis (use icons)
- ❌ Multiple colors
- ❌ Complex layouts

## What to Use
- ✅ White backgrounds
- ✅ Simple borders
- ✅ Clear typography
- ✅ Lucide icons
- ✅ Grid layouts
- ✅ Subtle hover states
- ✅ Good spacing
