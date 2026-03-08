import { Flex } from '@radix-ui/themes';


import SessionSummary from '@/components/SessionSummary/SessionSummary';
import SessionStats from '@/components/SessionStats/SessionStats';
import SessionNavigation from '@/components/SessionNavigation/SessionNavigation';
import Container from '@/components/Container/Container';

import SpeedGauge from '@/components/SpeedGauge/SpeedGauge';

import style from './page.module.css';


export default async function SessionPage({ params }: SessionPageProps) {
    const { session } = await params;
    const data = {
        meta : {
            player : 'Unknown Player',
            date : 'Unknown Date',
            startTime : 'Unknown Start Time',
            duration : 'Unknown Duration',

            sport : 'Unknown Sport',
            activity : 'Unknown Activity',
            unit : "mph",

            topSpeed : 'Unknown Top Speed',
            avgSpeed : 'Unknown Average Speed',
            medSpeed : 'Unknown Median Speed',
            fastestStrike : 'Unknown Fastest Strike',
        },

        session : []
    };

    return (
        <Container>
            <div className={style.topBar}>

                <h1 className={style.header}>
                    {data?.meta.player}
                </h1>

                {/* date */}
                <div className={style.date}>
                    <div>{data?.meta.date}</div>
                    <div>{data?.meta.startTime}</div>
                    <div>{data?.meta.duration} min</div>
                </div>

                <SessionNavigation session={session} inline={true} />

            </div>


            {data.length > 0 ? (
                <>
                    <SessionSummary
                        pitchCount={data?.session.length}
                        topSpeed={data?.meta.topSpeed}
                        avgSpeed={data?.meta.avgSpeed}
                        medSpeed={data?.meta.medSpeed}
                        unit={data?.meta.unit}
                        fastestStrike={data?.meta.fastestStrike}
                    />

                    <Flex className={style.gaugeStats} align="center">
                        <SpeedGauge speed={data?.meta.topSpeed} speeds={data?.session} unit={data?.meta.unit} />

                        <SessionStats speeds={data?.session} unit={data?.meta.unit} />
                    </Flex>

                </>
            ) : (
                <p>No data found for session: {session}</p>
            )}

            <SessionNavigation session={session} />
        </Container>
    );
}
