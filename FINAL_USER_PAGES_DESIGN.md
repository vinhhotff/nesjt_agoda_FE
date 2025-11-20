# Final User Pages Design - Match Homepage Style

## 🎨 Design Goal
Làm cho `/user/home` và `/user/orders` match với homepage:
- ✅ Yellow theme (yellow-500, yellow-600)
- ✅ Smooth animations (fade-in, hover effects)
- ✅ Modern cards với shadows
- ✅ Gradient backgrounds
- ✅ Professional và đẹp mắt

## 🎯 Reference: Homepage Style

### Colors from Homepage:
- Primary: `yellow-500` to `yellow-600`
- Background: `slate-50` to `gray-50`
- Cards: `white` với `shadow-lg`
- Hover: `hover:shadow-xl`, `hover:-translate-y-1`

### Animations from Homepage:
- Fade in: `animate-fade-in`
- Hover lift: `hover:-translate-y-1`
- Hover scale: `hover:scale-105`
- Smooth transitions: `transition-all duration-300`

### Components from Homepage:
- Hero với yellow gradient
- Cards với rounded-2xl
- Buttons với yellow gradient
- Stats với icons và animations

---

## 📋 `/user/home` - New Design

### Layout Structure:
```
┌─────────────────────────────────────────────────────────┐
│  Hero Section (Yellow Gradient + Animations)            │
│  Welcome back, [Name]!                                  │
│  [View Profile] [Browse Menu]                           │
└─────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│  Stat Card       │  Stat Card       │  Stat Card       │
│  (Animated)      │  (Animated)      │  (Animated)      │
└──────────────────┴──────────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Loyalty Card (Yellow Gradient + Progress Animation)    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Recent Orders (Cards với hover effects)                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Popular Dishes (Grid với hover zoom)                   │
└─────────────────────────────────────────────────────────┘
```

### Key Features:
1. **Hero**: Yellow gradient, animated badge, smooth fade-in
2. **Stats**: Cards với icons, hover lift, staggered animation
3. **Loyalty**: Yellow gradient, animated progress bar
4. **Orders**: Timeline style, status badges, hover effects
5. **Dishes**: Image zoom on hover, smooth transitions

---

## 📋 `/user/orders` - New Design

### Layout Structure:
```
┌─────────────────────────────────────────────────────────┐
│  Hero Section (Yellow Gradient)                         │
│  Your Orders                                            │
│  Track and manage your orders                           │
└─────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│  Filter Tabs (All, Pending, Completed, Cancelled)      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Order Card (với timeline và animations)                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Order #123 | $50 | Status Badge                 │   │
│  │ Timeline: Ordered → Preparing → Delivered       │   │
│  │ [View Details] [Reorder]                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key Features:
1. **Hero**: Yellow gradient matching homepage
2. **Filters**: Tab style với active indicator
3. **Order Cards**: Timeline, status badges, hover effects
4. **Actions**: Yellow buttons, smooth transitions
5. **Empty State**: Illustration với CTA button

---

## 🎨 Component Patterns

### Hero Section (Match Homepage):
```tsx
<div className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 text-white overflow-hidden">
  <div className="absolute inset-0 opacity-20">
    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
  </div>
  
  <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
      <Sparkles size={16} />
      <span>Welcome Back</span>
    </div>
    <h1 className="text-5xl font-bold mb-4">Hello, {name}!</h1>
    <p className="text-xl text-white/90">Manage your orders and rewards</p>
  </div>
</div>
```

### Stat Card (Animated):
```tsx
<div className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
  <div className="flex items-center justify-between mb-4">
    <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-500 transition-colors">
      <Icon className="w-6 h-6 text-yellow-600 group-hover:text-white transition-colors" />
    </div>
  </div>
  <p className="text-sm text-gray-600 mb-1">Label</p>
  <p className="text-3xl font-bold text-gray-900">{value}</p>
</div>
```

### Loyalty Card (Yellow Gradient):
```tsx
<div className="relative bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-8 text-white overflow-hidden">
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
  </div>
  
  <div className="relative">
    <h3 className="text-2xl font-bold mb-6">Loyalty Points</h3>
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <p className="text-white/90 text-sm mb-2">Current Points</p>
      <p className="text-5xl font-bold">{points}</p>
    </div>
    
    <div className="mt-6">
      <div className="flex justify-between text-sm mb-2">
        <span>Progress to next tier</span>
        <span className="font-semibold">{progress}%</span>
      </div>
      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  </div>
</div>
```

### Order Card (Timeline):
```tsx
<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-lg font-bold text-gray-900">Order #{id}</h3>
      <p className="text-sm text-gray-600">{date}</p>
    </div>
    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
      {status}
    </span>
  </div>
  
  {/* Timeline */}
  <div className="flex items-center gap-2 mb-4">
    <div className="flex-1 h-2 bg-yellow-500 rounded-full" />
    <div className="flex-1 h-2 bg-yellow-500 rounded-full" />
    <div className="flex-1 h-2 bg-gray-200 rounded-full" />
  </div>
  
  <div className="flex gap-3">
    <button className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
      View Details
    </button>
    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
      Reorder
    </button>
  </div>
</div>
```

### Dish Card (Hover Zoom):
```tsx
<div className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
  <div className="relative h-48 overflow-hidden bg-gray-100">
    <img 
      src={image} 
      alt={name}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
  
  <div className="p-5">
    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-yellow-600 transition-colors">
      {name}
    </h3>
    <p className="text-2xl font-bold text-yellow-600">{price}</p>
  </div>
</div>
```

---

## 🎬 Animations to Add

### CSS Animations (in globals.css):
```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-fade-in-delay-1 {
  animation: fade-in 0.5s ease-out 0.1s both;
}

.animate-fade-in-delay-2 {
  animation: fade-in 0.5s ease-out 0.2s both;
}
```

### Hover Effects:
- `hover:-translate-y-1` - Lift effect
- `hover:scale-105` - Subtle scale
- `hover:shadow-xl` - Shadow increase
- `transition-all duration-300` - Smooth transitions

---

## ✅ Implementation Checklist

### `/user/home`:
- [ ] Add yellow gradient hero
- [ ] Add animated badge
- [ ] Create stat cards với icons
- [ ] Add hover effects
- [ ] Redesign loyalty card với gradient
- [ ] Add animated progress bar
- [ ] Style order cards với timeline
- [ ] Add dish cards với hover zoom
- [ ] Add staggered animations

### `/user/orders`:
- [ ] Add yellow gradient hero
- [ ] Create filter tabs
- [ ] Design order cards với timeline
- [ ] Add status badges
- [ ] Add action buttons
- [ ] Create empty state
- [ ] Add hover effects
- [ ] Add smooth transitions

---

**Status**: Ready to implement
**Style**: Match homepage (yellow theme + animations)
**Priority**: HIGH
