# Water Hydration Features

## Overview

Comprehensive hydration tracking system with intelligent insights, quick logging, and smart goal adjustment based on activity level, climate, and female health cycle.

## Components

### 1. **WaterCard** (`components/water/WaterCard.tsx`)

Main card component displaying daily hydration progress with quick access to logging.

#### Features
- **Real-time Progress**: Shows current intake vs. daily goal
- **Status Indicator**: Color-coded (optimal, good, behind, critical)
- **Quick Add Button**: Opens quick log modal
- **Alert Display**: Shows hydration recommendations
- **Footer Stats**: Progress %, time period, quick log button

#### Status Colors
```
✨ Optimal   → ≥ 100% of goal → Colors.success
✓ Good      → 75-99% → Colors.success
⏱️ Fair     → 50-74% → Colors.info
💧 Low      → 1-49% → Colors.warning
⚠️ Critical → 0% (nothing logged) → Colors.error
```

### 2. **WaterQuickLogCard** (`components/water/WaterQuickLog.tsx`)

Quick logging component with preset amounts and custom input.

#### Props
```typescript
interface WaterQuickLogCardProps {
  onLogged?: () => void;  // Callback when logged
}
```

#### Features
- **State Machine**: Closed → Selecting → Submitting → Done
- **Preset Amounts**: 250ml, 500ml, 750ml, 1000ml
- **Visual Feedback**: Shows success message after logging
- **Auto-close**: Returns to closed state after 2.5 seconds

#### UI States
1. **Closed**: Shows quick "Beber agua" button
2. **Selecting**: Displays preset options
3. **Submitting**: Shows loading state
4. **Done**: Confirms logged amount

### 3. **HydrationInsightsPanel** (`components/water/HydrationInsightsPanel.tsx`)

Full-screen dashboard with detailed hydration analysis and recommendations.

#### Features
- **Smart Insight**: Context-aware main message
- **Metrics Grid**: Progress, remaining, streak
- **Status Badge**: Current hydration state
- **Personalized Recommendations**: 3-5 actionable suggestions
- **Historical Context**: Based on patterns

#### Insight Types
```
Optimal  → Met or exceeded goal → Success + Celebration
Good     → On track for time of day → Encouragement
Fair     → Behind but recoverable → Action item
Low      → Significantly behind → Warning
Critical → Nothing consumed → Urgent alert
```

### 4. **useHydrationInsights** (`hooks/useHydrationInsights.ts`)

Core business logic hook for hydration analysis and recommendations.

#### Returns
```typescript
{
  insight: HydrationInsight;           // Main message + action
  metrics: HydrationMetrics;           // Daily stats
  recommendations: string[];           // 3-5 suggestions
  hydrationScore: number;              // 0-100
  isOptimal: boolean;                  // Met goal?
  isOnTrack: boolean;                  // Expected progress for time?
}
```

#### Key Calculations

**Expected Progress**: Based on time of day
```
Active hours = 8am to 8pm (12 hour window)
Expected% = (current_hour - 8) / 12 * 100
```

**Hydration Status**
```
Ahead     → Progress ≥ 100%
On-track  → Within 10% of expected for time
Behind    → < 25% behind expected
Critical  → No water logged all day
```

#### Recommendation Logic
- **Activity-based**: High activity (≥80% steps) → +20% goal
- **Timing-based**: Late day with low progress → urgency
- **Streak-based**: Recognition of consistency
- **Pattern-based**: Alert about typical low periods
- **Default**: General hydration message

## Usage Examples

### Basic Home Integration
```typescript
import { WaterCard } from '@/components/water';

export function HomeScreen() {
  return (
    <ScrollView>
      <WaterCard onPress={() => navigation.navigate('HydrationDetails')} />
    </ScrollView>
  );
}
```

### Quick Log Modal
```typescript
import { WaterQuickLogCard } from '@/components/water';

const [showLog, setShowLog] = useState(false);

return showLog ? (
  <WaterQuickLogCard onLogged={() => setShowLog(false)} />
) : (
  <Button onPress={() => setShowLog(true)} />
);
```

