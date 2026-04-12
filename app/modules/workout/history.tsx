import React from 'react';
import { Redirect } from 'expo-router';

export default function HistoryRedirect() {
	return <Redirect href={'/modules/workout/insights?tab=history' as any} />;
}
