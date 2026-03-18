
'use client';

import Link from "next/link";
import Image from 'next/image';

import { Card, Grid, Flex } from '@radix-ui/themes';

import LoginForm from '@/components/LoginForm/LoginForm';
import Container from '@/components/Container/Container';
import Logo      from '@/components/LAYOUT/Logo/Logo';
import Logotype from "@/components/LAYOUT/Logotype/Logotype";

import { useAuth } from '@/lib/contexts/AuthContext';

import styles from './page.module.css';

function LoginContent() {
  const { sent, setSent } = useAuth();

  return (
    <div className={styles.wrapper}>
      <Container className={styles.container}>
        <Card className={styles.card}>
            <Grid columns={{ initial : "1", md : "2"}}>
                <div className={styles.left}>
                    <Flex asChild align="center" direction="column">
                        <Link href="/">
                            <Logo size="4"/>
                            <h1 className={styles.title}>
                                <Logotype />
                            </h1>
                        </Link>
                    </Flex>


                    <p className={styles.subtitle}>
                      {sent ? 'Check your email for the magic link!' : 'Sign in to track your pitch data'}
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