import Container from '@/components/Container/Container'
import PitchTracker from '@/components/PitchTracker/PitchTracker'

export const metadata = {
    title: 'Pitch Tracker',
}

export default function Page() {
    return (
        <Container width="flex">
            <h1>Pitch Tracker</h1>
            <PitchTracker />
        </Container>
    )
}
