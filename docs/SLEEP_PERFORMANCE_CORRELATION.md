# Sleep-Performance Correlation Features

## Overview

This feature suite provides intelligent correlations between sleep metrics and performance indicators, delivering actionable insights that help users optimize their health based on the relationship between rest and activity.

## Components

### 1. **SleepPerformanceCard** (`components/sleep/SleepPerformanceCard.tsx`)

A card component that displays the current sleep-performance correlation with actionable insights.

#### Props
```typescript
interface SleepPerformanceCorrelationProps {
  compact?: boolean; // Shows compact variant when true
}
```

#### Features
- **Two Variants**: Full and compact display modes
- **Real-time Correlation**: Analyzes current sleep debt vs. activity level
- **Actionable Messages**: Provides specific recommendations based on state
- **Visual Indicators**: Uses emojis and colors to convey urgency

#### Correlation Types
```typescript
type CorrelationType = 'excellent' | 'good' | 'fair' | 'poor' | null;
```

#### Logic
```
Excellent: Good sleep + High activity → Optimal performance state
Good: High sleep debt + High activity → Pushing through (discipline)
Fair: Moderate debt + Moderate activity → Normal recovery
Poor: High sleep debt + Low activity → Recovery needed
```

#### Metrics Displayed
- Sleep debt (hours)
- Movement/Activity (%)
- Last workout quality (if available)

### 2. **SleepPerformanceDashboard** (`components/sleep/SleepPerformanceDashboard.tsx`)

A full-screen dashboard showing detailed sleep-performance correlations and recommendations.

#### Features
- **Animated Score**: Visualizes overall correlation (0-100)
- **Insight Card**: Main correlation analysis with color-coded severity
- **Metrics Grid**: 3-column display of key metrics
- **Personalized Recommendations**: AI-generated action items
- **Scrollable Layout**: All information accessible without overwhelming

#### Severity Levels
- **Critical** (Red): High sleep debt + Low activity
- **Warning** (Orange): Sleep debt affecting performance
- **Info** (Blue): Recovery in progress
- **Success** (Green): Excellent balance

#### Score Calculation
```
Overall Score = (Sleep Score × 0.4) + (Activity Score × 0.35) + (Workout Score × 0.25)
```

### 3. **useSleepPerformanceCorrelation** Hook (`hooks/useSleepPerformanceCorrelation.ts`)

The core business logic hook that correlates sleep and performance data.

#### Returns
```typescript
{
  metrics: PerformanceMetrics;           // Current sleep/activity quality
  insight: SleepCorrelationInsight;      // Main insight with action items
  recommendations: string[];             // 3-5 personalized recommendations
  correlationScore: number;              // 0-100 score
}
```

#### Metrics Structure
```typescript
interface PerformanceMetrics {
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor';
  activityLevel: 'high' | 'moderate' | 'low';
  workoutQuality: number | null;        // Estimated from volume/sets
  overallScore: number;                 // 0-100
}
```

#### Insight Structure
```typescript
interface SleepCorrelationInsight {
  type: 'sleep-deprivation' | 'peak-performance' | 'recovery-needed' | 'balanced' | 'warning';
  title: string;                        // User-friendly title
  description: string;                  // Context about current state
  actionTitle: string;                  // What to do
  actionDescription: string;            // How to do it
  severity: 'critical' | 'warning' | 'info' | 'success';
  icon: string;                         // Emoji representation
}
```

## Usage Examples

### Basic Card Integration
```typescript
import { SleepPerformanceCard } from '@/components/sleep/SleepPerformanceCard';

export function HealthScreen() {
  return (
    <ScrollView>
      <SleepPerformanceCard compact={false} />
    </ScrollView>
  );
}
```

### Compact Variant in Dashboard
```typescript
<SleepPerformanceCard compact={true} />
```

### Full Dashboard
```typescript
import { SleepPerformanceDashboard } from '@/components/sleep/SleepPerformanceDashboard';

export function InsightsScreen() {
  return <SleepPerformanceDashboard />;
}
```

### Direct Hook Usage
```typescript
import { useSleepPerformanceCorrelation } from '@/hooks/useSleepPerformanceCorrelation';

export function CustomInsightDisplay() {
  const { insight, recommendations, correlationScore } = useSleepPerformanceCorrelation();
  
  return (
    <View>
      <Text>{insight.title}</Text>
      <Text>{insight.actionDescription}</Text>
      <Text>Score: {correlationScore}/100</Text>
    </View>
  );
}
```

## Correlation Logic Details

### Peak Performance Detection
Triggers when user has:
- Sleep debt ≤ 1 hour
- Activity level ≥ 80%
- **Result**: "En tu mejor momento" (At your best)

### Sleep Deprivation Alert
Triggers when:
- Sleep debt > 3 hours
- Activity drops < 50%
- **Result**: "Necesitas descansar" (You need rest) - CRITICAL

### Pushing Through Detection
Triggers when:
- Sleep debt > 3 hours
- Activity maintained ≥ 80%
- **Result**: Recognizes discipline but warns about accumulation

### Recovery Mode
Triggers when:
- Sleep debt 1-3 hours
- Activity < 50%
- **Result**: "Recuperándote" (Recovering)

## Data Sources

The correlations leverage three main hooks:
1. **useSleep**: Sleep duration, debt, quality scores
2. **useWorkout**: Workout history with volume/sets for quality estimation
3. **useSteps**: Daily activity percentage

## Calculation Methods

### Sleep Quality (7-day average)
```
- Excellent: ≥ 7.5h average
- Good: ≥ 7h
- Fair: ≥ 6h
- Poor: < 6h
```

### Workout Quality Estimation
Since `WorkoutHistory` doesn't have explicit quality:
```
Quality = 2 + (totalVolume + setCount) / 500
Capped at 5.0
```

### Activity Level
```
- High: ≥ 80% of daily step goal
- Moderate: 50-79%
- Low: < 50%
```

## Recommendation Generation

The hook generates contextual recommendations based on:
1. Sleep debt accumulation (> 2h triggers recovery message)
2. Activity-sleep mismatch (Good sleep + low activity)
3. Workout intensity trends (Recent workouts too mild)
4. Last night's quality (Score < 6/10)
5. Default: Consistency message if all metrics good

## Styling & Theming

Both components use the app's color system:
- `Colors.sleep`: Moon/sleep indicators
- `Colors.steps`: Activity/movement indicators
- `Colors.workout`: Exercise indicators
- `Colors.success/warning/error`: Severity indicators

Typography follows theme constants:
- `FontFamily.bold`: Titles and values
- `FontFamily.regular`: Descriptions
- `FontSize.md`: Primary text
- `FontSize.sm`: Secondary text

## Performance Considerations

- Hook uses `useMemo` to prevent unnecessary recalculations
- 7-day averages computed once per render cycle
- No excessive API calls - uses existing hook data
- Animations use `Animated` API for smooth transitions

## Future Enhancements

1. **Predictive Insights**: ML-based tomorrow's recommendation
2. **Historical Trends**: Charts showing correlation evolution
3. **Goal Integration**: Target-specific correlations
4. **Social Features**: Compare metrics with community averages
5. **Advanced Metrics**: Heart rate variability, REM tracking
6. **Notifications**: Alert when correlation crosses thresholds

## Testing

The components handle edge cases:
- Empty workout history → Uses default quality (3/5)
- Missing sleep data → Graceful degradation
- Zero activity → Still calculates correlations
- Undefined values → Safe defaults applied

## Accessibility

- All text content descriptive and self-explanatory
- Color not the only indicator (uses emojis + text)
- Touch targets adequate for interaction
- PropTypes validation for prop safety
