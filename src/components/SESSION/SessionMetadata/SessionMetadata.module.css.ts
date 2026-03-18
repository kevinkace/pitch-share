// Styles for SessionMetadata ImageResponse
// Note: ImageResponse requires inline styles, so these are style objects

export const imageStyles = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '32px',
  },

  playerName: {
    fontSize: '80px',
    fontWeight: 'bold',
    margin: 0,
    textAlign: 'center' as const,
  },

  dateSection: {
    display: 'flex',
    gap: '20px',
    marginBottom: '60px',
    fontSize: '32px',
    color: '#888',
  },

  statsGrid: {
    display: 'flex',
    width: '90%',
    gap: '40px',
    marginBottom: '40px',
  },

  statCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    minWidth: '120px',
  },

  statValue: {
    display: "flex",
    fontSize: '80px',
    fontWeight: 'bold',
    lineHeight: '1',
    alignItems: 'flex-end',
  },


  statUnit: {
    fontSize: '16px',
    color: '#aaa',
    marginBottom: '8px',
  },

  statLabel: {
    display: "flex",
    fontSize: '32px',
    color: '#aaa',
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
  },

  footer: {
    position: 'absolute' as const,
    bottom: '40px',
    fontSize: '22px',
    color: '#666',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};