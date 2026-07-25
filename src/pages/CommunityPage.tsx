import AdDevPointsCard from "../components/AdDevPointsCard";
import AdDevPointsHistory from "../components/AdDevPointsHistory";

import useAdDevPoints from "../hooks/useAdDevPoints";
import useAdDevPointsHistory from "../hooks/useAdDevPointsHistory";

export default function CommunityPage() {
  const { points } = useAdDevPoints();
  const { history } = useAdDevPointsHistory();

  return (
    <div style={{ padding: "20px" }}>
      <h1>👥 Community</h1>

      <AdDevPointsCard points={points} />

      <AdDevPointsHistory history={history} />
    </div>
  );
}