### Full Insights Dashboard
```typescript
import { HydrationInsightsPanel } from '@/components/water';

export function HydrationScreen() {
  return <HydrationInsightsPanel />;
}
```

### Hook Usage
```typescript
import { useHydrationInsights } from '@/hooks';

export function CustomHydrationWidget() {
  const { insight, metrics, hydrationScore } = useHydrationInsights();
  
  return (
    <View>
      <Text>{insight.actionDescription}</Text>
      <ProgressBar value={metrics.dailyProgress} />
      <Text>Score: {hydrationScore}/100</Text>
    </View>
  );
}
```

## Integration with Other Features

### Activity Correlation
When user has high step count:
- Goal increases by 20% (2500ml → 3000ml)
- Recommendation suggests extra hydration
- Alert if intake doesn't increase with activity

### Climate Auto-Adjustment
If `waterAutoHeatAdjustment` enabled:
- Hot weather (apparent temp > 25°C) → +450ml
- Warm weather → +250ml
- Humid conditions → +200ml
- Dry conditions → +150ml

### Female Health Cycle
During menstrual/luteal phase:
- Goal increases by +200ml
- Extra hydration recommendation
- Hydration marked as health priority

### Fasting Context
During active fasting:
- Goal increases by +250ml
- Emphasis on hydration during fast
- Alert about importance of water intake

## Data Flow

```
useWater (core data)
  ↓
  ├─ totalHydro, goal, remaining, hydrationStreak
  ├─ hourlyDistribution (patterns)
  └─ customDrinks (user preferences)
  
useSteps (activity context)
  ↓
  └─ progressPct (activity level)

useHydrationInsights (analysis)
  ↓
  ├─ Calculates expected progress
  ├─ Determines hydration status
  ├─ Generates insight
  └─ Creates recommendations
```

## Smart Features

### 1. Expected Progress Calculation
- Knows user should drink throughout day (8am-8pm)
- Calculates expected% for current time
- Alerts if behind schedule
- Celebrates if ahead

### 2. Pattern Recognition
- Identifies hours with lowest intake
- Creates reminders for vulnerable times
- Learns from user's hydration curve

### 3. Context-Aware Messaging
- Changes language based on severity
- Uses emojis for quick visual parsing
- Provides specific action items
- Celebrates achievements

### 4. Streak Motivation
- Tracks consecutive days hitting goal
- Provides encouragement at milestones
- Shows progress vs. previous patterns

## Styling & Theming

Components use app's color system:
- `Colors.info`: Primary hydration color (💧)
- `Colors.success`: Goal met state
- `Colors.warning`: Behind schedule
- `Colors.error`: Critical status

Typography:
- `FontFamily.bold`: Titles and values
- `FontFamily.regular`: Descriptions
- `FontSize.md`: Primary text
- `FontSize.sm`: Secondary text

## Performance Considerations

- Hooks use `useMemo` to avoid unnecessary calculations
- Expected progress calculated once per render
- No excessive API calls - uses existing hook data
- Time-based calculations done efficiently

## Future Enhancements

1. **Drink Type Tracking**: Different hydration factors (water, electrolytes, etc.)
2. **Reminders**: Smart notification timing based on patterns
3. **Social Features**: Hydration challenges with friends
4. **Historical Trends**: Charts showing 30-day patterns
5. **Integration with Wearables**: Sync with health apps
6. **Personalized Goals**: ML-based goal optimization
7. **Alerts**: Critical hydration warnings (e.g., dehydration risk)

## Testing

The components handle edge cases:
- Zero intake throughout day → Critical alert
- Goal changes (activity/climate) → Recommendations update
- End of day scenarios → Urgency messaging
- Streak milestones → Celebration moments
- Missing context data → Graceful degradation

## Accessibility

- All text descriptive and clear
- Color not sole indicator (uses icons + text)
- Touch targets adequate (≥44pt)
- PropTypes validation for safety
- Labels for all interactive elements

## Related Documentation

- [Sleep Performance Correlation](SLEEP_PERFORMANCE_CORRELATION.md)
- [Nutrition Feedback Loop](NUTRITION_FEEDBACK_LOOP.md)
- [Water Module Full Docs](../water/README.md)
