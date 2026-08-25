import {
  MeshButton,
  MeshPresence,
  MeshStatusPill,
  MeshSurface,
  useSharedRatings,
} from "@baditaflorin/mesh-common";
import type { MeshConfig, YRoom } from "@baditaflorin/mesh-common";

type Props = { room: YRoom | null; config: MeshConfig };

const RATING_OPTIONS = [
  { value: 1, label: "Tense", detail: "Needs attention" },
  { value: 2, label: "Uneasy", detail: "Not quite there" },
  { value: 3, label: "Mixed", detail: "A balanced read" },
  { value: 4, label: "Good", detail: "Moving well" },
  { value: 5, label: "Strong", detail: "In a great place" },
] as const;

function readoutFor(average: number | null): string {
  if (average === null) return "Awaiting the first signal";
  if (average < 2) return "The room needs attention";
  if (average < 3) return "The room is still finding its footing";
  if (average < 4) return "The room has a mixed read";
  if (average < 4.6) return "The room is moving well";
  return "The room is in a strong place";
}

export function Feature({ room, config }: Props) {
  const ratings = useSharedRatings(room);
  const mine = ratings.ratings.find((entry) => entry.peerId === room?.peerId);
  const responseCount = ratings.ratings.length;
  // Awareness is the live connection source of truth; visible shared signals
  // are a useful lower bound while a browser's awareness transport settles.
  const peopleHere = Math.max(room ? room.peerCount + 1 : 1, responseCount);
  const counts = RATING_OPTIONS.map(
    ({ value }) => ratings.ratings.filter((entry) => entry.value === value).length,
  );
  const average = ratings.average;
  const roundedAverage = average === null ? 0 : Math.round(average);
  const responseLabel = responseCount === 1 ? "1 response" : `${responseCount} responses`;
  const selectionMessage = mine
    ? `Your ${mine.value} / 5 signal is live. You can change it whenever the room shifts.`
    : room
      ? "Choose the signal that best reflects the room right now."
      : "Connecting to the room so your signal can be shared.";

  return (
    <main className="rating-workspace">
      <div className="rating-frame">
        <header className="rating-intro">
          <div className="rating-intro-copy">
            <p className="rating-kicker">Live team signal</p>
            <h1>How is the room feeling?</h1>
            <p className="rating-lede">{config.description} No names, no tallying, no ceremony.</p>
          </div>
          <div className="rating-intro-status">
            <MeshPresence
              count={peopleHere}
              label={peopleHere === 1 ? "active device" : "active devices"}
              state={room ? "connected" : "connecting"}
              size="md"
              announce="polite"
            />
            <MeshStatusPill tone={room ? "live" : "warning"} dot>
              {room ? "Live board" : "Joining room"}
            </MeshStatusPill>
          </div>
        </header>

        <div className="rating-layout">
          <MeshSurface
            as="section"
            tone="raised"
            padding="lg"
            className="rating-console"
            aria-labelledby="your-signal-heading"
          >
            <div className="rating-console-heading">
              <div>
                <p className="rating-section-label">Your signal</p>
                <h2 id="your-signal-heading">Set the room temperature.</h2>
              </div>
              <p className="rating-privacy">One response per device</p>
            </div>

            <div className="rating-scale-guide" aria-hidden="true">
              <span>Needs attention</span>
              <span>Strong</span>
            </div>
            <div className="rating-buttons" role="group" aria-label="Choose a room rating">
              {RATING_OPTIONS.map((option) => {
                const selected = mine?.value === option.value;
                return (
                  <MeshButton
                    aria-label={`Rate ${option.value} star${option.value === 1 ? "" : "s"}`}
                    aria-pressed={selected}
                    className="rating-option"
                    disabled={!room}
                    key={option.value}
                    size="lg"
                    variant={selected ? "primary" : "secondary"}
                    onClick={() => ratings.setMine(option.value)}
                  >
                    <span className="rating-option-number" aria-hidden="true">
                      {option.value}
                    </span>
                    <span className="rating-option-copy">
                      <span className="rating-option-label">{option.label}</span>
                      <span className="rating-option-detail">{option.detail}</span>
                    </span>
                  </MeshButton>
                );
              })}
            </div>
            <p className="rating-selection" aria-live="polite">
              {selectionMessage}
            </p>
          </MeshSurface>

          <aside className="rating-overview" aria-label="Shared room reading">
            <MeshSurface
              as="section"
              tone="accent"
              padding="lg"
              className="rating-readout"
              aria-labelledby="group-reading-heading"
            >
              <div className="rating-readout-header">
                <p className="rating-section-label">Group reading</p>
                <span className="rating-response-count">{responseLabel}</span>
              </div>
              <div className="rating-score-line">
                <output
                  id="group-reading-heading"
                  className={average === null ? "rating-score is-empty" : "rating-score"}
                  aria-live="polite"
                >
                  {average === null ? "—" : average.toFixed(1)}
                </output>
                <span className="rating-score-denominator">/ 5</span>
              </div>
              <p className="rating-readout-message" aria-live="polite">
                {readoutFor(average)}
              </p>
              <div
                className="rating-meter"
                aria-label={
                  average === null
                    ? "No room rating yet"
                    : `Average room rating ${average.toFixed(1)} out of 5`
                }
                role="img"
              >
                {RATING_OPTIONS.map(({ value }) => (
                  <span className={value <= roundedAverage ? "is-filled" : undefined} key={value} />
                ))}
              </div>
            </MeshSurface>

            <MeshSurface
              as="section"
              tone="quiet"
              padding="md"
              className="rating-distribution"
              aria-labelledby="signal-spread-heading"
            >
              <div className="rating-distribution-header">
                <h2 id="signal-spread-heading">Signal spread</h2>
                <span>{responseLabel}</span>
              </div>
              <div className="rating-distribution-list">
                {RATING_OPTIONS.map((option, index) => {
                  const count = counts[index] ?? 0;
                  const share = responseCount ? (count / responseCount) * 100 : 0;
                  return (
                    <div className="rating-distribution-row" key={option.value}>
                      <span className="rating-distribution-value">{option.value}</span>
                      <div
                        aria-label={`${option.label}: ${count} response${count === 1 ? "" : "s"}`}
                        aria-valuemax={responseCount || 1}
                        aria-valuemin={0}
                        aria-valuenow={count}
                        className="rating-distribution-track"
                        role="meter"
                      >
                        <span style={{ width: `${share}%` }} />
                      </div>
                      <span className="rating-distribution-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </MeshSurface>
          </aside>
        </div>

        <p className="rating-footnote">
          The board is shared with this room only. Changing your signal updates the live reading for
          everyone here.
        </p>
      </div>
    </main>
  );
}
