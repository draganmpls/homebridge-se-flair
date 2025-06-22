"""Fetch and display the current status of vents from the Flair API."""

from datetime import datetime
import os
import sys
from flair_api import make_client, Resource

CLIENT_ID = os.getenv("FLAIR_CLIENT_ID")
CLIENT_SECRET = os.getenv("FLAIR_CLIENT_SECRET")
API_ROOT = "https://api.flair.co"

if not CLIENT_ID or not CLIENT_SECRET:
    raise RuntimeError("FLAIR_CLIENT_ID and FLAIR_CLIENT_SECRET must be set")

# Custom resource wrappers
class VentState(Resource):
    """Wrapper for vent state readings."""

    @property
    def x(self):
        """Timestamp of the state sample as a ``datetime``."""
        return datetime.strptime(
            self.attributes["created-at"], "%Y-%m-%dT%H:%M:%S.%f+00:00"
        )

    @property
    def y(self):
        """Open percentage for the vent state."""
        return self.attributes["percent-open"]

class VentSensorReading(Resource):
    """Wrapper for vent sensor readings."""

    @property
    def x(self):
        """Timestamp of the sensor reading as a ``datetime``."""
        return datetime.strptime(
            self.attributes["created-at"], "%Y-%m-%dT%H:%M:%S.%f+00:00"
        )

    @property
    def y(self):
        """Open percentage value from the sensor reading."""
        return self.attributes["percent-open"]

# Initialize Flair client with resource mappers
client = make_client(
    CLIENT_ID,
    CLIENT_SECRET,
    API_ROOT,
    mapper={
        "vent-sensor-readings": VentSensorReading,
        "vent-states": VentState,
    }
)

# Fetch all structures
structures = client.get("structures")
if not structures:
    print("No structures found.")
    sys.exit()

structure = structures[0]
print(f"\n✅ Structure: {structure.attributes['name']} (ID: {structure.id})")

# Fetch vents in the structure
vents = structure.get_rel("vents")
if not vents:
    print("No vents found.")
    sys.exit()

for vent in vents:
    name = vent.attributes.get("name")
    serial = vent.attributes.get("serial-number")
    print(f"\n🌀 Vent: {name} (Serial: {serial})")

    current_state = vent.get_rel("current-state")
    print(f"   - Current Open %: {current_state.attributes.get('percent-open')}")

    # Optional: show most recent sensor reading
    readings = vent.get_rel("sensor-readings")
    if readings:
        recent = readings[0]
        print(f"   - Sensor: {recent.y}% at {recent.x}")
