export function hazardLevelColor(level: string): string {
    const colors: Record<string, string> = {
        LOW: '#22c55e',
        GUARDED: '#3b82f6',
        ELEVATED: '#f59e0b',
        HIGH: '#f97316',
        SEVERE: '#dc2626',
    };
    return colors[level] ?? '#64748b';
}
