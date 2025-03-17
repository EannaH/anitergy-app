import EnergyBar from "./EnergyBar"; // Import the EnergyBar component

export default function EnergyDashboard() {
  const testEnergyLevel = 65; // Temporary value, we'll hook real data later

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: "20px",
      padding: "10px",
      border: "1px solid #ccc"
    }}>
      {/* Placeholder for Circular Gauge */}
      <div style={{
        width: "150px",
        height: "150px",
        border: "2px dashed #999",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "20px"
      }}>
        <p style={{ color: "#666", textAlign: "center" }}>
          Circular Gauge<br />
          (Placeholder)
        </p>
      </div>

      {/* Energy Bar Component */}
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
        Energy Level: {testEnergyLevel}%
      </p>
      <EnergyBar energyLevel={testEnergyLevel} />
    </div>
  );
}
