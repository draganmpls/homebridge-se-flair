from flair_api import make_client, Resource
from datetime import datetime
import os

CLIENT_ID = os.getenv("FLAIR_CLIENT_ID")
CLIENT_SECRET = os.getenv("FLAIR_CLIENT_SECRET")
API_ROOT = "https://api.flair.co"

if not CLIENT_ID or not CLIENT_SECRET:
    raise RuntimeError("FLAIR_CLIENT_ID and FLAIR_CLIENT_SECRET must be set")

# Custom resource wrappers
class VentState(Resource):
    @property
    def x(self):
        return datetime.strptime(self.attributes['created-at'], "%Y-%m-%dT%H:%M:%S.%f+00:00")

    @property
    def y(self):
        return self.attributes['percent-open']

class VentSensorReading(Resource):
    @property
    def x(self):
        return datetime.strptime(self.attributes['created-at'], "%Y-%m-%dT%H:%M:%S.%f+00:00")

    @property
    def y(self):
        return self.attributes['percent-open']

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
    exit()

structure = structures[0]
print(f"\n✅ Structure: {structure.attributes['name']} (ID: {structure.id})")

# Fetch vents in the structure
vents = structure.get_rel("vents")
if not vents:
    print("No vents found.")
    exit()

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
