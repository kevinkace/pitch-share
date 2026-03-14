'use client';

import { useState } from 'react';
import { Button, TextField, Text, Callout, Flex } from '@radix-ui/themes';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/useAuth';

import AnimatedEnvelope from '@/components/AnimatedEnvelope/AnimatedEnvelope';

import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { sent, setSent } = useAuth();

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the magic link!');
        setSent(true);
        setEmail('');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div  className={sent ? styles.sent : styles.unsent }>
      <div className={styles.msg}>
        {sent &&<AnimatedEnvelope />}
      </div>

      <form onSubmit={handleLogin} className={styles.form}>
        <Flex direction="column" gap="4">
          <TextField.Root
              size="3"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
          >
          </TextField.Root>

          {error && (
            <Callout.Root color="red" size="1">
              <Callout.Icon>
                ⚠️
              </Callout.Icon>
              <Callout.Text>
                {error}
              </Callout.Text>
            </Callout.Root>
          )}

          {message && (
            <Callout.Root color="blue" size="1">
              <Callout.Icon>
                ✉️
              </Callout.Icon>
              <Callout.Text>
                {message}
              </Callout.Text>
            </Callout.Root>
          )}

          <Button
            type="submit"
            disabled={loading}
            size="3"
            style={{ width: '100%' }}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </Button>

          <Text size="2" color="gray" align="center">
            {"We'll send you a secure magic link to sign in without a password."}
          </Text>
        </Flex>
      </form>
    </div>
  );
}