import { useSharedRatings } from "@baditaflorin/mesh-common";
import type { MeshConfig, YRoom } from "@baditaflorin/mesh-common";

type Props = { room: YRoom | null; config: MeshConfig };

export function Feature({ room, config }: Props) {
  const ratings = useSharedRatings(room);
  const mine = ratings.ratings.find((entry) => entry.peerId === room?.peerId);

  return (
    <main className="rating-board">
      <h1>{config.appName}</h1>
      <p className="lede">A five-star room temperature check with one rating per peer.</p>
      <p className="rating-summary" aria-live="polite">
        {ratings.average === null
          ? "No ratings yet"
          : `${ratings.average.toFixed(1)} / 5 from ${ratings.ratings.length} peer${ratings.ratings.length === 1 ? "" : "s"}`}
      </p>
      <div className="rating-buttons" aria-label="Choose a rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
            aria-pressed={mine?.value === value}
            className={mine?.value === value ? "rating selected" : "rating"}
            key={value}
            type="button"
            onClick={() => ratings.setMine(value)}
          >
            <span aria-hidden="true">★</span> {value}
          </button>
        ))}
      </div>
      <p className="feature-status">
        {room ? `Connected · ${room.peerCount} peer(s)` : "Connecting…"}
      </p>
    </main>
  );
}
