
'use client';

import { Card, Grid } from '@radix-ui/themes';
import Image from 'next/image';

import LoginForm from '@/components/LoginForm/LoginForm';
import Container from '@/components/Container/Container';
import Logo      from '@/components/Logo/Logo';
import Logotype from "@/components/Logotype/Logotype";
import { useAuth } from '@/lib/contexts/useAuth';

import styles from './page.module.css'

function LoginContent() {
  const { sent, setSent } = useAuth();

  return (
    <div className={styles.wrapper}>
      <Container className={styles.container}>
        <Card className={styles.card}>
            <Grid columns={{ initial : "1", md : "2"}}>
                <div className={styles.left}>
                    <Logo />
                    <h1 className={styles.title}>
                        <Logotype />
                    </h1>
                    <p className={styles.subtitle}>
                      {sent ? 'Check your email for the magic link!' : 'Sign in to access your pitch data'}
                    </p>

                    <LoginForm />

                    {/* <button onClick={e => setSent(!sent)} > toggle</button> */}
                </div>
                <div className={styles.right}>
                    <Image
                        src="/login-feature.jpg"
                        alt="Login Illustration"
                        width={600}
                        height={400}
                        priority
                    />
                </div>
            </Grid>
        </Card>
      </Container>
    </div>
  )
}

export default function LoginPage() {
  return <LoginContent />;
}