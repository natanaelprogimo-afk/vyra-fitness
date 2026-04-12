import React from 'react';
import { Redirect } from 'expo-router';

export default function PrsRedirect() {
  return <Redirect href={'/modules/workout/insights?tab=prs' as any} />;
}
