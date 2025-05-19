import requests

client_id = "bBal2B4NsVheVoRC9xAWrglAoBYlID5CkrFgisTm"
client_secret = "oNPQT4iz5jurWsb4nVdTYz04zoBvIyetMbhawsWIUaaiR3KeKaKWdcS4ryZO"

# Step 1: Get access token using OAuth2 Client Credentials
auth_response = requests.post("https://api.flair.co/oauth/token", data={
    "grant_type": "client_credentials",
    "client_id": client_id,
    "client_secret": client_secret,
})

if auth_response.status_code != 200:
    print("❌ Auth failed:", auth_response.status_code, auth_response.text)
    exit(1)

access_token = auth_response.json().get("access_token")
print("✅ Access token received.")

# Step 2: Use access token to fetch structures
headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get("https://api.flair.co/structures", headers=headers)

print("📦 Flair API response:")
print(response.status_code)
print(response.json())
