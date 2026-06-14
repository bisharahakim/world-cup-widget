// World Cup widget for Übersicht
// Fetches today's FIFA World Cup matches from ESPN's public endpoint.
// No API key required.

export const command =
  "curl -s 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'"

export const refreshFrequency = 30000 // 30 seconds

export const className = `
  top: 20px;
  left: 20px;
  width: 340px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  color: #fff;
  background: rgba(20, 20, 25, 0.82);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.9);
  }

  .date {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }

  .game {
    display: flex;
    align-items: center;
    padding: 9px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .game:last-child {
    border-bottom: none;
    padding-bottom: 2px;
  }

  .team {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 8px;
    min-width: 0;
  }

  .team.away {
    justify-content: flex-end;
  }

  .team-name {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .logo {
    width: 22px;
    height: 22px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .score-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 78px;
    padding: 0 8px;
  }

  .score {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 1px;
    font-variant-numeric: tabular-nums;
  }

  .kickoff {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    font-variant-numeric: tabular-nums;
  }

  .status {
    font-size: 9.5px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 3px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .live {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #ff3b3b;
    font-weight: 700;
  }

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff3b3b;
    box-shadow: 0 0 6px rgba(255, 59, 59, 0.7);
    animation: wc-pulse 1.3s ease-in-out infinite;
  }

  @keyframes wc-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.75); }
  }

  .empty {
    text-align: center;
    padding: 14px 0 4px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }

  .error {
    color: #ff8b8b;
  }
`

const formatKickoff = (iso) => {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const isTomorrow = (iso) => {
  const d = new Date(iso)
  const now = new Date()
  const tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return d.toDateString() === tmr.toDateString()
}

const isInWindow = (iso) => {
  const d = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7, 0, 0)
  return d >= startOfToday && d < cutoff
}

const renderGame = (event) => {
  const comp = event.competitions && event.competitions[0]
  if (!comp) return null
  const home = comp.competitors.find((c) => c.homeAway === 'home')
  const away = comp.competitors.find((c) => c.homeAway === 'away')
  if (!home || !away) return null

  const state = event.status && event.status.type && event.status.type.state // 'pre' | 'in' | 'post'
  const detail = (event.status && event.status.type && event.status.type.shortDetail) || ''
  const isLive = state === 'in'
  const isPre = state === 'pre'

  const homeName = home.team.abbreviation || home.team.shortDisplayName || home.team.displayName
  const awayName = away.team.abbreviation || away.team.shortDisplayName || away.team.displayName

  return (
    <div className="game" key={event.id}>
      <div className="team home">
        <img className="logo" src={home.team.logo} />
        <span className="team-name">{homeName}</span>
      </div>
      {isPre ? (
        <div className="score-block">
          <div className="kickoff">{formatKickoff(event.date)}</div>
          <div className="status">{isTomorrow(event.date) ? 'Tomorrow' : 'Kickoff'}</div>
        </div>
      ) : (
        <div className="score-block">
          <div className="score">{home.score} – {away.score}</div>
          <div className="status">
            {isLive ? (
              <span className="live"><span className="live-dot" />{detail || 'Live'}</span>
            ) : (
              detail || 'Full Time'
            )}
          </div>
        </div>
      )}
      <div className="team away">
        <span className="team-name">{awayName}</span>
        <img className="logo" src={away.team.logo} />
      </div>
    </div>
  )
}

export const render = ({ output, error }) => {
  const todayStr = new Date().toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const header = (
    <div className="header">
      <div className="title">⚽ World Cup</div>
      <div className="date">{todayStr}</div>
    </div>
  )

  if (error) {
    return (
      <div>
        {header}
        <div className="empty error">Couldn’t reach the scores API</div>
      </div>
    )
  }

  let data
  try {
    data = JSON.parse(output)
  } catch (e) {
    return (
      <div>
        {header}
        <div className="empty">Loading…</div>
      </div>
    )
  }

 const events = (data.events || []).filter((e) => isInWindow(e.date))

  return (
    <div>
      {header}
      {events.length === 0 ? (
        <div className="empty">No matches today</div>
      ) : (
        events.map(renderGame)
      )}
    </div>
  )
}
