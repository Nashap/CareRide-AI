import google.generativeai as genai
import time

print("configuring...")
genai.configure(api_key="")

print("creating model...")
start = time.time()
model = genai.GenerativeModel("gemini-2.5-flash")
end = time.time()
print(f"model created in {end - start} seconds")

print("done")
