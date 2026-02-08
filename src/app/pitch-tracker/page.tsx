import PitchTracker from '@/components/PitchTracker/PitchTracker'

export const metadata = {
    title: 'Pitch Tracker',
}

export default function Page() {
    return (
        <main style={{ padding: 20 }}>
            <h1>Pitch Tracker</h1>
            <PitchTracker />
        </main>
    )
}
