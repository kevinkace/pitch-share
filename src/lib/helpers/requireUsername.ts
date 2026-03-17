// Helper function to access the requireUsername functionality from anywhere
export function requireUsername(action: () => void): boolean {
    if (typeof window !== 'undefined' && (window as any).requireUsernameForAction) {
        return (window as any).requireUsernameForAction(action);
    }
    // Fallback: if username requirement system isn't available, just execute the action
    action();
    return true;
}